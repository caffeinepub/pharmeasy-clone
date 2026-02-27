import React from 'react';
import { Clock, Droplets, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { LabTest } from '../backend';
import { useCart } from '../context/CartContext';

const LAB_TEST_IMAGES: Record<string, string> = {
  'Complete Blood Count (CBC)': 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&q=80',
  'Lipid Profile': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&q=80',
  'Liver Function Test (LFT)': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80',
  'Renal Function Test (RFT)': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80',
  'Blood Sugar Test': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
  'Thyroid Function Test (TFT)': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&q=80',
  'Uric Acid Test': 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&q=80',
  'Calcium Test': 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&q=80',
  'Vitamin D Test': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80',
  'Urine Routine Test': 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&q=80',
  default: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&q=80',
};

function getLabTestImage(test: LabTest): string {
  if (test.imageUrl && !test.imageUrl.includes('example.com')) return test.imageUrl;
  return LAB_TEST_IMAGES[test.name] || LAB_TEST_IMAGES['default'];
}

interface LabTestCardProps {
  test: LabTest;
  onBookNow?: (test: LabTest) => void;
}

export default function LabTestCard({ test, onBookNow }: LabTestCardProps) {
  const { addLabTestToCart, items } = useCart();
  const cartId = `labTest-${test.id}`;
  const inCart = items.some(i => i.id === cartId);

  const discountPct = Math.round((1 - Number(test.discountedPrice) / Number(test.marketPrice)) * 100);

  const maxParams = 4;
  const shownParams = test.testParameters.slice(0, maxParams);
  const extraParams = test.testParameters.length - maxParams;

  return (
    <Card className="pharma-card group hover:shadow-card-hover transition-all flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={getLabTestImage(test)}
          alt={test.name}
          className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = LAB_TEST_IMAGES['default'];
          }}
        />
        <div className="absolute top-2 left-2">
          <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5">
            {discountPct}% OFF
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1">
        {/* Name */}
        <h3 className="font-semibold text-foreground mb-1 leading-tight">{test.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{test.description}</p>

        {/* Test Parameters */}
        {test.testParameters.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Parameters</p>
            <div className="flex flex-wrap gap-1">
              {shownParams.map(param => (
                <span key={param} className="text-[10px] bg-pharma-surface text-foreground/80 px-2 py-0.5 rounded-full border border-border">
                  {param}
                </span>
              ))}
              {extraParams > 0 && (
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  +{extraParams} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="flex items-center gap-1 text-xs bg-pharma-surface px-2.5 py-1 rounded-full">
            <Droplets className="w-3 h-3 text-pharma-blue" /> {test.sampleType}
          </span>
          <span className="flex items-center gap-1 text-xs bg-pharma-surface px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3 text-primary" /> {test.turnaroundTime}
          </span>
        </div>

        {/* Pricing + CTA */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-xl font-bold text-foreground">₹{Number(test.discountedPrice)}</p>
            <p className="text-xs text-muted-foreground line-through">₹{Number(test.marketPrice)}</p>
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <Button
              size="sm"
              className="rounded-pill font-semibold"
              onClick={() => addLabTestToCart(test)}
              disabled={inCart}
              variant={inCart ? 'secondary' : 'default'}
            >
              {inCart ? (
                <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Added</>
              ) : (
                <><ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Add to Cart</>
              )}
            </Button>
            {onBookNow && (
              <button
                onClick={() => onBookNow(test)}
                className="text-xs text-primary font-medium hover:underline"
              >
                Book Appointment
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
