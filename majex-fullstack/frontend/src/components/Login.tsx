
import React, { useState } from 'react';
import { UserRole } from '../types';
import { ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      // Simple mock logic for demonstration
      if (username.toLowerCase().includes('admin')) {
        onLogin(UserRole.ADMIN);
      } else {
        onLogin(UserRole.RESIDENT);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500 mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">MajeX</h1>
          <p className="text-indigo-200 mt-2">Smart Residential Management</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Enter username (try 'admin' or 'resident')"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-600">
                <input type="checkbox" className="mr-2 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                Remember me
              </label>
              <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">Forgot password?</a>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Demo Access:</p>
            <div className="mt-2 space-x-2">
              <span className="bg-slate-100 px-2 py-1 rounded cursor-pointer hover:bg-slate-200" onClick={() => setUsername('admin')}>admin</span>
              <span className="bg-slate-100 px-2 py-1 rounded cursor-pointer hover:bg-slate-200" onClick={() => setUsername('resident')}>resident</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
