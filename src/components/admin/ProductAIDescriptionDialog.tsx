import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Sparkles, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ProductColorVariant } from "@/lib/productColorVariants";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type AIDescriptionTarget = "description" | "long_description";

export type ProductAIDescriptionContext = {
  title: string;
  category: string;
  featuredSubcategory?: string;
  keyFeatures?: string;
  description?: string;
  longDescription?: string;
  price?: string;
  currency?: string;
  sku?: string;
  warehouse?: string;
  images: string[];
  colorVariants: ProductColorVariant[];
};

type ProductAIDescriptionDialogProps = {
  open: boolean;
  target: AIDescriptionTarget;
  context: ProductAIDescriptionContext;
  onOpenChange: (open: boolean) => void;
  onApply: (target: AIDescriptionTarget, value: string) => void;
  onLongDescriptionMediaAdd?: (html: string) => void;
};

type AIImageRequest = {
  id?: string;
  title?: string;
  purpose?: string;
  section_heading?: string;
  section_copy?: string;
  marketing_copy?: string;
  caption?: string;
  prompt: string;
};

type AIGeneratedImage = AIImageRequest & {
  dataUrl?: string;
  url?: string;
  revised_prompt?: string;
};

type AIResponse = {
  description?: string;
  long_description?: string;
  image_requests?: AIImageRequest[];
  generated_images?: AIGeneratedImage[];
  warning?: string;
  error?: string;
};

type AIGuidance = {
  idealBuyer: string;
  visibleDetails: string;
  materials: string;
  dimensions: string;
  useCase: string;
  tone: string;
  layoutOrder: string;
  focus: string;
  videoLinks: string;
  extraMediaNotes: string;
  generateImageIdeas: boolean;
};

const toneOptions = [
  "Premium and polished",
  "Clear and practical",
  "Warm showroom consultant",
  "Corporate procurement",
  "Luxury home styling",
];

const defaultGuidance: AIGuidance = {
  idealBuyer: "",
  visibleDetails: "",
  materials: "",
  dimensions: "",
  useCase: "",
  tone: toneOptions[0],
  layoutOrder: "Lead with the strongest buying reason, pair visuals with finish or scale copy, place specifications near the buying decision, close with delivery and quote reassurance",
  focus: "",
  videoLinks: "",
  extraMediaNotes: "",
  generateImageIdeas: false,
};

const uniqueImages = (values: string[]) => Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));

const absolutizeImageUrl = (image: string) => {
  if (/^(https?:|data:image\/)/i.test(image)) return image;
  if (typeof window === "undefined") return image;

  try {
    return new URL(image, window.location.origin).href;
  } catch {
    return image;
  }
};

const imageLabel = (image: string, index: number) => {
  try {
    const path = new URL(absolutizeImageUrl(image)).pathname;
    const fileName = decodeURIComponent(path.split("/").filter(Boolean).pop() || "");
    return fileName || `Image ${index + 1}`;
  } catch {
    return image.split("/").filter(Boolean).pop() || `Image ${index + 1}`;
  }
};

const parseLines = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const imageMarketingCopy = (
  context: ProductAIDescriptionContext,
  guidance: Pick<AIGuidance, "tone" | "materials" | "useCase" | "idealBuyer">,
  purpose: string,
) => {
  const normalized = purpose.toLowerCase();
  const productName = context.title || "this product";
  const audience = guidance.idealBuyer || "the intended room";
  const materials = guidance.materials || "the finish, proportions, and construction";
  const useCase = guidance.useCase || "daily use";

  if (/close|detail|texture|stitch|finish|hardware|grain|upholstery|material/i.test(normalized)) {
    return {
      heading: "A Closer Look at the Finish",
      copy: `This detail view helps buyers judge the quality signals that matter up close: ${materials}. It gives ${productName} more credibility by showing the tactile finish, edge treatment, and construction details that support confident buying.`,
    };
  }

  if (/side|profile|angle|three-quarter|3\/4|different angle|back|rear/i.test(normalized)) {
    return {
      heading: "See the Shape Before It Arrives",
      copy: `This angle helps shoppers understand the profile, depth, and scale of ${productName} before they commit. It is especially useful for ${audience}, where proportion and placement need to feel right from every side.`,
    };
  }

  if (/lifestyle|room|office|showroom|setting|space|environment/i.test(normalized)) {
    return {
      heading: "Picture It in the Right Setting",
      copy: `This scene connects ${productName} to ${useCase}, helping customers imagine how it will look and feel once placed in a real workspace or interior. It turns the product from a catalogue item into a practical buying decision.`,
    };
  }

  return {
    heading: "Built for Confident Product Selection",
    copy: `This supporting view gives customers another reason to trust ${productName}. It clarifies the visual details, proportions, and practical buying cues that help them decide whether it fits their space and expectations.`,
  };
};

const buildClientImageRequests = (
  context: ProductAIDescriptionContext,
  guidance: AIGuidance,
): AIImageRequest[] => {
  const requestedShots = parseLines(guidance.extraMediaNotes);
  const defaultShots = guidance.generateImageIdeas
    ? [
        "front three-quarter showroom view",
        "side profile showing scale and proportions",
        "close-up detail of finish, upholstery, hardware, or texture",
      ]
    : [];
  const shots = (requestedShots.length ? requestedShots : defaultShots).slice(0, 4);

  return shots.map((shot, index) => {
    const purpose = shot.replace(/^(ask for|generate|request|add)\s+/i, "").trim() || shot;
    const title = purpose.replace(/\.$/, "").split(/\s+/).slice(0, 8).join(" ");
    const marketing = imageMarketingCopy(context, guidance, purpose);

    return {
      id: `client-image-request-${index + 1}`,
      title: title || `Supporting image ${index + 1}`,
      purpose,
      section_heading: marketing.heading,
      section_copy: marketing.copy,
      prompt: [
        `Photorealistic premium furniture product image for ${context.title || "this product"}.`,
        `Create: ${purpose}.`,
        guidance.materials ? `Materials and finish: ${guidance.materials}.` : "",
        guidance.dimensions ? `Specifications or scale notes: ${guidance.dimensions}.` : "",
        guidance.idealBuyer ? `Intended room or buyer: ${guidance.idealBuyer}.` : "",
        guidance.visibleDetails ? `Preserve visible details where relevant: ${guidance.visibleDetails}.` : "",
        "Clean showroom lighting, accurate proportions, no people, no text overlays, no watermark.",
      ].filter(Boolean).join(" "),
    };
  });
};

const sanitizeFileName = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "ai-product-image";

const dataUrlToFile = (dataUrl: string, fileName: string) => {
  const [header, encoded] = dataUrl.split(",");
  const mime = header.match(/^data:(.*?);base64$/)?.[1] || "image/png";
  const binary = window.atob(encoded || "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], fileName, { type: mime });
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

type LongDescriptionMediaItem = {
  url: string;
  title?: string;
  purpose?: string;
  prompt?: string;
  section_heading?: string;
  section_copy?: string;
  marketing_copy?: string;
  caption?: string;
};

const buildLongDescriptionMediaHtml = (items: LongDescriptionMediaItem[], context: ProductAIDescriptionContext, guidance: AIGuidance) =>
  items
    .map((item, index) => {
      const title = item.title || item.purpose || "Supporting product image";
      const marketing = imageMarketingCopy(context, guidance, item.purpose || item.title || "");
      const heading = item.section_heading || marketing.heading || title;
      const copy = item.section_copy || item.marketing_copy || marketing.copy;
      const caption = item.caption || item.purpose || title;
      const layout = index % 2 === 0 ? "media-left" : "media-right";
      return [
        `<div data-ai-layout="${layout}" data-ai-section="supporting media">`,
        '<div data-ai-slot="media">',
        "<figure>",
        `<img src="${escapeHtml(item.url)}" alt="${escapeHtml(title)}" />`,
        `<figcaption>${escapeHtml(caption)}</figcaption>`,
        "</figure>",
        "</div>",
        '<div data-ai-slot="copy">',
        `<h3>${escapeHtml(heading)}</h3>`,
        `<p>${escapeHtml(copy)}</p>`,
        "</div>",
        "</div>",
      ].join("");
    })
    .join("");

const ProductAIDescriptionDialog = ({
  open,
  target,
  context,
  onOpenChange,
  onApply,
  onLongDescriptionMediaAdd,
}: ProductAIDescriptionDialogProps) => {
  const { toast } = useToast();
  const [guidance, setGuidance] = useState<AIGuidance>(defaultGuidance);
  const [generating, setGenerating] = useState(false);
  const [mediaResult, setMediaResult] = useState<{
    imageRequests: AIImageRequest[];
    generatedImages: AIGeneratedImage[];
    warning?: string;
    baseLongDescription: string;
  } | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const isLongDescription = target === "long_description";
  const allImages = useMemo(
    () => uniqueImages([
      ...context.images,
      ...context.colorVariants.flatMap((variant) => variant.images),
    ]),
    [context.colorVariants, context.images],
  );
  const imageUrls = useMemo(() => allImages.map(absolutizeImageUrl), [allImages]);

  useEffect(() => {
    if (!open) return;
    setGuidance({
      ...defaultGuidance,
      visibleDetails: allImages.length
        ? "Use the uploaded images to identify the visible shape, finish, color, upholstery, storage, hardware, and product proportions."
        : "",
      focus: isLongDescription ? "Buying confidence, product fit, finish, specifications, and showroom-ready use cases." : "",
    });
  }, [allImages.length, isLongDescription, open]);

  const updateGuidance = <K extends keyof AIGuidance>(key: K, value: AIGuidance[K]) => {
    setGuidance((current) => ({ ...current, [key]: value }));
  };

  const uploadImageFile = async (file: File, label: string) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `products/ai-${Date.now()}-${sanitizeFileName(label)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("property-images").upload(path, file, { upsert: false });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("property-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const finishMediaReview = () => {
    setMediaResult(null);
    onOpenChange(false);
  };

  const addGeneratedImages = async () => {
    if (!mediaResult?.generatedImages.length || !onLongDescriptionMediaAdd) return;

    setUploadingMedia(true);
    try {
      const mediaItems: LongDescriptionMediaItem[] = [];
      for (const image of mediaResult.generatedImages) {
        let url = "";
        if (image.dataUrl) {
          const file = dataUrlToFile(image.dataUrl, `${sanitizeFileName(image.title || image.purpose || "ai-product-image")}.png`);
          url = await uploadImageFile(file, image.title || image.purpose || "AI product image");
        } else if (image.url) {
          url = image.url;
        }

        if (url) {
          mediaItems.push({
            url,
            title: image.title,
            purpose: image.purpose,
            prompt: image.revised_prompt || image.prompt,
            section_heading: image.section_heading,
            section_copy: image.section_copy,
            marketing_copy: image.marketing_copy,
            caption: image.caption,
          });
        }
      }

      if (mediaItems.length) {
        onLongDescriptionMediaAdd([mediaResult.baseLongDescription, buildLongDescriptionMediaHtml(mediaItems, context, guidance)].filter(Boolean).join(""));
        toast({
          title: "Generated images inserted",
          description: `${mediaItems.length} image(s) added to the long description.`,
        });
      }
      finishMediaReview();
    } catch (error) {
      toast({
        title: "Could not add generated images",
        description: error instanceof Error ? error.message : "Upload failed.",
        variant: "destructive",
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const uploadRequestedImages = async (files: FileList | null, request: AIImageRequest) => {
    if (!files?.length || !onLongDescriptionMediaAdd) return;

    const selectedFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!selectedFiles.length) {
      toast({ title: "Choose image files", variant: "destructive" });
      return;
    }

    setUploadingMedia(true);
    try {
      const mediaItems: LongDescriptionMediaItem[] = [];
      for (const file of selectedFiles) {
        mediaItems.push({
          url: await uploadImageFile(file, request.title || request.purpose || file.name),
          title: request.title || file.name,
          purpose: request.purpose,
          prompt: request.prompt,
          section_heading: request.section_heading,
          section_copy: request.section_copy,
          marketing_copy: request.marketing_copy,
          caption: request.caption,
        });
      }
      const nextLongDescription = [
        mediaResult?.baseLongDescription,
        buildLongDescriptionMediaHtml(mediaItems, context, guidance),
      ].filter(Boolean).join("");
      onLongDescriptionMediaAdd(nextLongDescription);
      setMediaResult((current) => current ? { ...current, baseLongDescription: nextLongDescription } : current);
      toast({
        title: "Requested images inserted",
        description: `${mediaItems.length} image(s) added to the long description.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload the requested image.",
        variant: "destructive",
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const generate = async () => {
    if (!context.title.trim()) {
      toast({ title: "Add a product name first", variant: "destructive" });
      return;
    }

    if (!context.category.trim()) {
      toast({ title: "Choose a product category first", variant: "destructive" });
      return;
    }

    if (!imageUrls.length && !guidance.visibleDetails.trim() && !guidance.extraMediaNotes.trim()) {
      toast({
        title: "Add image context",
        description: "Upload product images or describe what the AI should see before generating copy.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    const { data, error } = await supabase.functions.invoke("generate-product-description", {
      body: {
        mode: target,
        name: context.title,
        category: context.category,
        featuredSubcategory: context.featuredSubcategory || "",
        features: context.keyFeatures || "",
        description: context.description || "",
        long_description: context.longDescription || "",
        price: context.price || "",
        currency: context.currency || "",
        sku: context.sku || "",
        warehouse: context.warehouse || "",
        imageUrls,
        imageLabels: imageUrls.map(imageLabel),
        colorVariants: context.colorVariants.map((variant) => ({
          name: variant.name,
          hex: variant.hex,
          image_count: variant.images.length,
        })),
        answers: {
          ...guidance,
          videoLinks: parseLines(guidance.videoLinks),
        },
      },
    });
    setGenerating(false);

    const response = data as AIResponse | null;
    if (error || response?.error) {
      toast({
        title: "AI error",
        description: response?.error || error?.message || "Could not generate product copy.",
        variant: "destructive",
      });
      return;
    }

    const generated = isLongDescription
      ? response?.long_description || response?.description || ""
      : response?.description || response?.long_description || "";

    if (!generated.trim()) {
      toast({ title: "AI returned no text", variant: "destructive" });
      return;
    }

    onApply(target, generated);
    const hasImageIntent = guidance.generateImageIdeas || Boolean(guidance.extraMediaNotes.trim());
    const fallbackImageRequests = hasImageIntent ? buildClientImageRequests(context, guidance) : [];
    const imageRequests = response?.image_requests?.length ? response.image_requests : fallbackImageRequests;
    const generatedImages = response?.generated_images || [];

    if (hasImageIntent || imageRequests.length || generatedImages.length) {
      setMediaResult({
        imageRequests,
        generatedImages,
        warning: response?.warning,
        baseLongDescription: isLongDescription ? generated : context.longDescription || "",
      });
      toast({ title: isLongDescription ? "Long description generated" : "Description generated", description: "Review the supporting image workflow before closing." });
      return;
    }

    toast({ title: isLongDescription ? "Long description generated" : "Description generated" });
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="admin-workspace max-h-[92vh] max-w-5xl overflow-y-auto border-grid bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[-0.03em]">
            {isLongDescription ? "Add long description using AI" : "Add description using AI"}
          </DialogTitle>
          <DialogDescription>
            Answer the product questions below so the AI can combine catalogue details, uploaded images, and selling priorities.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="space-y-4">
            <div className="border border-grid/25 bg-background p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-label">Image review</p>
                  <p className="mt-1 text-sm text-muted-foreground">{imageUrls.length} uploaded image(s)</p>
                </div>
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>

              {!imageUrls.length ? (
                <div className="flex min-h-36 items-center justify-center border border-dashed border-grid/35 text-center text-sm text-muted-foreground">
                  Upload images first, or describe the product visuals in the questions.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {imageUrls.slice(0, 6).map((image, index) => (
                    <div key={`${image}-${index}`} className="overflow-hidden border border-grid/25 bg-muted">
                      <img src={image} alt={imageLabel(image, index)} className="aspect-square w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {!!context.colorVariants.length && (
                <div className="mt-4 space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-label">Color variants</p>
                  <div className="flex flex-wrap gap-2">
                    {context.colorVariants.map((variant) => (
                      <span key={variant.id} className="inline-flex items-center gap-2 border border-grid/25 bg-card px-2 py-1 text-xs text-muted-foreground">
                        <span className="h-3 w-3 border border-grid/25" style={{ backgroundColor: variant.hex }} />
                        {variant.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3 border border-grid/25 bg-background p-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-label">Product context</p>
                <h3 className="mt-2 font-serif text-xl text-foreground">{context.title || "Unnamed product"}</h3>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div>Category: {context.category || "Not selected"}</div>
                {context.featuredSubcategory && <div>Featured: {context.featuredSubcategory}</div>}
                {context.sku && <div>SKU: {context.sku}</div>}
                {context.price && <div>Price: {[context.currency, context.price].filter(Boolean).join(" ")}</div>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Ideal buyer or room</Label>
                <Input
                  value={guidance.idealBuyer}
                  onChange={(event) => updateGuidance("idealBuyer", event.target.value)}
                  placeholder="e.g. executive office, boardroom, reception"
                />
              </div>
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={guidance.tone} onValueChange={(value) => updateGuidance("tone", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {toneOptions.map((tone) => <SelectItem key={tone} value={tone}>{tone}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Materials, finish, or color</Label>
                <Input
                  value={guidance.materials}
                  onChange={(event) => updateGuidance("materials", event.target.value)}
                  placeholder="e.g. leather, mesh, mahogany, chrome base"
                />
              </div>
              <div className="space-y-2">
                <Label>Dimensions or specifications</Label>
                <Input
                  value={guidance.dimensions}
                  onChange={(event) => updateGuidance("dimensions", event.target.value)}
                  placeholder="e.g. 1600 x 800 mm, lockable drawers"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Visible details in the images</Label>
              <Textarea
                value={guidance.visibleDetails}
                onChange={(event) => updateGuidance("visibleDetails", event.target.value)}
                placeholder="Mention anything the AI should notice in the images."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Use case and benefit focus</Label>
              <Textarea
                value={guidance.useCase}
                onChange={(event) => updateGuidance("useCase", event.target.value)}
                placeholder="e.g. posture support, storage, team collaboration, premium first impression"
                rows={3}
              />
            </div>

            {isLongDescription && (
              <>
                <div className="space-y-2">
                  <Label>Page strategy and section priorities</Label>
                  <Textarea
                    value={guidance.layoutOrder}
                    onChange={(event) => updateGuidance("layoutOrder", event.target.value)}
                    placeholder="e.g. lead with executive presence, compare fit and finish, show specs before ordering reassurance"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Main focus for the long description</Label>
                  <Textarea
                    value={guidance.focus}
                    onChange={(event) => updateGuidance("focus", event.target.value)}
                    placeholder="e.g. executive look, ergonomic comfort, warranty confidence, bulk-buying clarity"
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Video or product media links</Label>
                    <Textarea
                      value={guidance.videoLinks}
                      onChange={(event) => updateGuidance("videoLinks", event.target.value)}
                      placeholder="Paste YouTube, mp4, webm, or ogg links to embed, one per line."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Other images to request or generate</Label>
                    <Textarea
                      value={guidance.extraMediaNotes}
                      onChange={(event) => updateGuidance("extraMediaNotes", event.target.value)}
                      placeholder="e.g. ask for side view, close-up of stitching, lifestyle scene"
                      rows={4}
                    />
                  </div>
                </div>

                <label className="flex items-start gap-3 border border-grid/25 bg-background p-3 text-sm">
                  <Checkbox
                    checked={guidance.generateImageIdeas}
                    onCheckedChange={(checked) => updateGuidance("generateImageIdeas", checked === true)}
                    className="mt-1"
                  />
                  <span>
                    Generate or collect supporting images
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      With an API key, the AI will create supporting product images. Without one, it will prepare exact image requests with upload controls.
                    </span>
                  </span>
                </label>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
            Cancel
          </Button>
          <Button type="button" onClick={generate} disabled={generating}>
            <Sparkles className="h-4 w-4" />
            {generating ? "Generating..." : isLongDescription ? "Generate long description" : "Generate description"}
          </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(mediaResult)} onOpenChange={(nextOpen) => {
        if (!nextOpen) setMediaResult(null);
      }}>
        <DialogContent className="admin-workspace max-h-[90vh] max-w-4xl overflow-y-auto border-grid bg-card">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl tracking-[-0.03em]">Supporting image workflow</DialogTitle>
            <DialogDescription>
              Insert generated images into the long description, or upload the requested product shots for that section.
            </DialogDescription>
          </DialogHeader>

          {mediaResult?.warning && (
            <div className="border border-amber-500/30 bg-amber-500/10 p-3 text-sm leading-6 text-amber-100">
              {mediaResult.warning}
            </div>
          )}

          {!!mediaResult?.generatedImages.length && (
            <div className="space-y-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-label">Generated images</p>
                <p className="mt-1 text-sm text-muted-foreground">Review these before inserting them into the long description.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {mediaResult.generatedImages.map((image, index) => {
                  const fallbackCopy = imageMarketingCopy(context, guidance, image.purpose || image.title || "");
                  return (
                    <div key={`${image.title || image.purpose || "generated"}-${index}`} className="border border-grid/25 bg-background p-3">
                      {(image.dataUrl || image.url) && (
                        <img
                          src={image.dataUrl || image.url}
                          alt={image.title || `Generated image ${index + 1}`}
                          className="aspect-square w-full object-cover"
                        />
                      )}
                      <p className="mt-3 font-medium text-foreground">{image.section_heading || fallbackCopy.heading || image.title || `Generated image ${index + 1}`}</p>
                      <p className="mt-1 line-clamp-4 text-xs leading-5 text-muted-foreground">
                        {image.section_copy || image.marketing_copy || fallbackCopy.copy}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!!mediaResult?.imageRequests.length && (
            <div className="space-y-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-label">Requested shots</p>
                <p className="mt-1 text-sm text-muted-foreground">Upload these as editorial images for the long description, separate from the carousel.</p>
              </div>
              <div className="grid gap-3">
                {mediaResult.imageRequests.map((request, index) => {
                  const fallbackCopy = imageMarketingCopy(context, guidance, request.purpose || request.title || "");
                  return (
                    <div key={`${request.title || request.purpose || "request"}-${index}`} className="grid gap-3 border border-grid/25 bg-background p-4 md:grid-cols-[minmax(0,1fr)_180px] md:items-center">
                      <div>
                        <p className="font-medium text-foreground">{request.section_heading || fallbackCopy.heading || request.title || `Requested image ${index + 1}`}</p>
                        {request.purpose && <p className="mt-1 text-sm text-muted-foreground">{request.purpose}</p>}
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">{request.section_copy || request.marketing_copy || fallbackCopy.copy}</p>
                      </div>
                      <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 border border-grid/50 px-3 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background">
                        <Upload className="h-4 w-4" />
                        Upload shot
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={uploadingMedia}
                          onChange={(event) => uploadRequestedImages(event.target.files, request)}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={finishMediaReview} disabled={uploadingMedia}>
              Done
            </Button>
            {!!mediaResult?.generatedImages.length && (
              <Button type="button" onClick={addGeneratedImages} disabled={uploadingMedia || !onLongDescriptionMediaAdd}>
                {uploadingMedia ? "Inserting..." : "Insert generated images"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductAIDescriptionDialog;
