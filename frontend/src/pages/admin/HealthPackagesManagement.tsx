import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Package, AlertCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useHealthPackages, useAddHealthPackage, useUpdateHealthPackage, useDeleteHealthPackage } from '../../hooks/useQueries';
import HealthPackageForm from '../../components/admin/HealthPackageForm';
import type { HealthPackage } from '../../backend';

export default function HealthPackagesManagement() {
  const { data: packages, isLoading } = useHealthPackages();
  const addHealthPackage = useAddHealthPackage();
  const updateHealthPackage = useUpdateHealthPackage();
  const deleteHealthPackage = useDeleteHealthPackage();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<HealthPackage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingPkg(null);
    setFormOpen(true);
  };

  const handleEdit = (pkg: HealthPackage) => {
    setEditingPkg(pkg);
    setFormOpen(true);
  };

  const handleSubmit = async (data: HealthPackage) => {
    try {
      if (editingPkg) {
        await updateHealthPackage.mutateAsync({ healthPackageId: editingPkg.id, updatedPackage: data });
        toast.success('Health package updated successfully');
      } else {
        await addHealthPackage.mutateAsync(data);
        toast.success('Health package added successfully');
      }
      setFormOpen(false);
    } catch (err) {
      toast.error('Failed to save health package');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteHealthPackage.mutateAsync(deletingId);
      toast.success('Health package deleted');
    } catch (err) {
      toast.error('Failed to delete health package');
    } finally {
      setDeletingId(null);
    }
  };

  const isSubmitting = addHealthPackage.isPending || updateHealthPackage.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">Health Packages</h2>
          <p className="text-sm text-muted-foreground">Manage health test packages</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Package
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !packages || packages.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-semibold text-foreground mb-1">No health packages yet</p>
          <p className="text-sm text-muted-foreground mb-4">Add your first health package to get started</p>
          <Button onClick={handleAdd} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Add Package
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Package Name</TableHead>
                <TableHead className="hidden md:table-cell">Tests</TableHead>
                <TableHead className="hidden lg:table-cell">Sample Type</TableHead>
                <TableHead>Market Price</TableHead>
                <TableHead>Discounted</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map(pkg => {
                const discountPct = Math.round((1 - Number(pkg.discountedPrice) / Number(pkg.marketPrice)) * 100);
                return (
                  <TableRow key={pkg.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground text-sm">{pkg.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{pkg.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {pkg.includedTests.length} tests
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{pkg.sampleType}</TableCell>
                    <TableCell className="text-sm text-muted-foreground line-through">₹{Number(pkg.marketPrice)}</TableCell>
                    <TableCell className="text-sm font-semibold text-foreground">₹{Number(pkg.discountedPrice)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        <Badge className="bg-primary/10 text-primary border-0 text-xs">{discountPct}% OFF</Badge>
                        {pkg.isPopular && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" /> Popular
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleEdit(pkg)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeletingId(pkg.id)}
                          disabled={deleteHealthPackage.isPending && deletingId === pkg.id}
                        >
                          {deleteHealthPackage.isPending && deletingId === pkg.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />
                          }
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <HealthPackageForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingPkg}
        isSubmitting={isSubmitting}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Delete Health Package
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this health package? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
