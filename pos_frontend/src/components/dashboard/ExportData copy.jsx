import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../https';
import { enqueueSnackbar } from 'notistack';
import { saveAs } from 'file-saver';
import { FaFileExcel } from 'react-icons/fa';

const ExportData = () => {
    const exportMutation = useMutation({
        mutationFn: () => api.get('/api/data/export/orders', { responseType: 'blob' }),
        onSuccess: (response) => {
            saveAs(response.data, 'orders-export.xlsx');
            enqueueSnackbar('Export started successfully!', { variant: 'success' });
        },
        onError: (error) => {
            enqueueSnackbar(error.response?.data?.message || 'Export failed!', { variant: 'error' });
        }
    });

    return (
        <div className="bg-[#1a1a1a] p-8 rounded-lg max-w-2xl mx-auto mt-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Export Order Data</h2>
            
            
            <FaFileExcel className="text-yellow-400 text-6xl mx-auto mb-6" />
            
            <p className="text-gray-400 mb-6">
                Click the button below to download a spreadsheet (.xlsx) of all orders currently in the system.
            </p>
            
            
            <button
                onClick={() => exportMutation.mutate()}
                disabled={exportMutation.isLoading}
                className="w-full py-3 text-lg bg-[#f6b100] text-[#181A20] font-bold rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {exportMutation.isLoading ? 'Generating...' : 'Export All Orders'}
            </button>
        </div>
    );
};

export default ExportData;