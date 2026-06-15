import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

const ImageUploader = ({ images, onChange, max = 10 }: ImageUploaderProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const remaining = max - images.length;
    if (remaining <= 0) {
      toast({ title: "Limit reached", description: `Max ${max} images.`, variant: "destructive" });
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    const uploaded: string[] = [];

    for (const file of toUpload) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: `${file.name} exceeds 5MB.`, variant: "destructive" });
        continue;
      }
      const ext = file.name.split(".").pop() || "jpg";
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("property-images").upload(path, file, { upsert: false });
      if (error) {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        continue;
      }
      const { data } = supabase.storage.from("property-images").getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }

    if (uploaded.length) {
      onChange([...images, ...uploaded]);
      toast({ title: "Uploaded", description: `${uploaded.length} image(s) added.` });
    }
    setUploading(false);
  };

  const remove = (url: string) => onChange(images.filter((u) => u !== url));
  const setAsThumbnail = (url: string) => onChange([url, ...images.filter((u) => u !== url)]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading || images.length >= max}
            className="hidden"
          />
          <span className="inline-block border border-grid/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background">
            {uploading ? "Uploading..." : "Upload Images"}
          </span>
        </label>
        <span className="text-xs text-muted-foreground">{images.length} / {max} images</span>
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {images.map((url, i) => (
            <div
              key={url}
              className="relative aspect-square overflow-hidden border border-grid/30 bg-background"
            >
              <img src={url} alt={`Product ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center bg-destructive text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90"
                aria-label={`Remove product image ${i + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              {i === 0 ? (
                <span className="absolute bottom-1 left-1 right-1 inline-flex min-h-7 items-center justify-center gap-1 bg-primary px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-primary-foreground shadow-sm">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  Thumbnail
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAsThumbnail(url)}
                  className="absolute bottom-1 left-1 right-1 inline-flex min-h-7 items-center justify-center gap-1 bg-background/95 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-foreground shadow-sm transition-colors hover:bg-foreground hover:text-background"
                  aria-label={`Set product image ${i + 1} as thumbnail`}
                >
                  <Star className="h-3.5 w-3.5" />
                  Set thumbnail
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
