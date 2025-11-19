
import React, { useState } from 'react';
import { Facility, Booking } from '../types';
import { Plus, Edit, Trash2, Clock, Image as ImageIcon, DollarSign, TrendingUp, Calendar, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminAmenitiesProps {
  facilities: Facility[];
  bookings: Booking[];
  onAdd: (facility: Facility) => void;
  onUpdate: (facility: Facility) => void;
  onDelete: (id: string) => void;
}

export const AdminAmenities: React.FC<AdminAmenitiesProps> = ({ facilities, bookings, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentFacility, setCurrentFacility] = useState<Partial<Facility>>({ type: 'Sport', price: 0 });
  
  // Revenue Modal State
  const [revenueFacilityId, setRevenueFacilityId] = useState<string | null>(null);

  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentFacility({ type: 'Sport', openTime: '08:00', closeTime: '22:00', image: 'https://picsum.photos/400/200', price: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (facility: Facility) => {
    setIsEditMode(true);
    setCurrentFacility({ ...facility });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentFacility.name && currentFacility.type && currentFacility.openTime && currentFacility.closeTime && currentFacility.image && currentFacility.price !== undefined) {
      if (isEditMode && currentFacility.id) {
        onUpdate(currentFacility as Facility);
      } else {
        onAdd({ ...currentFacility, id: Date.now().toString() } as Facility);
      }
      setIsModalOpen(false);
    } else {
      alert("Please fill in all fields.");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this amenity?")) {
      onDelete(id);
    }
  };

  // Calculate revenue stats
  const getRevenueStats = (facilityId: string) => {
    const facility = facilities.find(f => f.id === facilityId);
    const price = facility?.price || 0;
    const relevantBookings = bookings.filter(b => 
        b.facilityId === facilityId && 
        (b.status === 'Confirmed' || b.status === 'Completed')
    );

    const totalRevenue = relevantBookings.length * price;
    const totalBookings = relevantBookings.length;

    // Monthly Breakdown for Chart
    const monthlyData: Record<string, number> = {};
    relevantBookings.forEach(b => {
        const month = new Date(b.date).toLocaleString('default', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + price;
    });

    const chartData = Object.entries(monthlyData).map(([name, amount]) => ({ name, amount }));
    
    // Add mock data if empty so chart looks nice for demo
    if (chartData.length === 0) {
        chartData.push({ name: 'Jan', amount: 0 }, { name: 'Feb', amount: 0 });
    }

    return { totalRevenue, totalBookings, chartData, facilityName: facility?.name };
  };

  const revenueStats = revenueFacilityId ? getRevenueStats(revenueFacilityId) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Amenities & Facilities</h2>
        <button 
          onClick={openAddModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Amenity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map(facility => (
          <div key={facility.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden group flex flex-col h-full">
            <div className="relative h-40 overflow-hidden shrink-0">
               <img 
                src={facility.image} 
                alt={facility.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
               />
               <div className="absolute top-2 right-2 flex gap-1">
                 <button 
                   onClick={() => openEditModal(facility)}
                   className="p-2 bg-white/90 rounded-full text-slate-700 hover:text-indigo-600 shadow-sm"
                 >
                   <Edit className="w-4 h-4" />
                 </button>
                 <button 
                   onClick={() => handleDelete(facility.id)}
                   className="p-2 bg-white/90 rounded-full text-slate-700 hover:text-red-600 shadow-sm"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 text-lg">{facility.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full border bg-slate-50 border-slate-100 text-slate-700`}>
                  {facility.type}
                </span>
              </div>
              <div className="flex items-center text-sm text-slate-500 mt-3 bg-slate-50 p-2 rounded-lg">
                <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                <span>{facility.openTime} - {facility.closeTime}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                 <span className="text-sm font-bold text-slate-700 flex items-center bg-green-50 px-2 py-1 rounded text-green-700">
                    <DollarSign className="w-3 h-3 mr-1" /> {facility.price > 0 ? `${facility.price} / slot` : 'Free'}
                 </span>
              </div>
              
              <div className="mt-auto pt-4">
                <button 
                    onClick={() => setRevenueFacilityId(facility.id)}
                    className="w-full py-2 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 flex items-center justify-center gap-2 font-medium transition-colors"
                >
                    <TrendingUp className="w-4 h-4" /> View Revenue
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {isEditMode ? 'Edit Amenity' : 'Add New Amenity'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Facility Name</label>
                <input 
                  type="text" 
                  required
                  value={currentFacility.name || ''}
                  onChange={e => setCurrentFacility({...currentFacility, name: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <input 
                    list="amenity-types"
                    type="text"
                    value={currentFacility.type}
                    onChange={e => setCurrentFacility({...currentFacility, type: e.target.value})}
                    placeholder="Select or type custom type"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                />
                <datalist id="amenity-types">
                  <option value="Sport" />
                  <option value="Pool" />
                  <option value="Gym" />
                  <option value="Entertainment" />
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Open Time</label>
                   <input 
                     type="time" 
                     required
                     value={currentFacility.openTime || ''}
                     onChange={e => setCurrentFacility({...currentFacility, openTime: e.target.value})}
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Close Time</label>
                   <input 
                     type="time" 
                     required
                     value={currentFacility.closeTime || ''}
                     onChange={e => setCurrentFacility({...currentFacility, closeTime: e.target.value})}
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                   />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price per Slot ($)</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                    type="number" 
                    min="0"
                    required
                    value={currentFacility.price}
                    onChange={e => setCurrentFacility({...currentFacility, price: Number(e.target.value)})}
                    className="w-full pl-9 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                    type="url" 
                    required
                    placeholder="https://..."
                    value={currentFacility.image || ''}
                    onChange={e => setCurrentFacility({...currentFacility, image: e.target.value})}
                    className="w-full pl-9 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                    />
                </div>
              </div>

              <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                >
                  {isEditMode ? 'Save Changes' : 'Create Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revenue Modal */}
      {revenueFacilityId && revenueStats && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-0 shadow-xl overflow-hidden">
                <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Revenue Analytics</h3>
                        <p className="text-sm text-slate-500">For {revenueStats.facilityName}</p>
                    </div>
                    <button 
                        onClick={() => setRevenueFacilityId(null)} 
                        className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors shadow-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <p className="text-sm text-green-600 font-medium mb-1">Total Earnings</p>
                            <p className="text-3xl font-bold text-green-800">${revenueStats.totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-sm text-blue-600 font-medium mb-1">Total Bookings</p>
                            <p className="text-3xl font-bold text-blue-800">{revenueStats.totalBookings}</p>
                        </div>
                    </div>

                    <div className="h-64 w-full bg-white p-4 border border-slate-100 rounded-xl shadow-sm">
                        <h4 className="text-sm font-bold text-slate-700 mb-4">Monthly Revenue</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueStats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip 
                                    cursor={{fill: '#f1f5f9'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                                />
                                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="p-4 bg-slate-50 text-center border-t border-slate-200">
                    <button 
                        onClick={() => setRevenueFacilityId(null)}
                        className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
                    >
                        Close Analytics
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};