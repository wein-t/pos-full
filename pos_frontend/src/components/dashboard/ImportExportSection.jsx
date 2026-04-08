import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { FaFileExcel, FaUpload, FaDownload, FaMoneyBillWave, FaShoppingCart, FaChartLine, FaSyncAlt, FaCheckCircle } from 'react-icons/fa';
import { enqueueSnackbar } from 'notistack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getAllOrders } from '../../https';

// --- HELPER 1: FORMAT DATA FOR EXPORT ---
const formatOrderRow = (order) => {
    const itemsSummary = order.items?.map(item => {
        const unitPrice = item.quantity > 0 ? (item.price / item.quantity) : 0;
        return `${item.name} (x${item.quantity} @ ₱${unitPrice})`;
    }).join(', ') || 'No Items';
    
    let dateStr = '-';
    let timeStr = '-';
    if (order.createdAt) {
        const dateObj = new Date(order.createdAt);
        if (!isNaN(dateObj)) {
            dateStr = dateObj.toLocaleDateString();
            timeStr = dateObj.toLocaleTimeString();
        }
    }

    return {
        'Order ID': order.orderId || order._id,
        'Customer': order.customerDetails?.name || 'Walk-in',
        'Items Summary': itemsSummary,
        'Date': dateStr,
        'Time': timeStr,
        'Payment Mode': order.paymentMode || 'Cash',
        'Total Amount': order.bills?.total || 0,
    };
};

const ImportExportSection = () => {
    const [activeTab, setActiveTab] = useState('export'); 
    const [importFile, setImportFile] = useState(null);
    const [previewImportData, setPreviewImportData] = useState([]); 
    const queryClient = useQueryClient();

    // --- 1. LIVE DATA FETCHING ---
    const { 
        data: ordersResponse, 
        isLoading: isLoadingOrders, 
        refetch 
    } = useQuery({
        queryKey: ['all-orders-export'],
        queryFn: getAllOrders, 
        enabled: true,
        staleTime: 0, 
        refetchOnWindowFocus: true
    });

    const allOrders = ordersResponse?.data?.data || [];

    // --- 2. MEMOIZED DATA PROCESSING ---
    const { processedRows, summaryMetrics } = useMemo(() => {
        const filtered = allOrders.filter(order => order.orderStatus === 'Completed');
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const rows = filtered.map(formatOrderRow);

        const totalRevenue = filtered.reduce((sum, order) => sum + (order.bills?.total || 0), 0);
        const totalOrders = filtered.length;
        const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
        
        const dates = filtered.map(o => new Date(o.createdAt));
        const minDate = dates.length ? new Date(Math.min.apply(null, dates)).toLocaleDateString() : '-';
        const maxDate = dates.length ? new Date(Math.max.apply(null, dates)).toLocaleDateString() : '-';

        return {
            processedRows: rows,
            summaryMetrics: {
                totalRevenue,
                totalOrders,
                avgOrderValue,
                dateRange: `${minDate} to ${maxDate}`
            }
        };
    }, [allOrders]);

    // --- 3. EXPORT HANDLER ---
    const handleExport = () => {
        if (processedRows.length === 0) {
            enqueueSnackbar("No completed orders to export.", { variant: 'warning' });
            return;
        }
        const workbook = XLSX.utils.book_new();
        
        // Sheet 1: Order Details (RAW DATA GOES FIRST NOW)
        const detailsSheet = XLSX.utils.json_to_sheet(processedRows);
        detailsSheet['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 50 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(workbook, detailsSheet, "Order Details");

        // Sheet 2: Summary
        const summaryData = [
            ["Metanoia Snack House - Sales Report"],
            ["Generated On", new Date().toLocaleString()],
            ["Period Covered", summaryMetrics.dateRange],
            [], ["Metric", "Value"],
            ["Total Revenue", summaryMetrics.totalRevenue],
            ["Total Completed Orders", summaryMetrics.totalOrders],
            ["Average Order Value", summaryMetrics.avgOrderValue.toFixed(2)],
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(workbook, summarySheet, "Sales Summary");

        XLSX.writeFile(workbook, `Sales_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        enqueueSnackbar("Report exported successfully!", { variant: 'success' });
    };

    // --- 4. DOWNLOAD TEMPLATE ---
    const handleDownloadTemplate = () => {
        const templateData = [{ 
            "Order ID": "10245", 
            "Date": "1/24/2026", 
            "Month": "January",
            "Product Name": "Burger", 
            "Quantity": 2,
            "Price": 150,
            "Total": 300
        }];
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(templateData);
        worksheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(workbook, worksheet, "Import Template");
        XLSX.writeFile(workbook, "Import_Template.csv");
        enqueueSnackbar("Template downloaded!", { variant: 'info' });
    };

    // --- 5. IMPORT API MUTATION ---
    const importMutation = useMutation({
        mutationFn: (formData) => api.post('/api/data/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        onSuccess: async (res) => {
            enqueueSnackbar(res.data.message || 'File Imported Successfully!', { variant: 'success' });
            await queryClient.invalidateQueries();
            await refetch();
            setImportFile(null);
            setPreviewImportData([]);
            setActiveTab('export'); 
        },
        onError: (error) => {
            console.error("IMPORT ERROR:", error);
            enqueueSnackbar(error.response?.data?.message || 'Import failed.', { variant: 'error' });
        }
    });

    // --- SMART SHEET FINDER ---
    const getCorrectSheet = (wb) => {
        const sheetName = wb.SheetNames.find(n => n.includes("Details") || n.includes("Template"));
        return sheetName ? wb.Sheets[sheetName] : wb.Sheets[wb.SheetNames[0]];
    };

    // --- 6. FILE HANDLERS ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImportFile(file);
            
            // This is just to show the UI Preview (Backend handles the real save)
            const reader = new FileReader();
            reader.onload = (evt) => {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const ws = getCorrectSheet(wb); 
                const data = XLSX.utils.sheet_to_json(ws, { raw: false }); 
                setPreviewImportData(data.slice(0, 10)); 
            };
            reader.readAsBinaryString(file);
        }
    };

    const handleImportUpload = () => {
        if (!importFile) return;

        // Create FormData to send the actual file to your dataController.js
        const formData = new FormData();
        formData.append('spreadsheet', importFile);

        console.log("Sending File to Backend:", importFile.name);
        importMutation.mutate(formData);
    };

    return (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#333] overflow-hidden flex flex-col h-full shadow-xl">
            {/* TABS */}
            <div className="flex border-b border-[#333]">
                <button onClick={() => setActiveTab('export')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${activeTab === 'export' ? 'bg-[#262626] text-[#f6b100] border-b-2 border-[#f6b100]' : 'text-[#ababab] hover:bg-[#222]'}`}>
                    <FaDownload /> Sales Report (Export)
                </button>
                <button onClick={() => setActiveTab('import')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${activeTab === 'import' ? 'bg-[#262626] text-[#f6b100] border-b-2 border-[#f6b100]' : 'text-[#ababab] hover:bg-[#222]'}`}>
                    <FaUpload /> Import Data
                </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scroll">
                {/* EXPORT TAB */}
                {activeTab === 'export' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-[#262626] p-4 rounded-lg border border-[#333] flex items-center gap-4">
                                <div className="p-3 bg-[#107c41]/20 text-[#107c41] rounded-full"><FaMoneyBillWave size={20} /></div>
                                <div><p className="text-[#ababab] text-xs font-bold uppercase">Total Revenue</p><h3 className="text-[#f5f5f5] text-xl font-bold">₱{summaryMetrics.totalRevenue.toLocaleString()}</h3></div>
                            </div>
                            <div className="bg-[#262626] p-4 rounded-lg border border-[#333] flex items-center gap-4">
                                <div className="p-3 bg-[#f6b100]/20 text-[#f6b100] rounded-full"><FaShoppingCart size={20} /></div>
                                <div><p className="text-[#ababab] text-xs font-bold uppercase">Completed Orders</p><h3 className="text-[#f5f5f5] text-xl font-bold">{summaryMetrics.totalOrders}</h3></div>
                            </div>
                            <div className="bg-[#262626] p-4 rounded-lg border border-[#333] flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 text-blue-500 rounded-full"><FaChartLine size={20} /></div>
                                <div><p className="text-[#ababab] text-xs font-bold uppercase">Avg. Order Value</p><h3 className="text-[#f5f5f5] text-xl font-bold">₱{summaryMetrics.avgOrderValue.toFixed(0)}</h3></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div><h2 className="text-[#f5f5f5] text-lg font-bold">Live Data Preview</h2><p className="text-[#ababab] text-xs">Previewing {processedRows.length} completed records.</p></div>
                                    <button onClick={() => refetch()} className="p-2 bg-[#333] rounded-full text-[#ababab] hover:text-white hover:bg-[#444] transition-all" title="Refresh Data"><FaSyncAlt className={isLoadingOrders ? "animate-spin" : ""} /></button>
                                </div>
                                <button onClick={handleExport} disabled={isLoadingOrders || processedRows.length === 0} className="bg-[#107c41] text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#0c5e31] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                    <FaFileExcel /> Download Report
                                </button>
                            </div>

                            <div className="border border-[#333] rounded-lg overflow-hidden bg-[#222] max-h-[350px] overflow-y-auto custom-scroll">
                                <table className="w-full text-left text-xs text-[#ababab]">
                                    <thead className="bg-[#107c41] text-white uppercase font-bold sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3">Order ID</th>
                                            <th className="px-4 py-3">Customer</th>
                                            <th className="px-4 py-3">Items Summary</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Time</th>
                                            <th className="px-4 py-3">Payment</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoadingOrders ? (<tr><td colSpan="7" className="p-6 text-center">Loading live data...</td></tr>) : processedRows.length === 0 ? (<tr><td colSpan="7" className="p-6 text-center italic">No completed orders found in database.</td></tr>) : (
                                            processedRows.map((row, idx) => (
                                                <tr key={idx} className="border-b border-[#333] hover:bg-[#2a2a2a] text-[#f5f5f5]">
                                                    <td className="px-4 py-2 font-mono text-yellow-500">{row['Order ID'].toString().slice(-6)}</td>
                                                    <td className="px-4 py-2">{row['Customer']}</td>
                                                    <td className="px-4 py-2 text-[#ccc] max-w-[300px] truncate" title={row['Items Summary']}>{row['Items Summary']}</td>
                                                    <td className="px-4 py-2">{row['Date']}</td>
                                                    <td className="px-4 py-2">{row['Time']}</td>
                                                    <td className="px-4 py-2">{row['Payment Mode']}</td>
                                                    <td className="px-4 py-2 text-right font-bold text-[#f6b100]">₱{row['Total Amount'].toFixed(2)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* IMPORT TAB */}
                {activeTab === 'import' && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <div><h2 className="text-[#f5f5f5] text-lg font-bold">Required File Format</h2><p className="text-[#ababab] text-xs">Your CSV/Excel file must follow this structure.</p></div>
                                <button onClick={handleDownloadTemplate} className="text-xs bg-[#262626] border border-[#f6b100] text-[#f6b100] px-3 py-1.5 rounded hover:bg-[#f6b100] hover:text-[#1a1a1a] transition-colors flex items-center gap-2 font-bold"><FaFileExcel /> Download Template</button>
                            </div>
                            <div className="border border-[#333] rounded-lg overflow-hidden bg-[#222] opacity-80">
                                <table className="w-full text-left text-xs text-[#ababab]">
                                    <thead className="bg-[#107c41] text-white uppercase font-bold">
                                        <tr>
                                            <th className="px-4 py-3">Order ID</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Month</th>
                                            <th className="px-4 py-3">Product Name</th>
                                            <th className="px-4 py-3">Quantity</th>
                                            <th className="px-4 py-3">Price</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-[#333] bg-[#1f1f1f]">
                                            <td className="px-4 py-2 font-mono text-yellow-500">10245</td>
                                            <td className="px-4 py-2">1/24/2026</td>
                                            <td className="px-4 py-2">January</td>
                                            <td className="px-4 py-2 text-[#ccc]">Burger</td>
                                            <td className="px-4 py-2">2</td>
                                            <td className="px-4 py-2">150</td>
                                            <td className="px-4 py-2 text-right font-bold text-[#f6b100]">300</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="border-2 border-dashed border-[#444] rounded-xl p-8 flex flex-col items-center justify-center hover:border-[#f6b100] transition-colors bg-[#1f1f1f]">
                            {!importFile ? (
                                <>
                                    <FaUpload className="text-[#555] text-4xl mb-3" />
                                    <label className="cursor-pointer bg-[#262626] text-[#f5f5f5] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#333] transition-colors border border-[#333]">
                                        Select CSV or Excel File
                                        <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileChange} />
                                    </label>
                                    <p className="text-[#555] text-xs mt-2">Supports .csv, .xlsx, .xls</p>
                                </>
                            ) : (
                                <div className="text-center">
                                    <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-3" />
                                    <p className="text-[#f5f5f5] font-bold mb-4">{importFile.name}</p>
                                    <div className="flex justify-center gap-3">
                                        <button onClick={() => { setImportFile(null); setPreviewImportData([]); }} className="text-[#ababab] text-xs hover:text-white underline">Remove</button>
                                        <button onClick={handleImportUpload} disabled={importMutation.isLoading} className="bg-[#f6b100] text-[#1a1a1a] px-6 py-2 rounded-lg font-bold text-sm hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                            {importMutation.isLoading ? 'Uploading...' : 'Confirm Upload'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {previewImportData.length > 0 && (
                            <div className="animate-fade-in">
                                <h2 className="text-[#f5f5f5] text-sm font-bold mb-2">Your File Preview (First 10 Rows)</h2>
                                <div className="border border-green-900/50 rounded-lg overflow-hidden max-h-[200px] overflow-y-auto custom-scroll">
                                    <table className="w-full text-left text-xs text-[#ababab]">
                                        <thead className="bg-green-900/20 text-green-400 uppercase font-bold sticky top-0">
                                            <tr>
                                                {Object.keys(previewImportData[0] || {}).map((header) => (<th key={header} className="px-4 py-2">{header}</th>))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewImportData.map((row, idx) => (
                                                <tr key={idx} className="border-b border-[#333] hover:bg-[#222]">
                                                    {Object.values(row).map((val, i) => (<td key={i} className="px-4 py-2">{val}</td>))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImportExportSection;