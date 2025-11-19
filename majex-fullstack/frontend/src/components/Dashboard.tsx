import React from 'react';
import { UserRole, User, Bill, Booking } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Calendar, Users, AlertCircle } from 'lucide-react';

interface DashboardProps {
  user: User;
  role: UserRole;
  bills: Bill[];
  bookings: Booking[];
  residentsCount?: number; // [NEW] Nhận số liệu thật
  reportsCount?: number;   // [NEW] Nhận số liệu thật
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, role, bills, bookings, residentsCount = 0, reportsCount = 0 
}) => {
  const pendingBills = bills.filter(b => b.status === 'Unpaid' || b.status === 'Overdue');
  const upcomingBookings = bookings.filter(b => new Date(b.date) >= new Date() && b.status === 'Confirmed');

  // Mock Data for Admin Charts
  const paymentData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 5000 },
    { name: 'Apr', amount: 4500 },
  ];
  const serviceUsageData = [
    { name: 'Pool', value: 400 },
    { name: 'Gym', value: 300 },
    { name: 'Tennis', value: 200 },
    { name: 'BBQ', value: 100 },
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Admin: Tính tổng doanh thu thực tế
  const totalRevenue = bills
    .filter(b => b.status === 'Paid')
    .reduce((sum, bill) => sum + bill.amount, 0);
  
  // Admin: Đếm số booking đang active
  const activeBookingsCount = bookings.filter(b => b.status === 'Confirmed').length;

  if (role === UserRole.RESIDENT) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h2>
            <p className="opacity-90">Apartment {user.apartmentId}</p>
            <div className="mt-6 flex gap-4">
              <div className="flex flex-col">
                <span className="text-sm opacity-75">Pending Bills</span>
                <span className="text-2xl font-bold">{pendingBills.length}</span>
              </div>
              <div className="h-12 w-px bg-white/20"></div>
              <div className="flex flex-col">
                <span className="text-sm opacity-75">Upcoming Events</span>
                <span className="text-2xl font-bold">{upcomingBookings.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Status - Bills */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Payment Status</h3>
              <div className="p-2 bg-red-100 rounded-full">
                <DollarSign className="w-5 h-5 text-red-600" />
              </div>
            </div>
            {pendingBills.length > 0 ? (
              <div className="space-y-3">
                {pendingBills.slice(0, 2).map(bill => (
                  <div key={bill.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-700">{bill.type}</p>
                      <p className="text-xs text-slate-500">Due {new Date(bill.dueDate).toLocaleDateString()}</p>
                    </div>
                    <span className="font-bold text-slate-800">${bill.amount}</span>
                  </div>
                ))}
                {pendingBills.length > 2 && <p className="text-xs text-center text-slate-500">+{pendingBills.length - 2} more</p>}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-green-600 font-medium">
                All bills paid! 🎉
              </div>
            )}
          </div>

          {/* Quick Status - Bookings */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">My Bookings</h3>
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            {upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.slice(0, 2).map(booking => (
                  <div key={booking.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-700">{booking.facilityName}</p>
                      <p className="text-xs text-slate-500">{new Date(booking.date).toLocaleDateString()} @ {booking.timeSlot}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Confirmed</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm text-center mt-8">No upcoming bookings.</p>
            )}
          </div>
        </div>

        {/* Notification Area */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Announcements</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-1">
              <h4 className="font-medium text-slate-800">Monthly Fire Drill</h4>
              <p className="text-sm text-slate-600 mt-1">Scheduled for next Saturday at 10:00 AM. Please participate.</p>
              <p className="text-xs text-slate-400 mt-2">Admin • 2 days ago</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4 py-1">
              <h4 className="font-medium text-slate-800">Pool Maintenance</h4>
              <p className="text-sm text-slate-600 mt-1">The pool will be closed this Friday for cleaning.</p>
              <p className="text-xs text-slate-400 mt-2">Admin • 4 days ago</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
      
      {/* Stats Cards: HIỂN THỊ SỐ LIỆU THẬT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600"><Users /></div>
          <div>
            <p className="text-sm text-slate-500">Total Residents</p>
            {/* Số lượng cư dân thật */}
            <p className="text-xl font-bold text-slate-800">{residentsCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-lg text-green-600"><DollarSign /></div>
          <div>
            <p className="text-sm text-slate-500">Collected</p>
            {/* Tổng doanh thu thật */}
            <p className="text-xl font-bold text-slate-800">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-100 rounded-lg text-orange-600"><AlertCircle /></div>
          <div>
            <p className="text-sm text-slate-500">Pending Reports</p>
            {/* Số report đang chờ xử lý thật */}
            <p className="text-xl font-bold text-slate-800">{reportsCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Calendar /></div>
          <div>
            <p className="text-sm text-slate-500">Active Bookings</p>
            {/* Số booking thật */}
            <p className="text-xl font-bold text-slate-800">{activeBookingsCount}</p>
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Facility Popularity</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={serviceUsageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {serviceUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-[-20px]">
            {serviceUsageData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};