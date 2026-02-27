import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Loader2 } from 'lucide-react';
import type { LabTest } from '../../backend';
import ImageUploadField from './ImageUploadField';

interface LabTestFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LabTest) => Promise<void>;
  initialData?: LabTest | null;
  isSubmitting?: boolean;
}

const EMPTY_FORM: Omit<LabTest, 'id'> = {
  name: '',
  description: '',
  imageUrl: '',
  testParameters: [],
  marketPrice: BigInt(0),
  discountedPrice: BigInt(0),
  sampleType: '',
  turnaroundTime: '',
};

export default function LabTestForm({ open, onClose, onSubmit, initialData, isSubmitting }: LabTestFormProps) {
  const [form, setForm] = useState<Omit<LabTest, 'id'>>(EMPTY_FORM);
  const [paramInput, setParamInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description,
        imageUrl: initialData.imageUrl,
        testParameters: [...initialData.testParameters],
        marketPrice: initialData.marketPrice,
        discountedPrice: initialData.discountedPrice,
        sampleType: initialData.sampleType,
        turnaroundTime: initialData.turnaroundTime,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setParamInput('');
  }, [initialData, open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (Number(form.marketPrice) <= 0) e.marketPrice = 'Market price must be > 0';
    if (Number(form.discountedPrice) <= 0) e.discountedPrice = 'Discounted price must be > 0';
    if (Number(form.discountedPrice) > Number(form.marketPrice)) e.discountedPrice = 'Discounted price must be ≤ market price';
    if (!form.sampleType.trim()) e.sampleType = 'Sample type is required';
    if (!form.turnaroundTime.trim()) e.turnaroundTime = 'Turnaround time is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ ...form, id: initialData?.id || '' });
  };

  const addParam = () => {
    const trimmed = paramInput.trim();
    if (trimmed && !form.testParameters.includes(trimmed)) {
      setForm(f => ({ ...f, testParameters: [...f.testParameters, trimmed] }));
      setParamInput('');
    }
  };

  const removeParam = (param: string) => {
    setForm(f => ({ ...f, testParameters: f.testParameters.filter(p => p !== param) }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Lab Test' : 'Add New Lab Test'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="lt-name">Test Name *</Label>
              <Input
                id="lt-name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Complete Blood Count (CBC)"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="lt-desc">Description *</Label>
              <Textarea
                id="lt-desc"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of the test"
                rows={2}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label htmlFor="lt-market-price">Market Price (₹) *</Label>
              <Input
                id="lt-market-price"
                type="number"
                min={0}
                value={Number(form.marketPrice)}
                onChange={e => setForm(f => ({ ...f, marketPrice: BigInt(Math.max(0, parseInt(e.target.value) || 0)) }))}
                className={errors.marketPrice ? 'border-destructive' : ''}
              />
              {errors.marketPrice && <p className="text-xs text-destructive mt-1">{errors.marketPrice}</p>}
            </div>

            <div>
              <Label htmlFor="lt-disc-price">Discounted Price (₹) *</Label>
              <Input
                id="lt-disc-price"
                type="number"
                min={0}
                value={Number(form.discountedPrice)}
                onChange={e => setForm(f => ({ ...f, discountedPrice: BigInt(Math.max(0, parseInt(e.target.value) || 0)) }))}
                className={errors.discountedPrice ? 'border-destructive' : ''}
              />
              {errors.discountedPrice && <p className="text-xs text-destructive mt-1">{errors.discountedPrice}</p>}
            </div>

            <div>
              <Label htmlFor="lt-sample">Sample Type *</Label>
              <Input
                id="lt-sample"
                value={form.sampleType}
                onChange={e => setForm(f => ({ ...f, sampleType: e.target.value }))}
                placeholder="e.g. Blood, Urine"
                className={errors.sampleType ? 'border-destructive' : ''}
              />
              {errors.sampleType && <p className="text-xs text-destructive mt-1">{errors.sampleType}</p>}
            </div>

            <div>
              <Label htmlFor="lt-turnaround">Turnaround Time *</Label>
              <Input
                id="lt-turnaround"
                value={form.turnaroundTime}
                onChange={e => setForm(f => ({ ...f, turnaroundTime: e.target.value }))}
                placeholder="e.g. 24 hours"
                className={errors.turnaroundTime ? 'border-destructive' : ''}
              />
              {errors.turnaroundTime && <p className="text-xs text-destructive mt-1">{errors.turnaroundTime}</p>}
            </div>

            <div className="md:col-span-2">
              <Label>Test Parameters</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={paramInput}
                  onChange={e => setParamInput(e.target.value)}
                  placeholder="Add a parameter..."
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addParam(); } }}
                />
                <Button type="button" variant="outline" size="sm" onClick={addParam}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.testParameters.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.testParameters.map(p => (
                    <span key={p} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full">
                      {p}
                      <button type="button" onClick={() => removeParam(p)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <ImageUploadField
                currentImageUrl={form.imageUrl}
                onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
                label="Test Image"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {initialData ? 'Update Test' : 'Add Test'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
