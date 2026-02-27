import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllBookings, useGetAllLabTests } from '../../hooks/useQueries';

function formatDateTime(time: bigint) {
  const date = new Date(Number(time) / 1_000_000);
  return {
    date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };
}

export default function LabBookingsManagement() {
  const { data: bookings, isLoading: bookingsLoading } = useGetAllBookings();
  const { data: labTests } = useGetAllLabTests();

  const getTestName = (labTestId: string) => {
    return labTests?.find(t => t.id === labTestId)?.name || labTestId;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-foreground">Lab Bookings</h2>
        <p className="text-sm text-muted-foreground">View all lab test appointment bookings</p>
      </div>

      {bookingsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-semibold text-foreground mb-1">No bookings yet</p>
          <p className="text-sm text-muted-foreground">Lab test bookings will appear here</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Booking ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Lab Test</TableHead>
                <TableHead>Appointment</TableHead>
                <TableHead className="hidden md:table-cell">Booked On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map(booking => {
                const appt = formatDateTime(booking.appointmentTime);
                const created = formatDateTime(booking.createdAt);
                return (
                  <TableRow key={booking.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-muted-foreground">#{booking.id}</TableCell>
                    <TableCell className="text-sm text-foreground">{booking.userId.slice(0, 12)}...</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground">{getTestName(booking.labTestId)}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm text-foreground">{appt.date}</span>
                        <Clock className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                        <span className="text-sm text-muted-foreground">{appt.time}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{created.date}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
