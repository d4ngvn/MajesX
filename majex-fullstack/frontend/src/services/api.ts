const API_URL = 'http://localhost:8000';
export const WS_URL = 'ws://localhost:8000/ws/chat';

export const api = {
  // --- USERS ---
  getUsers: async () => (await fetch(`${API_URL}/users`)).json(),
  createUser: async (user: any) => (await fetch(`${API_URL}/users`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user)
  })).json(),

  // --- FACILITIES ---
  getFacilities: async () => (await fetch(`${API_URL}/facilities`)).json(),
  createFacility: async (facility: any) => (await fetch(`${API_URL}/facilities`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(facility)
  })).json(),

  // --- BILLS ---
  getMyBills: async (userId: string) => {
      const res = await fetch(`${API_URL}/bills/${userId}`);
      return res.ok ? res.json() : [];
  },
  payBill: async (billId: string) => (await fetch(`${API_URL}/bills/${billId}/pay`, { method: 'PUT' })).json(),

  // --- CHAT ---
  getMessages: async () => (await fetch(`${API_URL}/messages`)).json(),

  // --- REPORTS ---
  getReports: async () => (await fetch(`${API_URL}/reports`)).json(),
  createReport: async (report: any) => (await fetch(`${API_URL}/reports`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(report)
  })).json(),
  resolveReport: async (reportId: string) => (await fetch(`${API_URL}/reports/${reportId}/resolve`, { method: 'PUT' })).json(),

  // --- BOOKINGS (FIXED) ---
  getBookings: async () => (await fetch(`${API_URL}/bookings`)).json(),
  createBooking: async (booking: any) => (await fetch(`${API_URL}/bookings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(booking)
  })).json(),
  cancelBooking: async (bookingId: string) => (await fetch(`${API_URL}/bookings/${bookingId}/cancel`, { method: 'PUT' })).json(),

  // --- ANNOUNCEMENTS ---
  getAnnouncements: async () => (await fetch(`${API_URL}/announcements`)).json(),
  
  WS_URL
};