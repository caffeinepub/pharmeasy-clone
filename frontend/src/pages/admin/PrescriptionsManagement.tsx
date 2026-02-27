import React, { useState } from 'react';
import { FileText, CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useGetAllPrescriptions, useUpdatePrescriptionStatus } from '../../hooks/useQueries';
import { PrescriptionStatus } from '../../backend';
import type { Prescription } from '../../backend';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

function formatDate(time: bigint) {
  return new Date(Number(time) / 1_000_000).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function getPrescriptionStatus(status: Prescription['status']): string {
  if (typeof status === 'object') return Object.keys(status)[0];
  return String(status);
}

export default function PrescriptionsManagement() {
  const { data: prescriptions, isLoading } = useGetAllPrescriptions();
  const updateStatus = useUpdatePrescriptionStatus();
  const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const handleApprove = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ prescriptionId: id, status: PrescriptionStatus.approved });
      toast.success('Prescription approved');
    } catch {
      toast.error('Failed to approve prescription');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ prescriptionId: id, status: PrescriptionStatus.rejected });
      toast.success('Prescription rejected');
    } catch {
      toast.error('Failed to reject prescription');
    }
  };

  const handleView = async (prescription: Prescription) => {
    setViewingPrescription(prescription);
    setLoadingPreview(true);
    try {
      const bytes = await prescription.image.getBytes();
      const blob = new Blob([bytes], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch {
      setPreviewUrl('');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleClosePreview = () => {
    setViewingPrescription(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-foreground">Prescriptions</h2>
        <p className="text-sm text-muted-foreground">Review and approve uploaded prescriptions</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !prescriptions || prescriptions.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-semibold text-foreground mb-1">No prescriptions yet</p>
          <p className="text-sm text-muted-foreground">Uploaded prescriptions will appear here</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Prescription ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead className="hidden md:table-cell">User</TableHead>
                <TableHead className="hidden md:table-cell">Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map(prescription => {
                const statusKey = getPrescriptionStatus(prescription.status);
                const isPending = statusKey === 'pending';
                const isUpdating = updateStatus.isPending;

                return (
                  <TableRow key={prescription.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {prescription.id.slice(0, 16)}...
                    </TableCell>
                    <TableCell className="text-sm text-foreground font-mono">#{prescription.orderId}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {prescription.userId.slice(0, 12)}...
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {formatDate(prescription.uploadedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs border ${STATUS_STYLES[statusKey] || 'bg-muted text-muted-foreground'}`}>
                        {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleView(prescription)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {isPending && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:bg-green-50"
                              onClick={() => handleApprove(prescription.id)}
                              disabled={isUpdating}
                            >
                              {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleReject(prescription.id)}
                              disabled={isUpdating}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!viewingPrescription} onOpenChange={(open) => !open && handleClosePreview()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Prescription Preview</DialogTitle>
          </DialogHeader>
          {loadingPreview ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : previewUrl ? (
            <img src={previewUrl} alt="Prescription" className="w-full rounded-lg" />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Unable to load prescription image</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
