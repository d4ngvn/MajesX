
import React, { useState } from 'react';
import { User } from '../types';
import { Save, User as UserIcon, Home, Phone, Mail, Camera, Lock, KeyRound } from 'lucide-react';

interface ResidentProfileProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => void;
}

export const ResidentProfile: React.FC<ResidentProfileProps> = ({ user, onUpdate }) => {
  const [phone, setPhone] = useState(user.phone || '555-0123');
  const [email, setEmail] = useState(user.email || 'resident@majex.com');
  const [isSaving, setIsSaving] = useState(false);

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      onUpdate({ phone, email });
      setIsSaving(false);
      alert('Profile updated successfully!');
    }, 1000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    
    setIsChangingPassword(true);
    setTimeout(() => {
      // Mock API call
      alert("Password changed successfully!");
      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Main Info */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden text-center pb-6">
                <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="relative -mt-12 mb-4 flex justify-center">
                    <div className="inline-block relative">
                    <img 
                        src={user.avatar} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
                    />
                    <button className="absolute bottom-0 right-0 p-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 shadow-lg">
                        <Camera className="w-4 h-4" />
                    </button>
                    </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{user.name}</h3>
                <p className="text-slate-500 text-sm">{user.role}</p>
            </div>

            {/* Security / Password Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                    <Lock className="w-5 h-5 text-indigo-500" />
                    Security Settings
                </div>
                <form onSubmit={handleChangePassword} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">New Password</label>
                        <div className="relative">
                             <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                             <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-9 p-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:border-indigo-500 outline-none"
                                placeholder="New password"
                             />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Confirm Password</label>
                        <div className="relative">
                             <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                             <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-9 p-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:border-indigo-500 outline-none"
                                placeholder="Confirm password"
                             />
                        </div>
                    </div>
                    <button 
                        type="submit"
                        disabled={isChangingPassword || !newPassword}
                        className="w-full py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-900 disabled:opacity-50 mt-2"
                    >
                        {isChangingPassword ? "Updating..." : "Change Password"}
                    </button>
                </form>
            </div>
        </div>

        {/* Right Column: General Info */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 h-full">
                <h3 className="font-bold text-lg text-slate-800 mb-6 border-b border-slate-100 pb-4">General Information</h3>
                
                <div className="space-y-6">
                    {/* Read Only Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg text-slate-500 border border-slate-200">
                                <UserIcon className="w-5 h-5 text-slate-400" />
                                <span className="font-medium">{user.name}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Apartment Unit</label>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg text-slate-500 border border-slate-200">
                                <Home className="w-5 h-5 text-slate-400" />
                                <span className="font-medium">{user.apartmentId}</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 my-4"></div>

                    {/* Editable Fields */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Phone Number</label>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                                <Phone className="w-5 h-5 text-indigo-500" />
                                <input 
                                type="tel" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-slate-800"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                                <Mail className="w-5 h-5 text-indigo-500" />
                                <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-slate-800"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                        <button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md flex items-center gap-2 disabled:opacity-70"
                        >
                        {isSaving ? (
                            <>Saving...</>
                        ) : (
                            <>
                            <Save className="w-4 h-4" /> Save Information
                            </>
                        )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
