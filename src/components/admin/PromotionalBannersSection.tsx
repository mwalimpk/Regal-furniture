import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Clock, Image, Maximize2, Move, Pause, Pencil, Play, Plus, RotateCcw, Trash2, X, ZoomIn } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useProductCategories } from "@/hooks/useProductCategories";
import {
  CUSTOM_CTA_DESTINATION,
  buildCtaDestinationOptions,
  getCtaDestinationSelectValue,
  sanitizeCtaHref,
} from "@/lib/ctaDestinations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import ProductPromotionsSection from "@/components/admin/ProductPromotionsSection";
import {
  PROMO_PLACEMENTS,
  PromoPlacementKey,
  PromotionalBanner,
  STOREWIDE_PROMO_CATEGORY,
  isBannerActive,
  normalizePromotionalBanner,
} from "@/lib/promotionalBanners";
import AdminTablePagination from "./AdminTablePagination";
import { useAdminTablePagination } from "./useAdminTablePagination";

const defaultPlacements: PromoPlacementKey[] = ["home-after-hero", "category-before-grid", "product-after-summary"];
const bannerCropAspectRatio = 16 / 7;
const bannerCropOutputWidth = 1600;
const bannerCropOutputHeight = Math.round(bannerCropOutputWidth / bannerCropAspectRatio);
const bannerCropMinZoom = 1;
const bannerCropMaxZoom = 3;
const bannerCropMinScale = 0.45;
const bannerCropMaxScale = 1;

type BannerForm = {
  title: string;
  subtitle: string;
  category: string;
  background_image_url: string;
  cta_label: string;
  cta_href: string;
  placements: PromoPlacementKey[];
  status: string;
  starts_at: string;
  ends_at: string;
  has_countdown: boolean;
  countdown_ends_at: string;
};

type CropSize = {
  width: number;
  height: number;
};

type CropPoint = {
  x: number;
  y: number;
};

type CropFrame = CropPoint & CropSize;

type PendingBackgroundCrop = {
  file: File;
  url: string;
};

const emptyForm = (): BannerForm => ({
  title: "",
  subtitle: "",
  category: STOREWIDE_PROMO_CATEGORY,
  background_image_url: "",
  cta_label: "Shop the offer",
  cta_href: "/categories",
  placements: defaultPlacements,
  status: "active",
  starts_at: "",
  ends_at: "",
  has_countdown: false,
  countdown_ends_at: "",
});

const toIsoOrNull = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const toLocalInputValue = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const cleanNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const formatDate = (value: string | null) => {
  if (!value) return "Until changed";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Until changed";
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
};

const uploadBannerBackground = async (file: File) => {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `banners/backgrounds/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { data, error } = await supabase.storage.from("promotional-banners").upload(path, file, { upsert: false });
  if (error || !data) throw new Error(error?.message || "Could not upload background image.");
  const { data: publicData } = supabase.storage.from("promotional-banners").getPublicUrl(data.path);
  return publicData.publicUrl;
};

const clampValue = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getCropFrame = (frameSize: CropSize, cropScale: number): CropFrame => {
  const maxWidth = Math.min(frameSize.width, frameSize.height * bannerCropAspectRatio);
  const maxHeight = maxWidth / bannerCropAspectRatio;
  const width = maxWidth * cropScale;
  const height = maxHeight * cropScale;

  return {
    x: (frameSize.width - width) / 2,
    y: (frameSize.height - height) / 2,
    width,
    height,
  };
};

const getCropMetrics = (
  naturalSize: CropSize,
  frameSize: CropSize,
  cropScale: number,
  zoom: number,
  offset: CropPoint,
) => {
  const cropFrame = getCropFrame(frameSize, cropScale);
  const baseScale = Math.max(frameSize.width / naturalSize.width, frameSize.height / naturalSize.height);
  const renderScale = baseScale * zoom;
  const displayWidth = naturalSize.width * renderScale;
  const displayHeight = naturalSize.height * renderScale;
  const imageLeft = frameSize.width / 2 + offset.x - displayWidth / 2;
  const imageTop = frameSize.height / 2 + offset.y - displayHeight / 2;

  return {
    renderScale,
    displayWidth,
    displayHeight,
    imageLeft,
    imageTop,
    cropFrame,
    maxOffsetX: Math.max(0, (displayWidth - cropFrame.width) / 2),
    maxOffsetY: Math.max(0, (displayHeight - cropFrame.height) / 2),
  };
};

const clampCropOffset = (
  offset: CropPoint,
  naturalSize: CropSize | null,
  frameSize: CropSize,
  cropScale: number,
  zoom: number,
) => {
  if (!naturalSize || frameSize.width <= 0 || frameSize.height <= 0) return { x: 0, y: 0 };
  const metrics = getCropMetrics(naturalSize, frameSize, cropScale, zoom, offset);

  return {
    x: clampValue(offset.x, -metrics.maxOffsetX, metrics.maxOffsetX),
    y: clampValue(offset.y, -metrics.maxOffsetY, metrics.maxOffsetY),
  };
};

const getCroppedFileName = (fileName: string) => {
  const baseName = fileName.replace(/\.[^/.]+$/, "") || "banner-background";
  return `${baseName}-cropped.jpg`;
};

const loadCropImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read the selected image."));
    image.src = url;
  });

const createCroppedBannerFile = async (
  source: PendingBackgroundCrop,
  naturalSize: CropSize,
  frameSize: CropSize,
  cropScale: number,
  zoom: number,
  offset: CropPoint,
) => {
  const image = await loadCropImage(source.url);
  const metrics = getCropMetrics(naturalSize, frameSize, cropScale, zoom, offset);
  const sourceWidth = metrics.cropFrame.width / metrics.renderScale;
  const sourceHeight = metrics.cropFrame.height / metrics.renderScale;
  const safeSourceWidth = Math.min(naturalSize.width, sourceWidth);
  const safeSourceHeight = Math.min(naturalSize.height, sourceHeight);
  const sourceX = clampValue(
    (metrics.cropFrame.x - metrics.imageLeft) / metrics.renderScale,
    0,
    Math.max(0, naturalSize.width - safeSourceWidth),
  );
  const sourceY = clampValue(
    (metrics.cropFrame.y - metrics.imageTop) / metrics.renderScale,
    0,
    Math.max(0, naturalSize.height - safeSourceHeight),
  );
  const canvas = document.createElement("canvas");
  canvas.width = bannerCropOutputWidth;
  canvas.height = bannerCropOutputHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not prepare the cropped image.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, sourceX, sourceY, safeSourceWidth, safeSourceHeight, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Could not export the cropped image."));
      },
      "image/jpeg",
      0.9,
    );
  });

  return new File([blob], getCroppedFileName(source.file.name), { type: "image/jpeg" });
};

type BannerBackgroundCropDialogProps = {
  source: PendingBackgroundCrop | null;
  uploading: boolean;
  onCancel: () => void;
  onApply: (file: File) => Promise<void>;
  onError: (message: string) => void;
};

const BannerBackgroundCropDialog = ({
  source,
  uploading,
  onCancel,
  onApply,
  onError,
}: BannerBackgroundCropDialogProps) => {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; startOffset: CropPoint } | null>(null);
  const [naturalSize, setNaturalSize] = useState<CropSize | null>(null);
  const [frameSize, setFrameSize] = useState<CropSize>({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(bannerCropMinZoom);
  const [cropScale, setCropScale] = useState(bannerCropMaxScale);
  const [offset, setOffset] = useState<CropPoint>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const sourceUrl = source?.url;
  const [frameElement, setFrameElement] = useState<HTMLDivElement | null>(null);

  const measureFrame = useCallback((node = frameRef.current) => {
    if (!node) return null;

    const rect = node.getBoundingClientRect();
    const width = rect.width || node.clientWidth;
    const height = rect.height || node.clientHeight || (width > 0 ? width / bannerCropAspectRatio : 0);

    if (width <= 0 || height <= 0) return null;

    const nextSize = { width, height };
    setFrameSize((current) => (
      Math.abs(current.width - nextSize.width) < 0.5 && Math.abs(current.height - nextSize.height) < 0.5
        ? current
        : nextSize
    ));

    return nextSize;
  }, []);

  const setFrameNode = useCallback((node: HTMLDivElement | null) => {
    frameRef.current = node;
    setFrameElement(node);
    if (node) measureFrame(node);
  }, [measureFrame]);

  useEffect(() => {
    setNaturalSize(null);
    setFrameSize({ width: 0, height: 0 });
    setFrameElement(frameRef.current);
    setZoom(bannerCropMinZoom);
    setCropScale(bannerCropMaxScale);
    setOffset({ x: 0, y: 0 });
    setIsDragging(false);
    dragRef.current = null;
  }, [sourceUrl]);

  useEffect(() => {
    if (!sourceUrl || !frameElement) return;
    const updateFrameSize = () => measureFrame(frameElement);

    updateFrameSize();
    const frameId = window.requestAnimationFrame(updateFrameSize);
    const fallbackTimer = window.setTimeout(updateFrameSize, 120);

    let observer: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      observer = new ResizeObserver(updateFrameSize);
      observer.observe(frameElement);
    }

    window.addEventListener("resize", updateFrameSize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(fallbackTimer);
      observer?.disconnect();
      window.removeEventListener("resize", updateFrameSize);
    };
  }, [frameElement, measureFrame, sourceUrl]);

  useEffect(() => {
    setOffset((current) => clampCropOffset(current, naturalSize, frameSize, cropScale, zoom));
  }, [cropScale, frameSize, naturalSize, zoom]);

  const cropMetrics = naturalSize && frameSize.width > 0 && frameSize.height > 0
    ? getCropMetrics(naturalSize, frameSize, cropScale, zoom, offset)
    : null;

  const handleZoomChange = (value: number[]) => {
    const nextZoom = value[0] ?? bannerCropMinZoom;
    const measuredFrameSize = measureFrame() || frameSize;
    setZoom(nextZoom);
    setOffset((current) => clampCropOffset(current, naturalSize, measuredFrameSize, cropScale, nextZoom));
  };

  const handleCropScaleChange = (value: number[]) => {
    const nextScale = value[0] ?? bannerCropMaxScale;
    const measuredFrameSize = measureFrame() || frameSize;
    setCropScale(nextScale);
    setOffset((current) => clampCropOffset(current, naturalSize, measuredFrameSize, nextScale, zoom));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!naturalSize || event.button !== 0) return;
    const measuredFrameSize = measureFrame() || frameSize;
    if (measuredFrameSize.width <= 0 || measuredFrameSize.height <= 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: offset,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    const measuredFrameSize = frameSize.width > 0 && frameSize.height > 0 ? frameSize : measureFrame() || frameSize;
    const nextOffset = {
      x: dragRef.current.startOffset.x + event.clientX - dragRef.current.startX,
      y: dragRef.current.startOffset.y + event.clientY - dragRef.current.startY,
    };
    setOffset(clampCropOffset(nextOffset, naturalSize, measuredFrameSize, cropScale, zoom));
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setIsDragging(false);
  };

  const resetCrop = () => {
    setZoom(bannerCropMinZoom);
    setCropScale(bannerCropMaxScale);
    setOffset({ x: 0, y: 0 });
  };

  const applyCrop = async () => {
    const measuredFrameSize = measureFrame() || frameSize;
    if (!source || !naturalSize) return;

    if (measuredFrameSize.width <= 0 || measuredFrameSize.height <= 0) {
      onError("The crop frame is still preparing. Close the editor and choose the image again.");
      return;
    }

    try {
      const croppedFile = await createCroppedBannerFile(source, naturalSize, measuredFrameSize, cropScale, zoom, offset);
      await onApply(croppedFile);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Could not crop the selected image.");
    }
  };

  const cropFrameStyle = cropMetrics
    ? {
        left: `${cropMetrics.cropFrame.x}px`,
        top: `${cropMetrics.cropFrame.y}px`,
        width: `${cropMetrics.cropFrame.width}px`,
        height: `${cropMetrics.cropFrame.height}px`,
      }
    : undefined;
  const cropOverlayColor = "rgb(var(--obsidian-rgb)/0.54)";

  return (
    <Dialog
      open={Boolean(source)}
      onOpenChange={(open) => {
        if (!open && !uploading) onCancel();
      }}
    >
      <DialogContent className="admin-workspace max-h-[92vh] max-w-5xl overflow-y-auto border-grid bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[-0.03em]">Crop banner background</DialogTitle>
          <DialogDescription>Create a 16:7 storefront banner image before it is uploaded.</DialogDescription>
        </DialogHeader>

        {source && (
          <div className="space-y-5">
            <div
              ref={setFrameNode}
              className={`relative aspect-[16/7] overflow-hidden border border-grid/35 bg-[rgb(var(--obsidian-rgb)/0.92)] touch-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              onPointerDown={handlePointerDown}
              onPointerEnter={() => measureFrame()}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <img
                src={source.url}
                alt=""
                draggable={false}
                onLoad={(event) => {
                  setNaturalSize({
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  });
                  measureFrame();
                }}
                onError={() => onError("Could not preview the selected image. Try another image file.")}
                className={
                  cropMetrics
                    ? "pointer-events-none absolute max-w-none select-none"
                    : "pointer-events-none h-full w-full select-none object-cover"
                }
                style={
                  cropMetrics
                    ? {
                        width: `${cropMetrics.displayWidth}px`,
                        height: `${cropMetrics.displayHeight}px`,
                        left: `${frameSize.width / 2 + offset.x}px`,
                        top: `${frameSize.height / 2 + offset.y}px`,
                        transform: "translate(-50%, -50%)",
                      }
                    : undefined
                }
              />

              {cropMetrics && (
                <>
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0"
                    style={{ height: `${cropMetrics.cropFrame.y}px`, backgroundColor: cropOverlayColor }}
                  />
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0"
                    style={{
                      top: `${cropMetrics.cropFrame.y + cropMetrics.cropFrame.height}px`,
                      backgroundColor: cropOverlayColor,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute"
                    style={{
                      left: 0,
                      top: `${cropMetrics.cropFrame.y}px`,
                      width: `${cropMetrics.cropFrame.x}px`,
                      height: `${cropMetrics.cropFrame.height}px`,
                      backgroundColor: cropOverlayColor,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute"
                    style={{
                      left: `${cropMetrics.cropFrame.x + cropMetrics.cropFrame.width}px`,
                      top: `${cropMetrics.cropFrame.y}px`,
                      right: 0,
                      height: `${cropMetrics.cropFrame.height}px`,
                      backgroundColor: cropOverlayColor,
                    }}
                  />
                  <div className="pointer-events-none absolute border-2 border-[rgb(var(--white-rgb)/0.82)]" style={cropFrameStyle}>
                    <div className="absolute inset-y-0 left-1/3 w-px bg-[rgb(var(--white-rgb)/0.36)]" />
                    <div className="absolute inset-y-0 left-2/3 w-px bg-[rgb(var(--white-rgb)/0.36)]" />
                    <div className="absolute inset-x-0 top-1/3 h-px bg-[rgb(var(--white-rgb)/0.36)]" />
                    <div className="absolute inset-x-0 top-2/3 h-px bg-[rgb(var(--white-rgb)/0.36)]" />
                  </div>
                </>
              )}
              <div className="pointer-events-none absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center border border-[rgb(var(--white-rgb)/0.32)] bg-[rgb(var(--obsidian-rgb)/0.48)] text-primary-foreground">
                <Move className="h-4 w-4" />
              </div>
            </div>

            <div className="grid gap-4 border border-grid/25 bg-background p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label className="inline-flex items-center gap-2">
                    <Maximize2 className="h-4 w-4" />
                    Crop area
                  </Label>
                  <span className="font-mono text-[11px] text-muted-foreground">{Math.round(cropScale * 100)}%</span>
                </div>
                <Slider
                  value={[cropScale]}
                  min={bannerCropMinScale}
                  max={bannerCropMaxScale}
                  step={0.05}
                  onValueChange={handleCropScaleChange}
                  disabled={!naturalSize || uploading}
                  aria-label="Resize crop area"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label className="inline-flex items-center gap-2">
                    <ZoomIn className="h-4 w-4" />
                    Zoom
                  </Label>
                  <span className="font-mono text-[11px] text-muted-foreground">{Math.round(zoom * 100)}%</span>
                </div>
                <Slider
                  value={[zoom]}
                  min={bannerCropMinZoom}
                  max={bannerCropMaxZoom}
                  step={0.05}
                  onValueChange={handleZoomChange}
                  disabled={!naturalSize || uploading}
                  aria-label="Zoom banner background"
                />
              </div>

              <Button type="button" variant="outline" onClick={resetCrop} disabled={uploading}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>
            Cancel
          </Button>
          <Button type="button" onClick={applyCrop} disabled={!naturalSize || uploading} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Check className="h-4 w-4" />
            {uploading ? "Uploading..." : "Use crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PromotionalBannersSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BannerForm>(() => emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [pendingBackgroundCrop, setPendingBackgroundCrop] = useState<PendingBackgroundCrop | null>(null);
  const { data: storefrontCategories = [] } = useProductCategories();

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-promotional-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotional_banners")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data || []) as Array<Record<string, unknown>>).map(normalizePromotionalBanner);
    },
  });

  const categoryOptions = useMemo(
    () => [STOREWIDE_PROMO_CATEGORY, ...storefrontCategories.map((category) => category.name)],
    [storefrontCategories],
  );

  const activeNow = useMemo(() => banners.filter((banner) => isBannerActive(banner)).length, [banners]);
  const scheduled = useMemo(
    () => banners.filter((banner) => banner.status === "active" && banner.starts_at && new Date(banner.starts_at) > new Date()).length,
    [banners],
  );
  const bannerPagination = useAdminTablePagination(banners);
  const ctaDestinationOptions = useMemo(() => buildCtaDestinationOptions(storefrontCategories), [storefrontCategories]);
  const ctaSelectValue = getCtaDestinationSelectValue(form.cta_href, CUSTOM_CTA_DESTINATION, ctaDestinationOptions);

  const updateForm = <K extends keyof BannerForm>(key: K, value: BannerForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const togglePlacement = (key: PromoPlacementKey) => {
    setForm((current) => ({
      ...current,
      placements: current.placements.includes(key)
        ? current.placements.filter((placement) => placement !== key)
        : [...current.placements, key],
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const closeBackgroundCrop = () => {
    setPendingBackgroundCrop((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  };

  const startEdit = (banner: PromotionalBanner) => {
    const allowedPlacements = new Set(PROMO_PLACEMENTS.map((placement) => placement.key));
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      category: banner.category || STOREWIDE_PROMO_CATEGORY,
      background_image_url: banner.background_image_url || "",
      cta_label: banner.cta_label || "",
      cta_href: banner.cta_href || "",
      placements: banner.placements.filter((placement) => allowedPlacements.has(placement as PromoPlacementKey)) as PromoPlacementKey[],
      status: banner.status || "active",
      starts_at: toLocalInputValue(banner.starts_at),
      ends_at: toLocalInputValue(banner.ends_at),
      has_countdown: Boolean(banner.has_countdown),
      countdown_ends_at: toLocalInputValue(banner.countdown_ends_at),
    });
  };

  const handleBackgroundFile = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid image", description: "Upload an image file for the banner background.", variant: "destructive" });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Use a background image under 8MB.", variant: "destructive" });
      return;
    }

    const cropUrl = URL.createObjectURL(file);
    setPendingBackgroundCrop((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return { file, url: cropUrl };
    });
  };

  const uploadCroppedBackground = async (file: File) => {
    setUploadingBackground(true);
    try {
      const publicUrl = await uploadBannerBackground(file);
      updateForm("background_image_url", publicUrl);
      toast({ title: "Background uploaded" });
      closeBackgroundCrop();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload the banner background.",
        variant: "destructive",
      });
    } finally {
      setUploadingBackground(false);
    }
  };

  const invalidateBannerQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-promotional-banners"] });
    queryClient.invalidateQueries({ queryKey: ["active-promotional-banners"] });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    if (!form.title.trim()) {
      toast({ title: "Banner title is required", variant: "destructive" });
      return;
    }

    if (!form.placements.length) {
      toast({ title: "Select at least one placement", variant: "destructive" });
      return;
    }

    const startsAt = toIsoOrNull(form.starts_at);
    const endsAt = toIsoOrNull(form.ends_at);
    const countdownEndsAt = form.has_countdown ? toIsoOrNull(form.countdown_ends_at) : null;

    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
      toast({ title: "End time must be after start time", variant: "destructive" });
      return;
    }

    if (form.has_countdown && !countdownEndsAt) {
      toast({ title: "Set a countdown end time", variant: "destructive" });
      return;
    }

    const payload = {
      user_id: user.id,
      title: form.title.trim(),
      subtitle: cleanNullable(form.subtitle),
      category: form.category,
      background_image_url: cleanNullable(form.background_image_url),
      cta_label: cleanNullable(form.cta_label),
      cta_href: sanitizeCtaHref(form.cta_href, null),
      placements: form.placements,
      status: form.status,
      starts_at: startsAt,
      ends_at: endsAt,
      has_countdown: form.has_countdown,
      countdown_ends_at: countdownEndsAt,
    };

    setSaving(true);
    const { error } = editingId
      ? await supabase.from("promotional_banners").update(payload).eq("id", editingId)
      : await supabase.from("promotional_banners").insert(payload);
    setSaving(false);

    if (error) {
      toast({ title: "Could not save banner", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: editingId ? "Banner updated" : "Banner created" });
    resetForm();
    invalidateBannerQueries();
  };

  const toggleStatus = async (banner: PromotionalBanner) => {
    const nextStatus = banner.status === "active" ? "paused" : "active";
    const { error } = await supabase.from("promotional_banners").update({ status: nextStatus }).eq("id", banner.id);

    if (error) {
      toast({ title: "Could not update banner", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: nextStatus === "active" ? "Banner activated" : "Banner paused" });
    invalidateBannerQueries();
  };

  const removeBanner = async (banner: PromotionalBanner) => {
    if (!confirm(`Delete "${banner.title}" permanently?`)) return;

    const { error } = await supabase.from("promotional_banners").delete().eq("id", banner.id);

    if (error) {
      toast({ title: "Could not delete banner", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Banner deleted" });
    if (editingId === banner.id) resetForm();
    invalidateBannerQueries();
  };

  return (
    <div className="space-y-6">
      <BannerBackgroundCropDialog
        source={pendingBackgroundCrop}
        uploading={uploadingBackground}
        onCancel={closeBackgroundCrop}
        onApply={uploadCroppedBackground}
        onError={(message) => toast({ title: "Crop failed", description: message, variant: "destructive" })}
      />

      <ProductPromotionsSection />

      <div className="border-t border-grid/25 pt-6" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Conversion Tools</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.04em] text-foreground">Promotional banners</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Create timed or evergreen offers, assign a category, and choose the storefront sections where each banner should appear.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Total</p>
            <p className="mt-2 font-medium text-foreground">{banners.length}</p>
          </div>
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Live now</p>
            <p className="mt-2 font-medium text-foreground">{activeNow}</p>
          </div>
          <div className="admin-panel-soft px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Scheduled</p>
            <p className="mt-2 font-medium text-foreground">{scheduled}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="border-grid/25 bg-card shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-2xl tracking-[-0.03em]">
              {editingId ? "Edit banner" : "Create banner"}
            </CardTitle>
            <CardDescription>Set the message, target category, CTA, and active schedule.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="Executive desk week"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Banner category</Label>
                <Select value={form.category} onValueChange={(value) => updateForm("category", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.subtitle}
                onChange={(event) => updateForm("subtitle", event.target.value)}
                placeholder="A concise offer statement for shoppers who are ready to compare options."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Background image</Label>
              <div className="border border-grid/25 bg-background p-4">
                {form.background_image_url ? (
                  <div className="relative mb-4 aspect-[16/7] overflow-hidden border border-grid/25">
                    <img
                      src={form.background_image_url}
                      alt="Promotional banner background"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--obsidian-rgb)/0.54),transparent)]" />
                    <button
                      type="button"
                      onClick={() => updateForm("background_image_url", "")}
                      className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center border border-[rgb(var(--white-rgb)/0.3)] bg-[rgb(var(--obsidian-rgb)/0.52)] text-primary-foreground transition-colors hover:bg-[rgb(var(--obsidian-rgb)/0.72)]"
                      aria-label="Remove background image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mb-4 flex min-h-40 items-center justify-center border border-dashed border-grid/35 bg-card/50 text-center">
                    <div>
                      <Image className="mx-auto h-7 w-7 text-muted-foreground" />
                      <p className="mt-3 text-sm font-medium text-foreground">No background image selected</p>
                      <p className="mt-1 text-xs text-muted-foreground">The theme gradient will be used until an image is added.</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 border border-grid/45 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background">
                    <Image className="h-4 w-4" />
                    {uploadingBackground ? "Uploading..." : "Upload background"}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingBackground}
                      onChange={(event) => {
                        handleBackgroundFile(event.target.files);
                        event.target.value = "";
                      }}
                      className="hidden"
                    />
                  </label>
                  <Input
                    value={form.background_image_url}
                    onChange={(event) => updateForm("background_image_url", event.target.value)}
                    placeholder="Or paste an image URL"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>CTA label</Label>
                <Input
                  value={form.cta_label}
                  onChange={(event) => updateForm("cta_label", event.target.value)}
                  placeholder="Shop the offer"
                />
              </div>
              <div className="space-y-2">
                <Label>CTA destination</Label>
                <Select
                  value={ctaSelectValue}
                  onValueChange={(value) => updateForm("cta_href", value === CUSTOM_CTA_DESTINATION ? "" : value)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ctaDestinationOptions.map((option) => (
                      <SelectItem key={option.href} value={option.href}>{option.label}</SelectItem>
                    ))}
                    <SelectItem value={CUSTOM_CTA_DESTINATION}>Custom link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {ctaSelectValue === CUSTOM_CTA_DESTINATION && (
              <div className="space-y-2">
                <Label>Custom CTA link</Label>
                <Input
                  value={form.cta_href}
                  onChange={(event) => updateForm("cta_href", event.target.value)}
                  placeholder="https://example.com or /custom-page"
                />
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => updateForm("status", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Starts</Label>
                <Input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(event) => updateForm("starts_at", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ends</Label>
                <Input
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(event) => updateForm("ends_at", event.target.value)}
                />
              </div>
            </div>

            <label className="flex items-start gap-3 border border-grid/25 bg-background px-4 py-3">
              <input
                type="checkbox"
                checked={form.has_countdown}
                onChange={(event) => updateForm("has_countdown", event.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="block text-sm font-medium text-foreground">Show countdown</span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  Use this for limited-time offers. Leave the end date blank above if the banner should stay live until it is changed manually.
                </span>
              </span>
            </label>

            {form.has_countdown && (
              <div className="space-y-2">
                <Label>Countdown ends</Label>
                <Input
                  type="datetime-local"
                  value={form.countdown_ends_at}
                  onChange={(event) => updateForm("countdown_ends_at", event.target.value)}
                />
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                {saving ? "Saving..." : editingId ? "Save changes" : "Create banner"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel edit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-grid/25 bg-card shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-2xl tracking-[-0.03em]">Strategic placements</CardTitle>
            <CardDescription>Choose the page sections where the offer has the highest conversion context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {PROMO_PLACEMENTS.map((placement) => {
              const selected = form.placements.includes(placement.key);
              return (
                <button
                  key={placement.key}
                  type="button"
                  onClick={() => togglePlacement(placement.key)}
                  className={`w-full border p-4 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-grid/25 bg-background text-foreground hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-medium">{placement.label}</span>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{placement.page}</span>
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">{placement.reason}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </form>

      <Card className="border-grid/25 bg-card shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="font-serif text-2xl tracking-[-0.03em]">Saved banners</CardTitle>
          <CardDescription>Review placement coverage, active windows, and countdown settings.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading banners...</p>
          ) : !banners.length ? (
            <div className="admin-panel p-8 text-muted-foreground">No promotional banners have been created yet.</div>
          ) : (
            <div className="admin-table-panel">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Banner</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Placements</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bannerPagination.paginatedItems.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          {banner.background_image_url && (
                            <img
                              src={banner.background_image_url}
                              alt=""
                              className="h-14 w-20 border border-grid/25 object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium text-foreground">{banner.title}</div>
                            {banner.subtitle && (
                              <div className="mt-1 line-clamp-2 max-w-sm text-sm text-muted-foreground">{banner.subtitle}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{banner.category}</TableCell>
                      <TableCell>
                        <div className="flex max-w-md flex-wrap gap-2">
                          {banner.placements.map((placement) => (
                            <Badge key={placement} variant="outline" className="border-grid/35 bg-background text-[11px]">
                              {PROMO_PLACEMENTS.find((item) => item.key === placement)?.label || placement}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div>{banner.starts_at ? `Starts ${formatDate(banner.starts_at)}` : "Starts immediately"}</div>
                        <div>Ends {formatDate(banner.ends_at)}</div>
                        {banner.has_countdown && (
                          <div className="mt-1 inline-flex items-center gap-1 text-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(banner.countdown_ends_at)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={isBannerActive(banner) ? "border border-primary/20 bg-primary/10 text-foreground" : "border border-grid/25 bg-background text-muted-foreground"}>
                          {isBannerActive(banner) ? "Live" : banner.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(banner)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toggleStatus(banner)}>
                            {banner.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            {banner.status === "active" ? "Pause" : "Activate"}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => removeBanner(banner)}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <AdminTablePagination pagination={bannerPagination} itemLabel="banners" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionalBannersSection;
