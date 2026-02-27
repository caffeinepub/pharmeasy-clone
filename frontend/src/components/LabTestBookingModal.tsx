import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, CheckCircle2, TestTube2, Clock } from 'lucide-react';
import type { LabTest } from '../backend';
import { useBookLabTest } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface LabTestBookingModalProps {
  open: boolean;
  onClose: () => void;
  labTest: LabTest | null;
  onLoginRequired: () => void;
}

const TIME_SLOTS = [
  { label: 'Morning', time: '7:00 AM - 9:00 AM', value: 7 },
  { label: 'Mid Morning', time: '9:00 AM - 11:00 AM', value: 9 },
  { label: 'Afternoon', time: '12:00 PM - 2:00 PM', value: 12 },
  { label: 'Evening', time: '4:00 PM - 6:00 PM', value: 16 },
];

export default function LabTestBookingModal({ open, onClose, labTest, onLoginRequired }: LabTestBookingModalProps) {
  const { identity } = useInternetIdentity();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const bookLabTest = useBookLabTest();

  const handleBook = async () => {
    if (!identity) { onLoginRequired(); return; }
    if (!selectedDate || selectedSlot === null || !labTest) return;

    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(selectedSlot, 0, 0, 0);
    const appointmentTime = BigInt(appointmentDate.getTime()) * BigInt(1_000_000);

    try {
      await bookLabTest.mutateAsync({ labTestId: labTest.id, appointmentTime });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedDate(undefined);
        setSelectedSlot(null);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  const handleClose = () => {
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setSuccess(false);
    onClose();
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube2 className="w-5 h-5 text-primary" />
            Book Lab Test
          </DialogTitle>
          {labTest && (
            <DialogDescription>
              {labTest.name} — ₹{Number(labTest.discountedPrice)}
            </DialogDescription>
          )}
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="w-16 h-16 text-primary" />
            <p className="font-semibold text-lg">Booking Confirmed!</p>
            <p className="text-sm text-muted-foreground text-center">
              Your lab test has been booked. Our team will contact you shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Date Picker */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Select Date</h4>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < tomorrow}
                className="rounded-xl border border-border mx-auto"
              />
            </div>

            {/* Time Slots */}
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Select Time Slot
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot.value}
                    onClick={() => setSelectedSlot(slot.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedSlot === slot.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <p className="font-semibold text-sm">{slot.label}</p>
                    <p className="text-xs text-muted-foreground">{slot.time}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-pill" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-pill font-semibold"
                onClick={handleBook}
                disabled={!selectedDate || selectedSlot === null || bookLabTest.isPending}
              >
                {bookLabTest.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking...</>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
