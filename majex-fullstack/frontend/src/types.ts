
export enum UserRole {
  ADMIN = 'ADMIN',
  RESIDENT = 'RESIDENT'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  apartmentId?: string;
  email?: string;
  phone?: string;
}

export interface Bill {
  id: string;
  userId: string; // Added to link bill to specific resident
  type: 'Electricity' | 'Water' | 'Service' | 'Internet';
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  month: string;
  paidDate?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: string; // Changed from union to string to support custom types
  image: string;
  openTime: string;
  closeTime: string;
  price: number;
}

export interface Booking {
  id: string;
  facilityId: string;
  facilityName: string;
  userId: string;
  userName: string;
  date: string;
  timeSlot: string;
  qrCodeData: string;
  status: 'Confirmed' | 'Cancelled' | 'Completed';
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  date: string;
  sender: string;
  type: 'General' | 'Emergency' | 'Personal';
}

export interface ResidentRecord {
  id: string;
  name: string;
  username?: string; 
  apartment: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
  password?: string; 
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  apartment: string;
  title: string;
  description: string;
  category: 'Maintenance' | 'Noise' | 'Security' | 'Other';
  status: 'Pending' | 'In Progress' | 'Resolved';
  timestamp: number;
}