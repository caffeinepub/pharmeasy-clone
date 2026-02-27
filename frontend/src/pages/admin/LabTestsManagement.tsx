import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, TestTube2, AlertCircle } from 'lucide-react';
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
import { useGetAllLabTests, useAddLabTest, useUpdateLabTest, useDeleteLabTest } from '../../hooks/useQueries';
import LabTestForm from '../../components/admin/LabTestForm';
import type { LabTest } from '../../backend';

export default function LabTestsManagement() {
  const { data: labTests, isLoading } = useGetAllLabTests();
  const addLabTest = useAddLabTest();
  const updateLabTest = useUpdateLabTest();
  const deleteLabTest = useDeleteLabTest();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingTest(null);
    setFormOpen(true);
  };

  const handleEdit = (test: LabTest) => {
    setEditingTest(test);
    setFormOpen(true);
  };

  const handleSubmit = async (data: LabTest) => {
    try {
      if (editingTest) {
        await updateLabTest.mutateAsync({ labTestId: editingTest.id, updatedLabTest: data });
        toast.success('Lab test updated successfully');
      } else {
        await addLabTest.mutateAsync(data);
        toast.success('Lab test added successfully');
      }
      setFormOpen(false);
    } catch (err) {
      toast.error('Failed to save lab test');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteLabTest.mutateAsync(deletingId);
      toast.success('Lab test deleted');
    } catch (err) {
      toast.error('Failed to delete lab test');
    } finally {
      setDeletingId(null);
    }
  };

  const isSubmitting = addLabTest.isPending || updateLabTest.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">Lab Tests</h2>
          <p className="text-sm text-muted-foreground">Manage individual lab tests</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Test
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !labTests || labTests.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <TestTube2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-semibold text-foreground mb-1">No lab tests yet</p>
          <p className="text-sm text-muted-foreground mb-4">Add your first lab test to get started</p>
          <Button onClick={handleAdd} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Add Test
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Test Name</TableHead>
                <TableHead className="hidden md:table-cell">Sample Type</TableHead>
                <TableHead className="hidden lg:table-cell">Turnaround</TableHead>
                <TableHead>Market Price</TableHead>
                <TableHead>Discounted</TableHead>
                <TableHead className="hidden md:table-cell">Discount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labTests.map(test => {
                const discountPct = Math.round((1 - Number(test.discountedPrice) / Number(test.marketPrice)) * 100);
                return (
                  <TableRow key={test.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground text-sm">{test.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{test.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{test.sampleType}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{test.turnaroundTime}</TableCell>
                    <TableCell className="text-sm text-muted-foreground line-through">₹{Number(test.marketPrice)}</TableCell>
                    <TableCell className="text-sm font-semibold text-foreground">₹{Number(test.discountedPrice)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge className="bg-primary/10 text-primary border-0 text-xs">{discountPct}% OFF</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleEdit(test)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeletingId(test.id)}
                          disabled={deleteLabTest.isPending && deletingId === test.id}
                        >
                          {deleteLabTest.isPending && deletingId === test.id
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

      <LabTestForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingTest}
        isSubmitting={isSubmitting}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Delete Lab Test
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lab test? This action cannot be undone.
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
