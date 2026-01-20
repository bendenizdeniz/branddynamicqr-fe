import React from 'react';
import { Loader2 } from 'lucide-react';

interface DataTableProps {
  headers: string[];
  loading: boolean;
  children: React.ReactNode;
}

export const DataTable: React.FC<DataTableProps> = ({ headers, loading, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
    {loading && (
      <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )}
    <table className="w-full text-left">
      <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className={`px-6 py-4 ${h === 'Fiyat' || h === 'İşlem' ? 'text-center' : ''}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">{children}</tbody>
    </table>
  </div>
);