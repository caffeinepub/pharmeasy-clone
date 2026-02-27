import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useGetAllOrders, useUpdateOrderStatus } from '../../hooks/useQueries';
import { OrderStatus } from '../../backend';
import type { Order } from '../../backend';

const STATUS_COLORS: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
};

const STATUS_OPTIONS = [
  { value: OrderStatus.placed, label: 'Placed' },
  { value: OrderStatus.processing, label: 'Processing' },
  { value: OrderStatus.shipped, label: 'Shipped' },
  { value: OrderStatus.delivered, label: 'Delivered' },
];

function formatDate(time: bigint) {
  return new Date(Number(time) / 1_000_000).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (status: string) => {
    try {
      await updateStatus.mutateAsync({ orderId: order.id, status: status as OrderStatus });
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const statusKey = typeof order.status === 'object'
    ? Object.keys(order.status)[0]
    : String(order.status);

  return (
    <>
      <tr className="border-b border-border hover:bg-muted/30 transition-colors">
        <td className="px-4 py-3 text-sm font-mono text-muted-foreground">#{order.id}</td>
        <td className="px-4 py-3 text-sm text-foreground">{order.userId.slice(0, 12)}...</td>
        <td className="px-4 py-3 text-sm font-semibold text-foreground">₹{Number(order.totalAmount)}</td>
        <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
        <td className="px-4 py-3">
          <Select value={statusKey} onValueChange={handleStatusChange} disabled={updateStatus.isPending}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </td>
        <td className="px-4 py-3 text-right">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </Button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-muted/20">
          <td colSpan={6} className="px-4 py-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Order Items</p>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm bg-card rounded-lg px-3 py-2 border border-border">
                  <div>
                    <p className="font-medium text-foreground">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">{item.product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₹{Number(item.product.price)} × {Number(item.quantity)}</p>
                    <p className="text-xs text-muted-foreground">= ₹{Number(item.product.price) * Number(item.quantity)}</p>
                  </div>
                </div>
              ))}
              <div className="text-xs text-muted-foreground mt-2">
                <span className="font-medium">Delivery: </span>
                {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zip}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function OrdersManagement() {
  const { data: orders, isLoading } = useGetAllOrders();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-foreground">Orders</h2>
        <p className="text-sm text-muted-foreground">View and manage all pharmacy orders</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-semibold text-foreground mb-1">No orders yet</p>
          <p className="text-sm text-muted-foreground">Orders will appear here once customers place them</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Details</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
