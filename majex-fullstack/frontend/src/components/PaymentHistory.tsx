import React from 'react';
import { Bill } from '../types';
import { CheckCircle, FileText, Calendar } from 'lucide-react';

interface PaymentHistoryProps {
  bills: Bill[];
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ bills }) => {
  // Filter for paid bills and sort by date (newest first)
  const history = bills
    .filter(b => b.status === 'Paid')
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Transaction History</h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Service</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Billing Period</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Date Paid</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map(bill => (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{bill.type}</td>
                    <td className="p-4 text-slate-600 text-sm">{bill.month}</td>
                    <td className="p-4 font-bold text-slate-800">${bill.amount.toFixed(2)}</td>
                    <td className="p-4 text-slate-600 text-sm flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {bill.paidDate || new Date().toLocaleDateString()} 
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" /> Success
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
                        <FileText className="w-4 h-4 mr-1" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-slate-500">
            No transaction history found.
          </div>
        )}
      </div>
    </div>
  );
};