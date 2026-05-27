import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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
            <div key={url} className="group relative aspect-square overflow-hidden border border-grid/30">
              <img src={url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Remove
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">Main</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
