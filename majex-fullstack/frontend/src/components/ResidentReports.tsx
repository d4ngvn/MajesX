
import React, { useState } from 'react';
import { Report, User } from '../types';
import { Send, AlertTriangle, Info, Shield } from 'lucide-react';

interface ResidentReportsProps {
  user: User;
  onSubmit: (report: Report) => void;
  myReports: Report[];
}

export const ResidentReports: React.FC<ResidentReportsProps> = ({ user, onSubmit, myReports }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Report['category']>('Maintenance');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const newReport: Report = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      apartment: user.apartmentId || 'N/A',
      title,
      category,
      description,
      status: 'Pending',
      timestamp: Date.now()
    };

    onSubmit(newReport);
    setTitle('');
    setDescription('');
    alert('Report submitted successfully. Management will review it shortly.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Submission Form */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Submit a Report</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Issue Category</label>
              <div className="grid grid-cols-4 gap-3">
                {['Maintenance', 'Noise', 'Security', 'Other'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat as any)}
                    className={`py-2 px-3 text-sm rounded-lg border transition-all flex flex-col items-center justify-center gap-1
                      ${category === cat 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }
                    `}
                  >
                    {cat === 'Maintenance' && <Info className="w-4 h-4" />}
                    {cat === 'Noise' && <AlertTriangle className="w-4 h-4" />}
                    {cat === 'Security' && <Shield className="w-4 h-4" />}
                    {cat === 'Other' && <Info className="w-4 h-4" />}
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject / Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                placeholder="e.g., Leaking pipe in bathroom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none bg-white text-slate-900"
                placeholder="Please describe the issue in detail..."
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center justify-center gap-2 font-medium"
            >
              <Send className="w-4 h-4" /> Submit Report
            </button>
          </form>
        </div>
      </div>

      {/* My History */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">My History</h2>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 min-h-[400px]">
            {myReports.length > 0 ? (
                <div className="space-y-4">
                    {myReports.map(report => (
                        <div key={report.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide
                                    ${report.status === 'Resolved' ? 'bg-green-100 text-green-700' : 
                                      report.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}
                                `}>
                                    {report.status}
                                </span>
                                <span className="text-[10px] text-slate-400">{new Date(report.timestamp).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm mb-1">{report.title}</h4>
                            <p className="text-xs text-slate-600 line-clamp-2">{report.description}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-400 text-center mt-10">No reports submitted yet.</p>
            )}
        </div>
      </div>
    </div>
  );
};
