import React from 'react';
import { Clock, Droplets, Star, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { HealthPackage } from '../backend';
import { useCart } from '../context/CartContext';

const PACKAGE_IMAGES: Record<string, string> = {
  'Full Body Checkup': 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&q=80',
  'Diabetes Panel': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
  'Thyroid Profile': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&q=80',
  'Liver Function': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80',
  'Heart Health': 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&q=80',
  "Women's Wellness": 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80',
  default: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&q=80',
};

function getPackageImage(pkg: HealthPackage): string {
  if (pkg.imageUrl && !pkg.imageUrl.includes('example.com')) return pkg.imageUrl;
  return PACKAGE_IMAGES[pkg.name] || PACKAGE_IMAGES['default'];
}

interface HealthPackageCardProps {
  pkg: HealthPackage;
}

export default function HealthPackageCard({ pkg }: HealthPackageCardProps) {
  const { addHealthPackageToCart, items } = useCart();
  const cartId = `healthPackage-${pkg.id}`;
  const inCart = items.some(i => i.id === cartId);

  const discountPct = Math.round((1 - Number(pkg.discountedPrice) / Number(pkg.marketPrice)) * 100);
  const maxTests = 4;
  const shownTests = pkg.includedTests.slice(0, maxTests);
  const extraTests = pkg.includedTests.length - maxTests;

  const maxParams = 3;
  const shownParams = pkg.testParameters.slice(0, maxParams);
  const extraParams = pkg.testParameters.length - maxParams;

  return (
    <Card className="pharma-card group hover:shadow-card-hover transition-all flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={getPackageImage(pkg)}
          alt={pkg.name}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = PACKAGE_IMAGES['default'];
          }}
        />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5">
            {discountPct}% OFF
          </Badge>
          {pkg.isPopular && (
            <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-current" /> Popular
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1">
        {/* Name */}
        <h3 className="font-semibold text-foreground mb-1 leading-tight">{pkg.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{pkg.description}</p>

        {/* Included Tests */}
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Includes</p>
          <div className="flex flex-wrap gap-1">
            {shownTests.map(test => (
              <span key={test} className="flex items-center gap-1 text-[10px] bg-primary/8 text-primary px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-2.5 h-2.5" /> {test}
              </span>
            ))}
            {extraTests > 0 && (
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                +{extraTests} more
              </span>
            )}
          </div>
        </div>

        {/* Test Parameters */}
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Key Parameters</p>
          <p className="text-xs text-foreground/80">
            {shownParams.join(', ')}
            {extraParams > 0 && <span className="text-muted-foreground"> +{extraParams} more</span>}
          </p>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="flex items-center gap-1 text-xs bg-pharma-surface px-2.5 py-1 rounded-full">
            <Droplets className="w-3 h-3 text-pharma-blue" /> {pkg.sampleType}
          </span>
          <span className="flex items-center gap-1 text-xs bg-pharma-surface px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3 text-primary" /> {pkg.turnaroundTime}
          </span>
        </div>

        {/* Pricing + CTA */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-xl font-bold text-foreground">₹{Number(pkg.discountedPrice)}</p>
            <p className="text-xs text-muted-foreground line-through">₹{Number(pkg.marketPrice)}</p>
          </div>
          <Button
            size="sm"
            className="rounded-pill font-semibold"
            onClick={() => addHealthPackageToCart(pkg)}
            disabled={inCart}
            variant={inCart ? 'secondary' : 'default'}
          >
            {inCart ? (
              <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Added</>
            ) : (
              <><ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Add to Cart</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
