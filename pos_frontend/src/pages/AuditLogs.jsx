import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../https'; // Ensure this exists in your API file
import BottomNav from '../components/shared/BottomNav';
import { FaHistory, FaUserCircle } from 'react-icons/fa';

const AuditLogs = () => {
    // Fetch logs every 5 seconds for live updates
    const { data: logsResponse, isLoading } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: getAuditLogs,
        refetchInterval: 5000, 
    });

    const logs = logsResponse?.data?.data || [];

    // Helper to color-code actions
    const getActionColor = (action) => {
        if (action?.includes("DELETE")) return "text-red-400 bg-red-400/10";
        if (action?.includes("CREATE") || action?.includes("IMPORT")) return "text-green-400 bg-green-400/10";
        if (action?.includes("UPDATE")) return "text-blue-400 bg-blue-400/10";
        return "text-gray-400 bg-gray-400/10";
    };

    return (
        <div className="bg-[#1f1f1f] h-[calc(100vh-5rem)]">
            <main className="h-full overflow-y-auto p-6 text-white pb-20">
                <div className='container mx-auto'>
                    {/* Header */}
                    <div className='flex items-center justify-between mb-8'>
                        <div>
                            <h1 className="text-3xl font-bold text-[#f5f5f5] flex items-center gap-3">
                                <FaHistory className="text-[#f6b100]" /> Audit Logs
                            </h1>
                            <p className="text-[#ababab] text-sm mt-1">
                                System activity tracking for Admins.
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-mono text-[#555] bg-[#111] px-3 py-1 rounded border border-[#333]">
                                {logs.length} RECORDS
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    {isLoading ? (
                        <div className="text-center text-gray-400 py-20">Loading records...</div>
                    ) : (
                        <div className="bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden shadow-lg">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#222] text-xs uppercase text-[#888]">
                                    <tr>
                                        <th className="py-4 px-6 font-bold">User</th>
                                        <th className="py-4 px-6 font-bold">Action</th>
                                        <th className="py-4 px-6 font-bold">Details</th>
                                        <th className="py-4 px-6 font-bold text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-[#ddd]">
                                    {logs.length > 0 ? (
                                        logs.map((log) => (
                                            <tr key={log._id} className="border-b border-[#333] hover:bg-[#252525] transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <FaUserCircle className="text-2xl text-[#555]" />
                                                        <div>
                                                            <p className="font-bold text-[#f5f5f5]">{log.user?.name || "System"}</p>
                                                            <p className="text-xs text-[#888]">{log.user?.role || "Admin"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold border border-white/5 ${getActionColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 font-mono text-[#ccc] text-xs">
                                                    {log.details}
                                                </td>
                                                <td className="py-4 px-6 text-right text-[#888] text-xs">
                                                    <div className="flex flex-col items-end">
                                                        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                                                        <span className="text-[#555]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-20 text-[#444]">No logs found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
            <BottomNav />
        </div>
    );
};

export default AuditLogs;