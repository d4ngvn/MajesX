import React from 'react';
import { Bill } from '../types';
import { Download, Check, CreditCard } from 'lucide-react';

interface PaymentsProps {
  bills: Bill[];
  onPay: (id: string) => void;
}

export const Payments: React.FC<PaymentsProps> = ({ bills, onPay }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Payments & Bills</h2>
        <button className="flex items-center text-sm text-indigo-600 font-medium hover:underline">
          <Download className="w-4 h-4 mr-1" /> Download Statement
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-12 bg-slate-50 p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
          <div className="col-span-2">Type</div>
          <div className="col-span-3">Month</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-3">Due Date</div>
          <div className="col-span-2 text-right">Action</div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {bills.map(bill => (
            <div key={bill.id} className="grid grid-cols-12 p-4 items-center hover:bg-slate-50 transition-colors">
              <div className="col-span-2 font-medium text-slate-800 flex items-center gap-2">
                 {bill.type}
                 {bill.status === 'Overdue' && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
              </div>
              <div className="col-span-3 text-slate-600 text-sm">{bill.month}</div>
              <div className="col-span-2 font-bold text-slate-800">${bill.amount.toFixed(2)}</div>
              <div className="col-span-3 text-slate-500 text-sm">{new Date(bill.dueDate).toLocaleDateString()}</div>
              <div className="col-span-2 text-right">
                {bill.status === 'Paid' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" /> Paid
                  </span>
                ) : (
                  <button 
                    onClick={() => onPay(bill.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods Placeholder */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">Saved Payment Methods</h3>
        <div className="flex gap-4">
            <div className="p-4 border border-indigo-200 bg-indigo-50 rounded-lg flex items-center gap-3 w-64">
                <CreditCard className="text-indigo-600" />
                <div>
                    <p className="text-sm font-bold text-indigo-900">Visa ending in 4242</p>
                    <p className="text-xs text-indigo-700">Expires 12/25</p>
                </div>
            </div>
            <div className="p-4 border border-slate-200 border-dashed rounded-lg flex items-center justify-center w-32 cursor-pointer hover:bg-slate-50 text-slate-400">
                <span className="text-sm">+ Add New</span>
            </div>
        </div>
      </div>
    </div>
  );
};