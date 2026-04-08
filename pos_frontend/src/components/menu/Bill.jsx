import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getTotalPrice, clearCart } from '../../redux/slices/cartSlice';
import { setCustomerName } from '../../redux/slices/customerSlice'; // <--- IMPORT THIS
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addOrder } from '../../https/index';
import { enqueueSnackbar } from 'notistack';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Modal from '../shared/Modal'; 
import { FaFileInvoice, FaCheckCircle, FaPrint, FaTrashAlt } from 'react-icons/fa'; // <--- Import Trash Icon

const Bill = () => {
    const cartData = useSelector(state => state.cart);
    const total = useSelector(getTotalPrice);
    const { customerName } = useSelector(state => state.customer); 
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const [isReceiptModalOpen, setReceiptModalOpen] = useState(false);
    const [isOrderSaved, setIsOrderSaved] = useState(false);

    // --- NEW: HANDLE CLEAR / RESET ORDER ---
    const handleClearOrder = () => {
        if (cartData.length > 0) {
            if (window.confirm("Are you sure you want to clear the current order?")) {
                dispatch(clearCart());
                dispatch(setCustomerName('')); // Reset name
                setIsOrderSaved(false);
                enqueueSnackbar("Order cleared.", { variant: 'info' });
            }
        } else {
             // If empty, just reset state silently
             dispatch(clearCart());
             dispatch(setCustomerName(''));
             setIsOrderSaved(false);
        }
    };

    // --- 1. HANDLE CREATE ORDER ---
    const orderMutation = useMutation({
        mutationFn: addOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            setIsOrderSaved(true); 
            enqueueSnackbar("Order created! You can now save the receipt.", { variant: 'success' });
        },
        onError: (error) => {
            console.error("Failed to save order:", error);
            enqueueSnackbar(error.response?.data?.message || "Error: Could not save the order.", { variant: 'error' });
        }
    });

    const handleCreateOrder = () => {
        if (cartData.length === 0) {
            enqueueSnackbar("Cart is empty!", { variant: 'warning' });
            return;
        }
        const orderData = {
            items: cartData,
            orderStatus: "Pending",
            customerDetails: { name: customerName || "Walk-in Customer" },
            bills: { total: total, tax: 0, totalWithTax: total },
            paymentMode: "Cash"
        };
        orderMutation.mutate(orderData);
    };

    // --- 2. HANDLE RECEIPT GENERATION (PDF) ---
    const generatePDF = () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [100, 250] 
        });

        const receiptId = `RCPT-${Date.now().toString().slice(-6)}`;
        const issueDate = new Date().toLocaleDateString("en-US", { timeZone: "Asia/Manila" });
        const issueTime = new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Manila" });

        // Header
        doc.setFillColor(246, 177, 0);
        doc.rect(0, 0, 100, 35, 'F');

        doc.setTextColor(26, 26, 26); 
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16); 
        doc.text("Metanoia Snack House", 50, 15, { align: 'center' }); 
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("Taste the Joy, Feel the Vibe", 50, 22, { align: 'center' });
        doc.text("#8 Labsan Street, Kayang Ext.", 50, 28, { align: 'center' });

        // Info
        let yPos = 45;
        doc.setTextColor(0, 0, 0); 
        doc.setFontSize(10);
        
        doc.text(`Receipt #: ${receiptId}`, 5, yPos);
        doc.text(`${issueTime}`, 95, yPos, { align: 'right' });
        yPos += 6;
        doc.text(`Customer: ${customerName || 'Walk-in'}`, 5, yPos);
        doc.text(`${issueDate}`, 95, yPos, { align: 'right' });

        // Table
        const tableColumn = ["Item", "Price", "Qty", "Total"];
        const tableRows = cartData.map(item => [
            item.name,
            `P${(item.price / item.quantity).toFixed(2)}`,
            `x${item.quantity}`,
            `P${item.price.toFixed(2)}`
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: yPos + 8,
            theme: 'plain', 
            styles: { fontSize: 10, cellPadding: 3, textColor: [0, 0, 0] },
            headStyles: { fillColor: [38, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' }, 
            columnStyles: {
                0: { cellWidth: 35, halign: 'left' },
                1: { cellWidth: 20, halign: 'right' },
                2: { cellWidth: 15, halign: 'center' },
                3: { cellWidth: 20, halign: 'right' },
            },
            margin: { left: 5, right: 5 }
        });

        let finalY = doc.lastAutoTable.finalY;

        // Totals
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(5, finalY + 5, 95, finalY + 5); 
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL: P${total.toFixed(2)}`, 95, finalY + 15, { align: 'right' });

        // Footer
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100); 
        doc.text("Thank you for dining with us!", 50, finalY + 30, { align: 'center' });

        doc.save(`receipt-${receiptId}.pdf`);
        handleFinishTransaction();
    };

    const handleFinishTransaction = () => {
        setReceiptModalOpen(false);
        dispatch(clearCart()); 
        dispatch(setCustomerName('')); // <--- Also clear name on finish
        setIsOrderSaved(false); 
        enqueueSnackbar("Transaction completed!", { variant: 'info' });
    }

    return (
        <>
            {/* --- CART HEADER WITH CLEAR BUTTON --- */}
            <div className='flex items-center justify-between px-5 mt-2'>
                <div className="flex items-center gap-2">
                    <p className='text-xs text-[#ababab] font-medium'>Items ({cartData.length})</p>
                    
                    {/* NEW CLEAR BUTTON */}
                    {cartData.length > 0 && (
                        <button 
                            onClick={handleClearOrder}
                            className="text-[10px] bg-red-900/30 text-red-400 border border-red-900 hover:bg-red-900/50 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                            title="Clear Cart"
                        >
                            <FaTrashAlt /> Clear
                        </button>
                    )}
                </div>
                <h1 className='text-[#f5f5f5] text-md font-bold'>₱{total.toFixed(2)}</h1>
            </div>

            {/* --- ACTION BUTTONS --- */}
            <div className='flex flex-col gap-3 px-5 mt-4'>
                <button
                    onClick={handleCreateOrder}
                    disabled={orderMutation.isLoading || cartData.length === 0 || isOrderSaved}
                    className={`py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg transition-colors
                        ${isOrderSaved 
                            ? "bg-green-600/50 text-gray-300 cursor-not-allowed" 
                            : "bg-[#025cca] text-white hover:bg-[#024a9e] disabled:opacity-50 disabled:cursor-not-allowed"
                        }`}
                >
                    {orderMutation.isLoading ? 'Creating...' : isOrderSaved ? (
                        <> <FaCheckCircle /> Order Sent </>
                    ) : (
                        <> <FaCheckCircle /> Create Order </>
                    )}
                </button>

                <button
                    onClick={() => setReceiptModalOpen(true)}
                    disabled={!isOrderSaved} 
                    className={`border py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all
                        ${!isOrderSaved 
                            ? "bg-[#1a1a1a] border-[#333] text-[#555] cursor-not-allowed" 
                            : "bg-[#262626] border-[#f6b100] text-[#f6b100] hover:bg-[#333]"
                        }`}
                >
                    <FaFileInvoice /> Save Receipt
                </button>

                {isOrderSaved && (
                    <button 
                        onClick={handleFinishTransaction}
                        className="text-xs text-[#ababab] hover:text-white underline text-center mt-1 cursor-pointer"
                    >
                        Skip receipt & start new order
                    </button>
                )}
            </div>

            {/* --- RECEIPT PREVIEW MODAL --- */}
            <Modal 
                isOpen={isReceiptModalOpen} 
                onClose={() => setReceiptModalOpen(false)} 
                title="Receipt Preview"
            >
                <div className="flex flex-col h-full">
                    <p className="text-[#ababab] text-sm mb-4 text-center">
                        Please review the details before saving.
                    </p>

                    <div className="bg-white text-black rounded-lg shadow-inner mx-auto w-[320px] text-xs font-mono mb-6 relative overflow-hidden">
                        <div className="bg-[#f6b100] w-full p-4 text-center text-[#1a1a1a]">
                            <h2 className="font-bold text-xl leading-tight">Metanoia Snack House</h2>
                            <p className="text-[11px] font-medium mt-1">Taste the Joy, Feel the Vibe</p>
                            <p className="text-[10px] mt-0.5">#8 Labsan Street, Kayang Ext.</p>
                        </div>
                        <div className="p-6">
                            <div className="mb-4 text-[11px] space-y-1">
                                <div className="flex justify-between items-end">
                                    <span>Receipt #: RCPT-{Date.now().toString().slice(-6)}</span>
                                    <span>{new Date().toLocaleTimeString()}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span>Customer: <span className="font-bold">{customerName || "Walk-in"}</span></span>
                                    <span>{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-12 gap-1 text-[11px] font-bold bg-[#262626] text-white py-2 px-1 mb-2">
                                <div className="col-span-4 text-left">Item</div>
                                <div className="col-span-3 text-right">Price</div>
                                <div className="col-span-2 text-center">Qty</div>
                                <div className="col-span-3 text-right">Total</div>
                            </div>
                            <div className="space-y-2 mb-4 text-[11px]">
                                {cartData.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-1 border-b border-dashed border-gray-200 pb-1">
                                        <div className="col-span-4 truncate text-left">{item.name}</div>
                                        <div className="col-span-3 text-right">{(item.price / item.quantity).toFixed(2)}</div>
                                        <div className="col-span-2 text-center">x{item.quantity}</div>
                                        <div className="col-span-3 text-right">{item.price.toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-lg font-bold mt-4 pt-2 border-t-2 border-gray-200">
                                <span>TOTAL</span>
                                <span>₱{total.toFixed(2)}</span>
                            </div>
                            <div className="text-center mt-6 text-[10px] text-gray-400 italic">
                                Thank you for dining with us!
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-auto">
                        <button 
                            onClick={() => setReceiptModalOpen(false)}
                            className="flex-1 py-3 rounded-lg bg-[#262626] text-[#ababab] hover:text-white font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={generatePDF}
                            className="flex-1 py-3 rounded-lg bg-[#f6b100] text-[#1a1a1a] font-bold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                        >
                            <FaPrint /> Save & Print
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Bill;