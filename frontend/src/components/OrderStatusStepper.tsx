import React from 'react';
import { Check, Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import { OrderStatus } from '../backend';

interface OrderStatusStepperProps {
  status: OrderStatus;
}

const steps = [
  { key: OrderStatus.placed, label: 'Order Placed', icon: Package },
  { key: OrderStatus.processing, label: 'Processing', icon: Clock },
  { key: OrderStatus.shipped, label: 'Shipped', icon: Truck },
  { key: OrderStatus.delivered, label: 'Delivered', icon: CheckCircle2 },
];

const statusOrder = [OrderStatus.placed, OrderStatus.processing, OrderStatus.shipped, OrderStatus.delivered];

export default function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border z-0">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center gap-2 z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isCurrent
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-card border-border text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className={`text-xs font-medium text-center max-w-[70px] ${
                isCurrent ? 'text-primary' : isPending ? 'text-muted-foreground' : 'text-foreground'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
