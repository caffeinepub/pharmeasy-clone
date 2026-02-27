import React from 'react';
import { Link } from '@tanstack/react-router';
import { ShoppingCart, Star, AlertCircle } from 'lucide-react';
import type { Product } from '../backend';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

function getAverageRating(ratings: bigint[]): number {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((a, b) => a + Number(b), 0);
  return sum / ratings.length;
}

function getDiscountPercent(price: bigint, discountedPrice?: bigint): number {
  if (!discountedPrice) return 0;
  const orig = Number(price);
  const disc = Number(discountedPrice);
  return Math.round(((orig - disc) / orig) * 100);
}

const FALLBACK_IMAGES: Record<string, string> = {
  'Pain Relief': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80',
  'Cold & Flu': 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=300&q=80',
  'Supplements': 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&q=80',
  'Prescription Medication': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&q=80',
  'Diabetes Care': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300&q=80',
  'default': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&q=80',
};

export function getProductImage(product: Product): string {
  if (product.imageUrl && !product.imageUrl.includes('example.com')) {
    return product.imageUrl;
  }
  return FALLBACK_IMAGES[product.category] || FALLBACK_IMAGES['default'];
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addProductToCart } = useCart();
  const avgRating = getAverageRating(product.ratings);
  const discountPercent = getDiscountPercent(product.price, product.discountedPrice);
  const imageUrl = getProductImage(product);

  return (
    <div className="pharma-card group hover:shadow-card-hover transition-all duration-200 flex flex-col">
      <Link to="/medicine/$id" params={{ id: product.id }} className="block">
        <div className="relative overflow-hidden bg-pharma-surface">
          <img
            src={imageUrl}
            alt={product.name}
            className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${compact ? 'h-36' : 'h-44'}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGES['default'];
            }}
          />
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 pharma-badge-discount">
              {discountPercent}% OFF
            </span>
          )}
          {product.requiresPrescription && (
            <span className="absolute top-2 right-2 bg-pharma-blue/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Rx
            </span>
          )}
        </div>
      </Link>

      <div className="p-3 flex flex-col flex-1">
        <Link to="/medicine/$id" params={{ id: product.id }}>
          <p className="text-xs text-muted-foreground mb-0.5">{product.manufacturer}</p>
          <h3 className={`font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors ${compact ? 'text-sm' : 'text-sm'}`}>
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {avgRating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${star <= Math.round(avgRating) ? 'fill-pharma-orange text-pharma-orange' : 'text-muted-foreground/30'}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.ratings.length})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-bold text-foreground">
            ₹{product.discountedPrice ? Number(product.discountedPrice) : Number(product.price)}
          </span>
          {product.discountedPrice && (
            <span className="text-xs text-muted-foreground line-through">
              ₹{Number(product.price)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <Button
          size="sm"
          className="mt-3 w-full rounded-pill font-semibold text-xs"
          onClick={(e) => {
            e.preventDefault();
            addProductToCart(product);
          }}
        >
          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
