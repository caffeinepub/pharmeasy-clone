import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, FileImage, CheckCircle2, Loader2 } from 'lucide-react';
import { useUploadPrescription } from '../hooks/useQueries';

interface UploadPrescriptionModalProps {
  open: boolean;
  onClose: () => void;
  orderId?: string;
}

export default function UploadPrescriptionModal({ open, onClose, orderId }: UploadPrescriptionModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadPrescription = useUploadPrescription();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !orderId) return;
    setUploadProgress(0);

    try {
      await uploadPrescription.mutateAsync({ orderId, file: selectedFile });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedFile(null);
        setPreview(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setSuccess(false);
    setUploadProgress(0);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload Prescription
          </DialogTitle>
          <DialogDescription>
            {orderId
              ? `Upload prescription for order #${orderId}`
              : 'Upload your prescription image'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 className="w-14 h-14 text-primary" />
              <p className="font-semibold text-foreground">Prescription uploaded successfully!</p>
            </div>
          ) : (
            <>
              {/* Drop zone */}
              <div
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                    <button
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreview(null); }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileImage className="w-10 h-10" />
                    <p className="text-sm font-medium">Click to select prescription image</p>
                    <p className="text-xs">JPG, PNG, PDF supported</p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileSelect}
              />

              {!orderId && (
                <p className="text-xs text-muted-foreground bg-accent/50 rounded-lg p-3">
                  💡 To attach a prescription to an order, please proceed to checkout first.
                </p>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-pill" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-pill font-semibold"
                  onClick={handleUpload}
                  disabled={!selectedFile || !orderId || uploadPrescription.isPending}
                >
                  {uploadPrescription.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" /> Upload</>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
