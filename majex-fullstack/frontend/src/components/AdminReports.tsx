import React from 'react';
import { Report } from '../types';
import { AlertTriangle, CheckCircle, Clock, MessageSquare } from 'lucide-react';

interface AdminReportsProps {
  reports: Report[];
  onResolve: (id: string) => void;
}

export const AdminReports: React.FC<AdminReportsProps> = ({ reports, onResolve }) => {
  const pendingReports = reports.filter(r => r.status !== 'Resolved');
  const resolvedReports = reports.filter(r => r.status === 'Resolved');

  return (
    <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Pending Reports</h2>
            <div className="grid grid-cols-1 gap-4">
                {pendingReports.length > 0 ? pendingReports.map(report => (
                    <div key={report.id} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded uppercase">{report.category}</span>
                                <span className="text-sm text-slate-500">• {new Date(report.timestamp).toLocaleString()}</span>
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">{report.title}</h3>
                            <p className="text-slate-600 mt-1">{report.description}</p>
                            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                                <span className="font-medium text-slate-700">{report.userName}</span>
                                <span>(Unit {report.apartment})</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Reply
                            </button>
                            <button 
                                onClick={() => onResolve(report.id)}
                                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" /> Mark Resolved
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="bg-white p-8 rounded-xl text-center text-slate-500 border border-dashed border-slate-300">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p>All caught up! No pending reports.</p>
                    </div>
                )}
            </div>
        </div>

        {resolvedReports.length > 0 && (
            <div>
                <h3 className="text-lg font-bold text-slate-600 mb-4">Resolved History</h3>
                <div className="opacity-75">
                    {resolvedReports.map(report => (
                        <div key={report.id} className="bg-slate-50 p-4 rounded-lg mb-2 border border-slate-200 flex justify-between items-center">
                             <div>
                                <h4 className="font-medium text-slate-700">{report.title}</h4>
                                <p className="text-xs text-slate-500">Reported by {report.userName} • {new Date(report.timestamp).toLocaleDateString()}</p>
                             </div>
                             <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Resolved
                             </span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};