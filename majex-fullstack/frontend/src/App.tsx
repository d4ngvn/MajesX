// frontend/src/App.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { BookingSystem } from './components/BookingSystem';
import { CommunityChat } from './components/Chat';
import { Payments } from './components/Payments';
import { User, UserRole, Bill, Booking, Message, ResidentRecord, Report, Facility } from './types';
import { Menu } from 'lucide-react';
import { Login } from './components/Login';
import { MyQRCodes } from './components/MyQRCodes';
import { PaymentHistory } from './components/PaymentHistory';
import { ResidentProfile } from './components/ResidentProfile';
import { ResidentReports } from './components/ResidentReports';
import { AdminResidents } from './components/AdminResidents';
import { AdminAnnouncements } from './components/AdminAnnouncements';
import { AdminReports } from './components/AdminReports';
import { AdminAmenities } from './components/AdminAmenities';
import { AdminScanner } from './components/AdminScanner';
import { api } from './services/api'; // Import API Service

// --- MOCK DATA CHO DEMO LOGIN ---
// (Vì chức năng login/auth thường phức tạp, ta giữ mock user để test nhanh các tính năng khác)
const RESIDENT_USER: User = {
  id: 'user_resident_123', 
  name: 'Sarah Jenkins',
  role: UserRole.RESIDENT,
  avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random',
  apartmentId: 'A-402',
  email: 'sarah@example.com',
  phone: '555-0123'
};

const ADMIN_USER: User = {
  id: 'user_admin_999',
  name: 'Building Manager',
  role: UserRole.ADMIN,
  avatar: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff',
};

export default function App() {
  // [FIX] Khởi tạo state từ localStorage nếu có
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('majex_token') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('majex_user');
    return saved ? (JSON.parse(saved) as User) : null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- DATA STATE (Được fetch từ Database) ---
  const [bills, setBills] = useState<Bill[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  // [NEW] Announcements state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  // [NEW] Online users count for chat
  const [onlineCount, setOnlineCount] = useState<number>(1);

  // WebSocket Reference
  const ws = useRef<WebSocket | null>(null);

  // 1. FETCH DATA KHI USER LOGIN THÀNH CÔNG
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const fetchData = async () => {
        try {
          // A. Load các dữ liệu chung (Facilities, Chat History, Announcements, Bookings, Users)
          const [fetchedFacilities, fetchedMessages, fetchedAnnouncements, fetchedBookings, fetchedUsers] = await Promise.all([
            api.getFacilities(),
            api.getMessages(),
            api.getAnnouncements ? api.getAnnouncements() : Promise.resolve([]),
            api.getBookings ? api.getBookings() : Promise.resolve([]),
            api.getUsers ? api.getUsers() : Promise.resolve([])
          ]);

          setFacilities(fetchedFacilities || []);
          setMessages(fetchedMessages || []);
          setAnnouncements(fetchedAnnouncements || []);
          setBookings(fetchedBookings || []);

          // Map API user objects to ResidentRecord shape (safe normalization)
          const mappedResidents: ResidentRecord[] = (fetchedUsers || []).map((u: any) => ({
            id: u.id,
            name: u.name,
            username: u.username || u.name?.toLowerCase().replace(/\s+/g, '-') || u.id,
            apartment: u.apartmentId || u.apartment || 'N/A',
            phone: u.phone || '',
            email: u.email || '',
            status: u.status || 'active',
            password: '***'
          }));
          setResidents(mappedResidents);

          // B. Load dữ liệu riêng theo Role
          if (currentUser.role === UserRole.ADMIN) {
             // Admin: Cần danh sách Báo cáo (+ all bills)
             const [fetchedReports, fetchedAllBills] = await Promise.all([
                api.getReports(),
                api.getMyBills ? api.getMyBills('all') : Promise.resolve([])
             ]);
             
             setReports(fetchedReports || []);
             setBills(fetchedAllBills || []);

          } else {
             // Resident: Cần Hóa đơn của mình và Báo cáo của mình
             const [myBills, allReports] = await Promise.all([
                api.getMyBills(currentUser.id),
                api.getReports()
             ]);
             
             setBills(myBills || []);
             const myOwnReports = (allReports || []).filter((r: Report) => r.userId === currentUser.id);
             setReports(myOwnReports);
          }

        } catch (err) {
          console.error("❌ Error loading initial data:", err);
        }
      };

      fetchData();

      // 2. KẾT NỐI WEBSOCKET (REALTIME CHAT)
      if (ws.current) ws.current.close();
      ws.current = new WebSocket(api.WS_URL);

      ws.current.onopen = () => {
        console.log("🟢 Connected to Chat WebSocket");
        // optionally identify to WS server
        try { ws.current?.send(JSON.stringify({ type: 'identify', userId: currentUser.id })); } catch {}
      };

      // Handle both chat messages and presence updates
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // presence update from server
          if (data.type === 'online_count' && typeof data.count === 'number') {
            setOnlineCount(data.count);
            return;
          }
          // chat message object
          if (data.type === 'message' || data.senderId) {
            setMessages((prev) => [...prev, data]);
          }
        } catch (e) {
          console.error("WebSocket message error:", e);
        }
      };

      ws.current.onclose = () => {
        console.log("🔴 Chat disconnected");
      };

      return () => {
        ws.current?.close();
      };
    }
  }, [isLoggedIn, currentUser]); // Chạy lại khi login hoặc đổi user

  // --- HANDLERS ---

  const handleLogin = (role: UserRole) => {
    const user = role === UserRole.ADMIN ? { ...ADMIN_USER } : { ...RESIDENT_USER };
    setCurrentUser(user);
    setIsLoggedIn(true);
    // [FIX] Lưu vào LocalStorage
    localStorage.setItem('majex_token', 'true');
    localStorage.setItem('majex_user', JSON.stringify(user));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null); // Clear user
    localStorage.removeItem('majex_token');
    localStorage.removeItem('majex_user');
    setMessages([]);
    setBills([]);
    setReports([]);
    setResidents([]);
    setFacilities([]);
    setBookings([]);
    setAnnouncements([]);
    if (ws.current) ws.current.close();
  };

  // Chat Handler (Gửi qua WebSocket) - [FIX] Gửi kèm số phòng nếu resident
  const handleSendMessage = (text: string) => {
    if (!currentUser) return;
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const displayName = currentUser.role === UserRole.ADMIN 
        ? currentUser.name 
        : `${currentUser.name} (${currentUser.apartmentId || 'N/A'})`;

      const msgPayload = {
        senderId: currentUser.id,
        senderName: displayName, 
        text: text
      };
      ws.current.send(JSON.stringify(msgPayload));
    } else {
      alert("Mất kết nối chat. Vui lòng tải lại trang.");
    }
  };

  // Payment Handler (Gọi API)
  const handlePayBill = async (id: string) => {
    try {
      await api.payBill(id);
      // Cập nhật UI ngay lập tức
      setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'Paid', paidDate: new Date().toISOString().split('T')[0] } : b));
      alert("Thanh toán thành công!");
    } catch (error) {
      alert("Lỗi thanh toán. Vui lòng thử lại.");
    }
  };

  // Resident: Gửi Report (Lưu DB)
  const handleSubmitReport = async (report: Report) => {
    try {
      const savedReport = await api.createReport(report);
      setReports(prev => [savedReport, ...prev]);
    } catch (e) {
      alert("Không thể gửi báo cáo. Kiểm tra kết nối server.");
    }
  };

  // Admin: Tạo User mới (Lưu DB)
  const handleAddResident = async (newResident: ResidentRecord) => {
    try {
      // Convert format frontend sang format API mong muốn
      const userPayload = {
        id: newResident.id,
        name: newResident.name,
        username: newResident.username,
        password: newResident.password,
        role: 'RESIDENT',
        apartmentId: newResident.apartment,
        email: newResident.email,
        phone: newResident.phone
      };
      
      await api.createUser(userPayload);
      setResidents(prev => [...prev, newResident]);
      alert("Đã thêm cư dân mới vào hệ thống.");
    } catch (e) {
      alert("Lỗi khi tạo User. Có thể ID hoặc Username đã tồn tại.");
    }
  };

  // Admin: Thêm Facility (Lưu DB)
  const handleAddFacility = async (facility: Facility) => {
    try {
      const savedFacility = await api.createFacility(facility);
      setFacilities(prev => [...prev, savedFacility]);
    } catch (e) {
      alert("Lỗi khi thêm tiện ích.");
    }
  };

  // Booking (Lưu DB)
  const handleAddBooking = async (b: Booking) => {
    try {
      const saved = await api.createBooking(b);
      setBookings(p => [...p, saved]);
      alert("Đặt chỗ thành công!");
    } catch (e) {
      console.error("Booking error:", e);
      alert("Lỗi khi đặt chỗ. Vui lòng thử lại.");
    }
  };
  const handleCancelBooking = async (id: string) => {
    try {
      await api.cancelBooking(id);
      setBookings(p => p.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
    } catch (e) {
      console.error("Cancel booking error:", e);
      alert("Lỗi khi hủy đặt chỗ.");
    }
  };
  // Admin: Resolve Report (Lưu DB)
  const handleResolveReport = async (id: string) => {
    try {
      await api.resolveReport(id);
      setReports(p => p.map(r => r.id === id ? { ...r, status: 'Resolved' } : r));
    } catch (e) {
      console.error("Resolve report error:", e);
      alert("Lỗi khi cập nhật báo cáo.");
    }
  };
  const handleUpdateResident = (updated: ResidentRecord) => setResidents(p => p.map(r => r.id === updated.id ? updated : r));
  const handleDeleteResident = (id: string) => setResidents(p => p.filter(r => r.id !== id));
  const handleUpdateFacility = (fac: Facility) => setFacilities(p => p.map(f => f.id === fac.id ? fac : f));
  const handleDeleteFacility = (id: string) => setFacilities(p => p.filter(f => f.id !== id));
  const handleVerifyQR = (qrData: string) => {
     const booking = bookings.find(b => b.qrCodeData === qrData);
     if (!booking) return { valid: false, message: 'Mã không hợp lệ' };
     return { valid: true, message: 'Hợp lệ', booking };
  };
  const handleUpdateProfile = (u: Partial<User>) => setCurrentUser(p => ({...p, ...u}));

  // --- RENDER CONTENT ---
  const renderContent = () => {
    if (!currentUser) return null;
    const myBills = bills.filter(b => b.userId === currentUser.id);
    const myReports = reports.filter(r => r.userId === currentUser.id);
    const dashboardBills = currentUser.role === UserRole.ADMIN ? bills : myBills;

    switch (activeTab) {
      // Shared
      case 'dashboard':
        return <Dashboard 
                  user={currentUser} 
                  role={currentUser.role} 
                  bills={dashboardBills} 
                  bookings={bookings}
                  // [NEW] Pass thêm data cho Dashboard tính toán
                  residentsCount={residents.length}
                  reportsCount={reports.filter(r => r.status === 'Pending').length}
               />;
      case 'chat':
        // Pass onlineCount và tổng thành viên để hiển thị presence
        return <CommunityChat user={currentUser} messages={messages} sendMessage={handleSendMessage} role={currentUser.role} onlineCount={onlineCount} totalMembers={residents.length + 1} />;
      
      // Resident
      case 'payments':
        return <Payments bills={myBills} onPay={handlePayBill} />;
      case 'history':
        return <PaymentHistory bills={myBills} />;
      case 'booking':
        return <BookingSystem user={currentUser} addBooking={handleAddBooking} cancelBooking={handleCancelBooking} bookings={bookings} facilities={facilities} />;
      case 'qr':
        return <MyQRCodes bookings={bookings} />;
      case 'profile':
        return <ResidentProfile user={currentUser} onUpdate={handleUpdateProfile} />;
      case 'my-reports':
        return <ResidentReports user={currentUser} onSubmit={handleSubmitReport} myReports={myReports} />;

      // Admin
      case 'residents':
        return <AdminResidents residents={residents} bills={bills} onAddResident={handleAddResident} onUpdateResident={handleUpdateResident} onDeleteResident={handleDeleteResident} />;
      case 'amenities':
        return <AdminAmenities facilities={facilities} bookings={bookings} onAdd={handleAddFacility} onUpdate={handleUpdateFacility} onDelete={handleDeleteFacility} />;
      case 'scanner':
        return <AdminScanner onVerify={handleVerifyQR} />;
      case 'announcements':
        return <AdminAnnouncements />;
      case 'reports':
        return <AdminReports reports={reports} onResolve={handleResolveReport} />;
        
      default:
        return <Dashboard 
                  user={currentUser} 
                  role={currentUser.role} 
                  bills={dashboardBills} 
                  bookings={bookings}
                  residentsCount={residents.length}
                  reportsCount={reports.filter(r => r.status === 'Pending').length}
               />;
    }
  };

  if (!isLoggedIn || !currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      <Sidebar 
        role={currentUser.role} 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
        onLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20">
          <div className="flex items-center">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden mr-4 text-slate-600 hover:text-indigo-600">
              <Menu />
            </button>
            <h2 className="text-xl font-semibold text-slate-800 hidden sm:block capitalize">
               {activeTab.replace('-', ' ')}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500">
                  {currentUser.role === UserRole.ADMIN ? 'Administrator' : currentUser.apartmentId}
                </p>
              </div>
              <img 
                src={currentUser.avatar} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
              />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}