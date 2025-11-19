import React, { useState } from 'react';
import { generateAnnouncement } from '../services/geminiService';
import { Sparkles, Send, Users, AlertTriangle } from 'lucide-react';
import { ResidentRecord } from '../types';

interface AdminToolsProps {
  residents: ResidentRecord[];
}

export const AdminTools: React.FC<AdminToolsProps> = ({ residents }) => {
  const [activeSubTab, setActiveSubTab] = useState<'residents' | 'announcement' | 'reports'>('residents');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<'Formal' | 'Urgent' | 'Friendly'>('Formal');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    const text = await generateAnnouncement(topic, tone);
    setGeneratedText(text);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-fit">
        {['residents', 'announcement', 'reports'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeSubTab === tab ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeSubTab === 'residents' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-600">Name</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Apartment</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Contact</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {residents.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{r.name}</td>
                  <td className="p-4 text-slate-600">{r.apartment}</td>
                  <td className="p-4 text-slate-600 text-sm">{r.email}<br/>{r.phone}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-indigo-600 text-sm hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'announcement' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" /> AI Announcement Drafter
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Topic / Key Points</label>
                <textarea 
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
                  placeholder="e.g., Water cut on Tuesday 2pm-4pm for maintenance..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tone</label>
                <div className="flex gap-4">
                  {['Formal', 'Urgent', 'Friendly'].map(t => (
                    <label key={t} className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="tone" 
                        value={t} 
                        checked={tone === t}
                        onChange={() => setTone(t as any)}
                        className="mr-2 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-600">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? 'Thinking...' : 'Generate Draft'} <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Preview & Send</h3>
            <textarea 
              className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 mb-4 resize-none focus:ring-2 focus:ring-indigo-500"
              value={generatedText}
              onChange={(e) => setGeneratedText(e.target.value)}
              placeholder="Generated text will appear here..."
            />
            <button 
              className="py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center justify-center gap-2"
              disabled={!generatedText}
              onClick={() => alert('Announcement sent to all residents!')}
            >
              <Send className="w-4 h-4" /> Send to All Residents
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'reports' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Resident Reports</h3>
          <div className="space-y-3">
            <div className="p-4 border border-red-100 bg-red-50 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />
              <div>
                <h4 className="font-semibold text-red-800">Noise Complaint</h4>
                <p className="text-sm text-red-700">Apartment 402 reported loud music from 401 after 11 PM.</p>
                <div className="mt-2 flex gap-2">
                    <button className="text-xs bg-white border border-red-200 px-2 py-1 rounded hover:bg-red-100 text-red-700">Mark Resolved</button>
                    <button className="text-xs text-red-600 hover:underline px-2 py-1">Contact 401</button>
                </div>
              </div>
            </div>
             <div className="p-4 border border-orange-100 bg-orange-50 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-1" />
              <div>
                <h4 className="font-semibold text-orange-800">Broken Light</h4>
                <p className="text-sm text-orange-700">Corridor light on Floor 3 flickering.</p>
                <div className="mt-2 flex gap-2">
                    <button className="text-xs bg-white border border-orange-200 px-2 py-1 rounded hover:bg-orange-100 text-orange-700">Assign Maintenance</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};