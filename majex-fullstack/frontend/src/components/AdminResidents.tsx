import React, { useState, useRef, useEffect } from 'react';
import { ResidentRecord, Bill } from '../types';
import { Plus, Search, MoreHorizontal, UserPlus, Lock, User as UserIcon, Trash2, History, Edit, CheckCircle, X } from 'lucide-react';

interface AdminResidentsProps {
  residents: ResidentRecord[];
  bills: Bill[];
  onAddResident: (resident: ResidentRecord) => void;
  onUpdateResident: (resident: ResidentRecord) => void;
  onDeleteResident: (id: string) => void;
}

export const AdminResidents: React.FC<AdminResidentsProps> = ({ residents, bills, onAddResident, onUpdateResident, onDeleteResident }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentResident, setCurrentResident] = useState<Partial<ResidentRecord>>({ status: 'Active' });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // History Modal State
  const [viewHistoryId, setViewHistoryId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentResident({ status: 'Active' });
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const openEditModal = (resident: ResidentRecord) => {
    setIsEditMode(true);
    setCurrentResident({ ...resident }); // Clone data
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentResident.name && currentResident.apartment && currentResident.email && currentResident.username && currentResident.password) {
      
      if (isEditMode && currentResident.id) {
          // Update existing
          onUpdateResident(currentResident as ResidentRecord);
      } else {
          // Create new
          const resident: ResidentRecord = {
            id: `r_${Date.now()}`,
            name: currentResident.name!,
            username: currentResident.username!,
            apartment: currentResident.apartment!,
            email: currentResident.email!,
            phone: currentResident.phone || '',
            status: currentResident.status || 'Active',
            password: currentResident.password!
          };
          onAddResident(resident);
      }
      setIsModalOpen(false);
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const handleDelete = (id: string) => {
      if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
          onDeleteResident(id);
      }
      setActiveMenuId(null);
  };

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.apartment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const residentBills = viewHistoryId ? bills.filter(b => b.userId === viewHistoryId) : [];
  const historyResidentName = viewHistoryId ? residents.find(r => r.id === viewHistoryId)?.name : '';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Resident Management</h2>
        <button 
          onClick={openAddModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Resident
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or unit..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Name / Username</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Apartment</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Contact</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{r.name}</div>
                        <div className="text-xs text-slate-500">@{r.username || 'user'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{r.apartment}</td>
                  <td className="p-4">
                    <div className="flex flex-col text-sm text-slate-600">
                      <span>{r.email}</span>
                      <span className="text-xs text-slate-400">{r.phone}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 relative">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === r.id ? null : r.id);
                        }}
                        className="text-slate-400 hover:text-indigo-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {activeMenuId === r.id && (
                        <div ref={menuRef} className="absolute right-8 top-4 w-48 bg-white rounded-lg shadow-lg border border-slate-100 z-10 py-1 animate-fade-in">
                            <button 
                                onClick={() => openEditModal(r)}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" /> Edit User
                            </button>
                            <button 
                                onClick={() => { setViewHistoryId(r.id); setActiveMenuId(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"
                            >
                                <History className="w-4 h-4" /> View Payment History
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button 
                                onClick={() => handleDelete(r.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Delete User
                            </button>
                        </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredResidents.length === 0 && (
              <div className="p-8 text-center text-slate-500">No residents found matching your search.</div>
          )}
        </div>
      </div>

      {/* Add/Edit Resident Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl my-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{isEditMode ? 'Edit Resident' : 'Create Account'}</h3>
                <p className="text-sm text-slate-500">{isEditMode ? 'Update existing resident details' : 'Add a new resident to the system'}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Personal Info */}
              <div className="space-y-4 pb-4 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase">Personal Details</h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                    value={currentResident.name || ''}
                    onChange={e => setCurrentResident({...currentResident, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Apartment ID</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g., A-101"
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                      value={currentResident.apartment || ''}
                      onChange={e => setCurrentResident({...currentResident, apartment: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                      value={currentResident.phone || ''}
                      onChange={e => setCurrentResident({...currentResident, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input 
                    required
                    type="email" 
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                    value={currentResident.email || ''}
                    onChange={e => setCurrentResident({...currentResident, email: e.target.value})}
                  />
                </div>
              </div>

              {/* Login Credentials */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Login Credentials
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required
                        type="text" 
                        className="w-full pl-9 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                        placeholder="username"
                        value={currentResident.username || ''}
                        onChange={e => setCurrentResident({...currentResident, username: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required
                        type="password" 
                        className="w-full pl-9 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                        placeholder="******"
                        value={currentResident.password || ''}
                        onChange={e => setCurrentResident({...currentResident, password: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
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
                  {isEditMode ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {viewHistoryId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
             <div className="bg-white rounded-2xl w-full max-w-2xl p-0 shadow-xl my-8 overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Payment History</h3>
                        <p className="text-sm text-slate-500">For {historyResidentName}</p>
                    </div>
                    <button onClick={() => setViewHistoryId(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                    {residentBills.length > 0 ? (
                        <table className="w-full text-left">
                             <thead className="bg-white border-b border-slate-100 sticky top-0">
                                <tr>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Service</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Month</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {residentBills.map(bill => (
                                    <tr key={bill.id} className="hover:bg-slate-50">
                                        <td className="p-4 text-sm font-medium text-slate-800">{bill.type}</td>
                                        <td className="p-4 text-sm text-slate-600">{bill.month}</td>
                                        <td className="p-4 text-sm font-bold text-slate-800">${bill.amount.toFixed(2)}</td>
                                        <td className="p-4">
                                            {bill.status === 'Paid' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Paid {bill.paidDate && `(${new Date(bill.paidDate).toLocaleDateString()})`}
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bill.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {bill.status}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            No payment records found for this user.
                        </div>
                    )}
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
                    <button onClick={() => setViewHistoryId(null)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm">Close</button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};