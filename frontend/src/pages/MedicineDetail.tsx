import React, { useState } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import {
  ShoppingCart, Zap, Star, AlertCircle, ChevronLeft,
  Package, Truck, Shield, ArrowRight
} from 'lucide-react';
import { useGetProductById, useGetProductsByCategory } from '../hooks/useQueries';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { getProductImage } from '../components/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function getAverageRating(ratings: bigint[]): number {
  if (!ratings || ratings.length === 0) return 0;
  return ratings.reduce((a, b) => a + Number(b), 0) / ratings.length;
}

export default function MedicineDetail() {
  const { id } = useParams({ from: '/medicine/$id' });
  const navigate = useNavigate();
  const { addProductToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { data: product, isLoading } = useGetProductById(id);
  const { data: relatedProducts } = useGetProductsByCategory(product?.category);

  const handleAddToCart = () => {
    if (!product) return;
    addProductToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addProductToCart(product, quantity);
    navigate({ to: '/cart' });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-96 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Button
          className="mt-4 rounded-pill"
          onClick={() => navigate({ to: '/medicines', search: { q: '', category: '' } })}
        >
          Browse Products
        </Button>
      </div>
    );
  }

  const avgRating = getAverageRating(product.ratings);
  const discountPercent = product.discountedPrice
    ? Math.round(((Number(product.price) - Number(product.discountedPrice)) / Number(product.price)) * 100)
    : 0;
  const imageUrl = getProductImage(product);
  const related = relatedProducts?.filter(p => p.id !== product.id).slice(0, 6) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate({ to: '/medicines', search: { q: '', category: '' } })}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Medicines
      </button>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Product Image */}
        <div className="pharma-card overflow-hidden">
          <div className="relative bg-pharma-surface p-6">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-72 md:h-96 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&q=80';
              }}
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 pharma-badge-discount text-sm px-3 py-1">
                {discountPercent}% OFF
              </span>
            )}
            {product.requiresPrescription && (
              <span className="absolute top-4 right-4 bg-pharma-blue text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Prescription Required
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{product.manufacturer}</p>
            <h1 className="text-2xl font-display font-bold text-foreground mt-1">{product.name}</h1>
            <Badge variant="secondary" className="mt-2">{product.category}</Badge>
          </div>

          {/* Rating */}
          {avgRating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-pharma-orange text-pharma-orange" />
                <span className="font-bold text-sm">{avgRating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">({product.ratings.length} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">
              ₹{product.discountedPrice ? Number(product.discountedPrice) : Number(product.price)}
            </span>
            {product.discountedPrice && (
              <span className="text-lg text-muted-foreground line-through">₹{Number(product.price)}</span>
            )}
            {discountPercent > 0 && (
              <span className="text-sm font-semibold text-pharma-orange">Save {discountPercent}%</span>
            )}
          </div>

          {/* Stock */}
          <p className={`text-sm font-medium ${Number(product.stockCount) > 0 ? 'text-primary' : 'text-destructive'}`}>
            {Number(product.stockCount) > 0 ? `✓ In Stock (${Number(product.stockCount)} units)` : '✗ Out of Stock'}
          </p>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Quantity:</span>
            <div className="flex items-center border border-border rounded-xl overflow-hidden">
              <button
                className="px-3 py-2 hover:bg-accent transition-colors text-lg font-bold"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >−</button>
              <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{quantity}</span>
              <button
                className="px-3 py-2 hover:bg-accent transition-colors text-lg font-bold"
                onClick={() => setQuantity(q => q + 1)}
              >+</button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3">
            <Button
              className="flex-1 rounded-pill font-semibold"
              variant={addedToCart ? 'secondary' : 'default'}
              onClick={handleAddToCart}
              disabled={Number(product.stockCount) === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {addedToCart ? 'Added!' : 'Add to Cart'}
            </Button>
            <Button
              className="flex-1 rounded-pill font-semibold bg-pharma-orange hover:bg-pharma-orange/90 text-white"
              onClick={handleBuyNow}
              disabled={Number(product.stockCount) === 0}
            >
              <Zap className="w-4 h-4 mr-2" />
              Buy Now
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Package, text: 'Free Delivery' },
              { icon: Shield, text: '100% Genuine' },
              { icon: Truck, text: 'Fast Shipping' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1 p-3 bg-pharma-surface rounded-xl text-center">
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-xs font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl">Related Products</h2>
            <Link
              to="/medicines"
              search={{ q: '', category: product.category }}
              className="text-sm text-primary font-semibold flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {related.map(p => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
