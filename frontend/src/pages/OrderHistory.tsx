import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Package, TestTube2, ChevronDown, ChevronUp, Calendar, Clock } from 'lucide-react';
import { useGetMyOrders, useGetMyLabTestBookings, useGetAllLabTests } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { getProductImage } from '../components/ProductCard';
import OrderStatusStepper from '../components/OrderStatusStepper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginButton from '../components/LoginButton';
import { OrderStatus } from '../backend';
import type { Order, LabTestBooking } from '../backend';

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.delivered: return 'bg-primary/10 text-primary';
    case OrderStatus.shipped: return 'bg-pharma-orange/10 text-pharma-orange';
    case OrderStatus.processing: return 'bg-pharma-blue/10 text-pharma-blue';
    case OrderStatus.placed: return 'bg-muted text-muted-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}

function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.delivered: return 'Delivered';
    case OrderStatus.shipped: return 'Shipped';
    case OrderStatus.processing: return 'Processing';
    case OrderStatus.placed: return 'Placed';
    default: return 'Unknown';
  }
}

function formatDate(time: bigint): string {
  const ms = Number(time) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="pharma-card overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Order #{order.id}</p>
              <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        {/* Item thumbnails */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex -space-x-2">
            {order.items.slice(0, 3).map((item, i) => (
              <img
                key={i}
                src={getProductImage(item.product)}
                alt={item.product.name}
                className="w-8 h-8 rounded-lg border-2 border-card object-cover bg-pharma-surface"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=50&q=80';
                }}
              />
            ))}
            {order.items.length > 3 && (
              <div className="w-8 h-8 rounded-lg border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold">
                +{order.items.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
          <span className="ml-auto font-bold text-sm">₹{Number(order.totalAmount)}</span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 pb-4">
          {/* Status Stepper */}
          <div className="py-2">
            <OrderStatusStepper status={order.status} />
          </div>

          {/* Items */}
          <div className="space-y-3 mt-2">
            <h4 className="font-semibold text-sm">Order Items</h4>
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <img
                  src={getProductImage(item.product)}
                  alt={item.product.name}
                  className="w-12 h-12 rounded-xl object-cover bg-pharma-surface shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=80&q=80';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {Number(item.quantity)}</p>
                </div>
                <p className="text-sm font-semibold">
                  ₹{(item.product.discountedPrice ? Number(item.product.discountedPrice) : Number(item.product.price)) * Number(item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Delivery Address */}
          <div className="mt-4 bg-pharma-surface rounded-xl p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">DELIVERY ADDRESS</p>
            <p className="text-sm">{order.deliveryAddress.street}</p>
            <p className="text-sm text-muted-foreground">
              {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function LabTestBookingCard({ booking, labTestName }: { booking: LabTestBooking; labTestName: string }) {
  const appointmentDate = new Date(Number(booking.appointmentTime) / 1_000_000);

  return (
    <div className="pharma-card p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-pharma-blue/10 rounded-xl flex items-center justify-center shrink-0">
          <TestTube2 className="w-5 h-5 text-pharma-blue" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">{labTestName}</p>
              <p className="text-xs text-muted-foreground">Booking #{booking.id}</p>
            </div>
            <Badge variant="secondary" className="text-xs">Lab Test</Badge>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {appointmentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {appointmentDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderHistory() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: orders, isLoading: ordersLoading } = useGetMyOrders();
  const { data: bookings, isLoading: bookingsLoading } = useGetMyLabTestBookings();
  const { data: labTests } = useGetAllLabTests();

  if (!identity) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="text-xl font-display font-bold mb-2">Login to view orders</h2>
        <p className="text-muted-foreground mb-6">Please login to see your order history</p>
        <LoginButton className="w-full" />
      </div>
    );
  }

  const getLabTestName = (labTestId: string): string => {
    return labTests?.find(t => t.id === labTestId)?.name || 'Lab Test';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold mb-6">My Orders &amp; Bookings</h1>

      <Tabs defaultValue="orders">
        <TabsList className="mb-6 rounded-xl">
          <TabsTrigger value="orders" className="rounded-lg">
            <Package className="w-4 h-4 mr-2" /> Orders
            {orders && orders.length > 0 && (
              <span className="ml-2 bg-primary/10 text-primary text-xs font-bold px-1.5 py-0.5 rounded-full">
                {orders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="lab-tests" className="rounded-lg">
            <TestTube2 className="w-4 h-4 mr-2" /> Lab Tests
            {bookings && bookings.length > 0 && (
              <span className="ml-2 bg-pharma-blue/10 text-pharma-blue text-xs font-bold px-1.5 py-0.5 rounded-full">
                {bookings.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-3">
              {[...orders].sort((a, b) => Number(b.createdAt) - Number(a.createdAt)).map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" />
              <p className="font-semibold text-foreground mb-1">No orders yet</p>
              <p className="text-sm text-muted-foreground mb-4">Start shopping to see your orders here</p>
              <Button
                className="rounded-pill"
                onClick={() => navigate({ to: '/medicines', search: { q: '', category: '' } })}
              >
                Browse Products
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="lab-tests">
          {bookingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-3">
              {[...bookings].sort((a, b) => Number(b.createdAt) - Number(a.createdAt)).map(booking => (
                <LabTestBookingCard
                  key={booking.id}
                  booking={booking}
                  labTestName={getLabTestName(booking.labTestId)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <TestTube2 className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" />
              <p className="font-semibold text-foreground mb-1">No lab test bookings</p>
              <p className="text-sm text-muted-foreground mb-4">Book a lab test to see it here</p>
              <Button className="rounded-pill" onClick={() => navigate({ to: '/lab-tests' })}>
                Browse Lab Tests
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
