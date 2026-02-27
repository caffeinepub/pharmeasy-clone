import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUploadImage } from '../../hooks/useQueries';

interface ImageUploadFieldProps {
  currentImageUrl: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploadField({ currentImageUrl, onChange, label = 'Image' }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl);
  const uploadImage = useUploadImage();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploadProgress(0);

    try {
      const result = await uploadImage.mutateAsync({
        file,
        onProgress: (pct) => setUploadProgress(pct),
      });
      const directUrl = result.getDirectURL();
      setPreviewUrl(directUrl);
      onChange(directUrl);
    } catch (err) {
      // Revert preview on error
      setPreviewUrl(currentImageUrl);
    } finally {
      setUploadProgress(0);
    }
  };

  const handleClear = () => {
    setPreviewUrl('');
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isUploading = uploadImage.isPending;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="border-2 border-dashed border-border rounded-xl p-4 bg-muted/30">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-40 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {!isUploading && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-90"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">No image selected</p>
          </div>
        )}

        {isUploading && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
            <Progress value={uploadProgress} className="h-1.5" />
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            {previewUrl ? 'Change Image' : 'Upload Image'}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Manual URL input fallback */}
      <div className="flex gap-2 items-center">
        <span className="text-xs text-muted-foreground">Or enter URL:</span>
        <input
          type="text"
          value={currentImageUrl}
          onChange={(e) => {
            onChange(e.target.value);
            setPreviewUrl(e.target.value);
          }}
          placeholder="https://..."
          className="flex-1 text-xs px-2 py-1.5 rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  );
}
