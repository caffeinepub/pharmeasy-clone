import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle2, MapPin, ShoppingBag, Loader2, AlertCircle, ChevronLeft, TestTube2, Package, Pill } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCreateOrder } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import LoginButton from '../components/LoginButton';
import UploadPrescriptionModal from '../components/UploadPrescriptionModal';
import type { Address, OrderItem } from '../backend';
import type { CartItemType } from '../context/CartContext';

type Step = 'address' | 'summary' | 'success';

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

export default function Checkout() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { items, grandTotal, hasRxItems, clearCart } = useCart();
  const createOrder = useCreateOrder();

  const [step, setStep] = useState<Step>('address');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [address, setAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});

  if (!identity) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-pharma-surface rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-xl font-display font-bold mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-6">Please login to proceed with checkout</p>
        <LoginButton className="w-full" />
      </div>
    );
  }

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="text-xl font-display font-bold mb-2">Your cart is empty</h2>
        <Button
          className="rounded-pill mt-4"
          onClick={() => navigate({ to: '/medicines', search: { q: '', category: '' } })}
        >
          Browse Products
        </Button>
      </div>
    );
  }

  const validateAddress = (): boolean => {
    const newErrors: Partial<Record<keyof Address, string>> = {};
    if (!address.street.trim()) newErrors.street = 'Street address is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    if (!address.state.trim()) newErrors.state = 'State is required';
    if (!address.zip.trim()) newErrors.zip = 'ZIP code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    // Only medicine products map to OrderItem (backend type); lab tests/packages are included as-is in total
    const orderItems: OrderItem[] = items
      .filter(item => item.type === 'product' && item.product)
      .map(item => ({
        product: item.product!,
        quantity: BigInt(item.quantity),
      }));

    try {
      const newOrderId = await createOrder.mutateAsync({
        items: orderItems,
        totalAmount: BigInt(grandTotal),
        deliveryAddress: address,
        requiresPrescription: hasRxItems,
      });
      setOrderId(newOrderId);
      clearCart();
      setStep('success');
      if (hasRxItems) {
        setTimeout(() => setUploadModalOpen(true), 500);
      }
    } catch (err) {
      console.error('Order creation failed:', err);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-14 h-14 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">Order Placed!</h2>
        <p className="text-muted-foreground mb-2">
          Your order #{orderId} has been placed successfully.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          You'll receive a confirmation shortly.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-pill" onClick={() => navigate({ to: '/orders' })}>
            Track Order
          </Button>
          <Button className="flex-1 rounded-pill" onClick={() => navigate({ to: '/' })}>
            Continue Shopping
          </Button>
        </div>

        {hasRxItems && orderId && (
          <UploadPrescriptionModal
            open={uploadModalOpen}
            onClose={() => setUploadModalOpen(false)}
            orderId={orderId}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold mb-6">Checkout</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className={`flex items-center gap-2 ${step === 'address' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step === 'address' ? 'border-primary bg-primary text-primary-foreground' : 'border-primary bg-primary/10 text-primary'}`}>
            1
          </div>
          <span className="text-sm font-medium hidden sm:block">Delivery Address</span>
        </div>
        <div className="flex-1 h-0.5 bg-border max-w-[60px]" />
        <div className={`flex items-center gap-2 ${step === 'summary' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step === 'summary' ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>
            2
          </div>
          <span className="text-sm font-medium hidden sm:block">Order Summary</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 'address' && (
            <div className="pharma-card p-6">
              <h2 className="font-display font-bold text-lg mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Delivery Address
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={address.street}
                    onChange={e => setAddress(prev => ({ ...prev, street: e.target.value }))}
                    placeholder="House no., Street, Area"
                    className={errors.street ? 'border-destructive' : ''}
                  />
                  {errors.street && <p className="text-xs text-destructive mt-1">{errors.street}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={e => setAddress(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City"
                      className={errors.city ? 'border-destructive' : ''}
                    />
                    {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={address.state}
                      onChange={e => setAddress(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="State"
                      className={errors.state ? 'border-destructive' : ''}
                    />
                    {errors.state && <p className="text-xs text-destructive mt-1">{errors.state}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zip">ZIP Code *</Label>
                    <Input
                      id="zip"
                      value={address.zip}
                      onChange={e => setAddress(prev => ({ ...prev, zip: e.target.value }))}
                      placeholder="PIN Code"
                      className={errors.zip ? 'border-destructive' : ''}
                    />
                    {errors.zip && <p className="text-xs text-destructive mt-1">{errors.zip}</p>}
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={address.country}
                      onChange={e => setAddress(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
              <Button
                className="w-full mt-6 rounded-pill font-semibold"
                onClick={() => {
                  if (validateAddress()) setStep('summary');
                }}
              >
                Continue to Summary
              </Button>
            </div>
          )}

          {step === 'summary' && (
            <div className="pharma-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={() => setStep('address')}
                  className="p-1.5 rounded-full hover:bg-accent transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="font-display font-bold text-lg">Order Summary</h2>
              </div>

              <div className="space-y-3 mb-6">
                {items.map(item => {
                  const fallback = getItemFallback(item.type);
                  return (
                    <div key={item.id} className="flex gap-3 items-center">
                      <img
                        src={item.imageUrl && !item.imageUrl.includes('example.com') ? item.imageUrl : fallback}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-xl bg-pharma-surface shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
                      />
                      <div className="flex-1 min-w-0">
                        <ItemTypeBadge type={item.type} />
                        <p className="font-medium text-sm line-clamp-1 mt-0.5">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm">₹{item.price * item.quantity}</p>
                        {item.marketPrice !== item.price && (
                          <p className="text-xs text-muted-foreground line-through">₹{item.marketPrice * item.quantity}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4 mb-5">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Delivery Address</span>
                </div>
                <p className="text-sm font-medium">
                  {address.street}, {address.city}, {address.state} - {address.zip}
                </p>
              </div>

              <Button
                className="w-full rounded-pill font-semibold"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing Order...</>
                ) : (
                  <>Place Order · ₹{grandTotal}</>
                )}
              </Button>

              {createOrder.isError && (
                <p className="text-xs text-destructive mt-3 text-center">
                  Failed to place order. Please try again.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Price Summary Sidebar */}
        <div>
          <div className="pharma-card p-5">
            <h3 className="font-display font-bold text-base mb-4">Price Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">MRP Total</span>
                <span>₹{items.reduce((s, i) => s + i.marketPrice * i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-primary">
                <span>Discount</span>
                <span>-₹{items.reduce((s, i) => s + (i.marketPrice - i.price) * i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-primary font-medium">FREE</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
