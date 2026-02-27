import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle, Upload, ArrowRight, Tag, TestTube2, Package, Pill } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UploadPrescriptionModal from '../components/UploadPrescriptionModal';
import type { CartItemType } from '../context/CartContext';

const LAB_TEST_FALLBACK = 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=200&q=80';
const PRODUCT_FALLBACK = 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&q=80';

function getItemFallback(type: CartItemType): string {
  if (type === 'labTest' || type === 'healthPackage') return LAB_TEST_FALLBACK;
  return PRODUCT_FALLBACK;
}

function ItemTypeBadge({ type }: { type: CartItemType }) {
  if (type === 'labTest') {
    return (
      <Badge variant="secondary" className="text-[10px] flex items-center gap-1 w-fit">
        <TestTube2 className="w-2.5 h-2.5" /> Lab Test
      </Badge>
    );
  }
  if (type === 'healthPackage') {
    return (
      <Badge variant="secondary" className="text-[10px] flex items-center gap-1 w-fit bg-primary/10 text-primary border-primary/20">
        <Package className="w-2.5 h-2.5" /> Package
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] flex items-center gap-1 w-fit">
      <Pill className="w-2.5 h-2.5" /> Medicine
    </Badge>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, subtotal, totalDiscount, grandTotal, hasRxItems } = useCart();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-pharma-surface rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 text-muted-foreground/40" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add medicines, lab tests, and health packages to get started</p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            className="rounded-pill font-semibold"
            onClick={() => navigate({ to: '/lab-tests' })}
          >
            Browse Lab Tests
          </Button>
          <Button
            className="rounded-pill font-semibold"
            onClick={() => navigate({ to: '/medicines', search: { q: '', category: '' } })}
          >
            Browse Medicines
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold mb-6">My Cart ({items.length} item{items.length !== 1 ? 's' : ''})</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {hasRxItems && (
            <div className="bg-pharma-blue/10 border border-pharma-blue/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-pharma-blue shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Prescription Required</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Some items require a valid prescription. Please upload it before checkout.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-pill border-pharma-blue text-pharma-blue hover:bg-pharma-blue/5 shrink-0"
                onClick={() => setUploadModalOpen(true)}
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Rx
              </Button>
            </div>
          )}

          {items.map(item => {
            const itemTotal = item.price * item.quantity;
            const fallback = getItemFallback(item.type);

            return (
              <div key={item.id} className="pharma-card p-4 flex gap-4">
                {/* Image */}
                {item.type === 'product' && item.product ? (
                  <Link to="/medicine/$id" params={{ id: item.product.id }}>
                    <img
                      src={item.imageUrl && !item.imageUrl.includes('example.com') ? item.imageUrl : fallback}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl bg-pharma-surface shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                    />
                  </Link>
                ) : (
                  <img
                    src={item.imageUrl && !item.imageUrl.includes('example.com') ? item.imageUrl : fallback}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-pharma-surface shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <ItemTypeBadge type={item.type} />
                      {item.type === 'product' && item.product ? (
                        <Link to="/medicine/$id" params={{ id: item.product.id }}>
                          <h3 className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2 mt-1">
                            {item.name}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="font-semibold text-sm line-clamp-2 mt-1">{item.name}</h3>
                      )}
                      {item.requiresPrescription && (
                        <Badge variant="secondary" className="mt-1 text-[10px]">
                          <AlertCircle className="w-2.5 h-2.5 mr-1" /> Rx Required
                        </Badge>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-border rounded-xl overflow-hidden">
                      <button
                        className="px-2.5 py-1.5 hover:bg-accent transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1.5 font-semibold text-sm min-w-[2.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        className="px-2.5 py-1.5 hover:bg-accent transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold">₹{itemTotal}</p>
                      {item.marketPrice !== item.price && (
                        <p className="text-xs text-muted-foreground line-through">
                          ₹{item.marketPrice * item.quantity}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="pharma-card p-5">
            <h3 className="font-display font-bold text-lg mb-4">Order Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                <span>₹{subtotal}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-primary">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Discount
                  </span>
                  <span>-₹{totalDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-primary font-medium">FREE</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            {totalDiscount > 0 && (
              <div className="mt-3 bg-primary/10 rounded-xl p-3 text-sm text-primary font-medium text-center">
                🎉 You save ₹{totalDiscount} on this order!
              </div>
            )}

            <Button
              className="w-full mt-5 rounded-pill font-semibold"
              size="lg"
              onClick={() => navigate({ to: '/checkout' })}
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Coupon */}
          <div className="pharma-card p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" /> Apply Coupon
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                className="flex-1 px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button size="sm" variant="outline" className="rounded-xl">Apply</Button>
            </div>
          </div>
        </div>
      </div>

      <UploadPrescriptionModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
}
