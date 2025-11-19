
import React, { useState } from 'react';
import { generateAnnouncement } from '../services/geminiService';
import { Sparkles, Send, Bell } from 'lucide-react';

export const AdminAnnouncements: React.FC = () => {
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
      <h2 className="text-2xl font-bold text-slate-800">Broadcast Announcements</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Drafter */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" /> AI Announcement Drafter
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Key Points / Topic</label>
              <textarea 
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 h-32 resize-none bg-white text-slate-900"
                placeholder="e.g., Swimming pool closed for cleaning on Friday..."
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
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {isGenerating ? 'Drafting...' : 'Generate Draft'} <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview & Send */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Review & Broadcast</h3>
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 relative">
            <textarea 
              className="w-full h-full bg-transparent border-none resize-none outline-none text-slate-700"
              value={generatedText}
              onChange={(e) => setGeneratedText(e.target.value)}
              placeholder="Generated announcement content will appear here..."
            />
          </div>
          <div className="flex gap-3">
             <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Save Draft</button>
             <button 
                className="flex-1 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                disabled={!generatedText}
                onClick={() => {alert('Announcement Sent!'); setGeneratedText(''); setTopic('');}}
              >
                <Send className="w-4 h-4" /> Send to All Residents
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};
