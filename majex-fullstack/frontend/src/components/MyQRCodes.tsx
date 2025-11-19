import React from 'react';
import { Booking } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface MyQRCodesProps {
  bookings: Booking[];
}

export const MyQRCodes: React.FC<MyQRCodesProps> = ({ bookings }) => {
  const activeBookings = bookings.filter(b => b.status === 'Confirmed');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">My Entry Passes</h2>
      <p className="text-slate-500">Scan these codes at the facility entrance to gain access.</p>

      {activeBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeBookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col items-center text-center transition-transform hover:-translate-y-1">
              <div className="bg-indigo-600 w-full p-4 text-white">
                <h3 className="font-bold text-lg">{booking.facilityName}</h3>
              </div>
              
              <div className="p-6 bg-white w-full flex flex-col items-center">
                <div className="p-3 border-2 border-slate-100 rounded-xl mb-4">
                  <QRCodeCanvas 
                    value={booking.qrCodeData} 
                    size={180}
                    level={"H"}
                    includeMargin={true}
                  />
                </div>
                
                <div className="w-full space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-center gap-2 bg-slate-50 py-2 rounded-lg">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium">{new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-slate-50 py-2 rounded-lg">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium">{booking.timeSlot}</span>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-slate-400 font-mono">
                  ID: {booking.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-800">No Active Passes</h3>
          <p className="text-slate-500">Book a facility to generate an entry QR code.</p>
        </div>
      )}
    </div>
  );
};