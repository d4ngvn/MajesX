
import React, { useState } from 'react';
import { Facility, Booking, User } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
import { Clock, CheckCircle, Calendar, Trash2, XCircle, DollarSign } from 'lucide-react';

interface BookingSystemProps {
  user: User;
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
  bookings: Booking[];
  facilities: Facility[]; 
}

const TIME_SLOTS = ['08:00', '10:00', '14:00', '16:00', '18:00', '20:00'];

export const BookingSystem: React.FC<BookingSystemProps> = ({ user, addBooking, cancelBooking, bookings, facilities }) => {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<Booking | null>(null);

  const isSlotOccupied = (facilityId: string, date: string, slot: string) => {
    return bookings.some(b => b.facilityId === facilityId && b.date === date && b.timeSlot === slot && b.status === 'Confirmed');
  };

  const handleBook = () => {
    if (!selectedFacility || !selectedSlot) return;

    const newBooking: Booking = {
      id: Math.random().toString(36).substring(7),
      facilityId: selectedFacility.id,
      facilityName: selectedFacility.name,
      userId: user.id,
      userName: user.name,
      date: selectedDate,
      timeSlot: selectedSlot,
      qrCodeData: `MAJEX-BOOK-${selectedFacility.id}-${user.id}-${Date.now()}`,
      status: 'Confirmed'
    };

    addBooking(newBooking);
    setSuccessModal(newBooking);
    setSelectedSlot(null);
  };

  const handleCancel = (id: string) => {
    if(window.confirm("Are you sure you want to cancel this booking?")) {
        cancelBooking(id);
    }
  };

  const myUpcomingBookings = bookings
    .filter(b => b.userId === user.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 relative">
      {/* Facility Selection Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Facility Booking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map(facility => (
            <div 
                key={facility.id} 
                onClick={() => setSelectedFacility(facility)}
                className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${selectedFacility?.id === facility.id ? 'border-indigo-600 shadow-lg scale-105' : 'border-transparent shadow-sm hover:shadow-md bg-white'}`}
            >
                <img src={facility.image} alt={facility.name} className="w-full h-32 object-cover" />
                <div className="p-4">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800">{facility.name}</h3>
                    <span className={`text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200`}>
                        {facility.type}
                    </span>
                </div>
                <div className="flex items-center text-xs text-slate-500 mt-2">
                    <Clock className="w-3 h-3 mr-1" />
                    {facility.openTime} - {facility.closeTime}
                </div>
                <div className="mt-2 font-bold text-indigo-600 text-sm flex items-center">
                    {facility.price > 0 ? `$${facility.price} / slot` : 'Free Access'}
                </div>
                </div>
            </div>
            ))}
        </div>
      </div>

      {/* Booking Details Form */}
      {selectedFacility && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 animate-fade-in-up">
          <div className="flex justify-between items-start mb-4">
             <div>
                <h3 className="text-lg font-bold">Book {selectedFacility.name}</h3>
                <p className="text-slate-500 text-sm">Price: <span className="font-bold text-slate-800">{selectedFacility.price > 0 ? `$${selectedFacility.price}` : 'Free'}</span></p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
              <input 
                type="date" 
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Available Slots</label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map(slot => {
                  const occupied = isSlotOccupied(selectedFacility.id, selectedDate, slot);
                  return (
                    <button
                      key={slot}
                      disabled={occupied}
                      onClick={() => setSelectedSlot(slot)}
                      className={`
                        py-2 px-3 rounded-lg text-sm font-medium transition-colors
                        ${occupied 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                          : selectedSlot === slot 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50'}
                      `}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleBook}
              disabled={!selectedSlot}
              className={`px-6 py-3 rounded-lg font-bold text-white shadow-md transition-all ${!selectedSlot ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'}`}
            >
              Confirm Booking {selectedFacility.price > 0 ? `($${selectedFacility.price})` : ''}
            </button>
          </div>
        </div>
      )}

      {/* Active Bookings List */}
      {myUpcomingBookings.length > 0 && (
        <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold text-slate-800">My Upcoming Bookings</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                        <tr>
                            <th className="p-4 font-semibold">Facility</th>
                            <th className="p-4 font-semibold">Date & Time</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {myUpcomingBookings.map(booking => (
                            <tr key={booking.id} className="hover:bg-slate-50">
                                <td className="p-4 font-medium text-slate-800">{booking.facilityName}</td>
                                <td className="p-4 text-slate-600 text-sm">
                                    {new Date(booking.date).toLocaleDateString()} <span className="text-slate-400">•</span> {booking.timeSlot}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                        ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                                          booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}
                                    `}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {booking.status === 'Confirmed' && (
                                        <button 
                                            onClick={() => handleCancel(booking.id)}
                                            className="text-sm text-red-500 hover:text-red-700 font-medium hover:underline flex items-center justify-end gap-1 w-full"
                                        >
                                            <XCircle className="w-4 h-4" /> Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Success Modal with QR */}
      {successModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h3>
            <p className="text-slate-500 mb-6">Present this QR code at the facility entrance.</p>
            
            <div className="bg-white p-4 border border-slate-200 rounded-xl inline-block shadow-inner mb-6">
              <QRCodeCanvas value={successModal.qrCodeData} size={180} />
            </div>
            
            <div className="text-left bg-slate-50 p-4 rounded-lg mb-6 text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-slate-500">Facility:</span>
                <span className="font-medium">{successModal.facilityName}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-500">Date:</span>
                <span className="font-medium">{successModal.date}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-500">Time:</span>
                <span className="font-medium">{successModal.timeSlot}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 mt-2">
                <span className="text-slate-500">Paid:</span>
                <span className="font-bold text-slate-800">{selectedFacility ? (selectedFacility.price > 0 ? `$${selectedFacility.price}` : 'Free') : '-'}</span>
              </div>
            </div>

            <button 
              onClick={() => { setSuccessModal(null); setSelectedFacility(null); }}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};