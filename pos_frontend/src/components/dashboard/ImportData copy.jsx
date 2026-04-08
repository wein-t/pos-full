import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../https';
import { enqueueSnackbar } from 'notistack';
import { FaFileUpload } from 'react-icons/fa';

const ImportData = () => {
    const [file, setFile] = useState(null);

    
    console.log("Current file state:", file);

    const importMutation = useMutation({
        mutationFn: (formData) => api.post('/api/data/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        onSuccess: (res) => {
            enqueueSnackbar(res.data.message, { variant: 'success' });
            setFile(null);
        },
        onError: (error) => {
            enqueueSnackbar(error.response?.data?.message || 'Import failed! Check backend console.', { variant: 'error' });
        }
    });

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            
            console.log("File selection changed. Selected file:", selectedFile);
            setFile(selectedFile);
        }
    };

    const handleUpload = () => {
        
        console.log("Upload button clicked. Current file state is:", file);

        if (!file) {
            enqueueSnackbar('Please choose a file first!', { variant: 'warning' });
            return;
        }

        console.log("File found, preparing to call mutation..."); 
        const formData = new FormData();
        formData.append('spreadsheet', file);
        importMutation.mutate(formData);
    };

    return (
        <div className="bg-[#1a1a1a] p-8 rounded-lg max-w-2xl mx-auto mt-10">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Import Sales Data</h2>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-10">
                <FaFileUpload className={`text-5xl mb-4 ${file ? 'text-green-500' : 'text-yellow-400'}`} />
                
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                />
                
                <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-[#262626] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#333]"
                >
                    Choose a Spreadsheet
                </label>
                
                {file && <p className="text-gray-400 mt-4">Selected file: {file.name}</p>}
            </div>

            <button
                onClick={handleUpload}
                disabled={!file || importMutation.isLoading}
                className="w-full mt-6 py-3 text-lg bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {importMutation.isLoading ? 'Uploading...' : 'Upload File'}
            </button>
            <p className="text-xs text-gray-500 mt-4 text-center">
                Please ensure your spreadsheet has columns: 'Order ID', 'Date', 'Month', 'Product Name', 'Quantity', 'Price', 'Total'.
            </p>
        </div>
    );
};

export default ImportData;