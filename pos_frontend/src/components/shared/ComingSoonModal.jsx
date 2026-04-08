import React from 'react';
import { IoClose } from 'react-icons/io5';
import { FaTools } from 'react-icons/fa'; 
const ComingSoonModal = ({ isOpen, onClose, featureName }) => {
    if (!isOpen) return null;

    return (
        
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-[#262626] shadow-xl w-full max-w-md mx-4 rounded-lg p-6 text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-end">
                    <button className='text-gray-400 hover:text-white' onClick={onClose}>
                        <IoClose size={24} />
                    </button>
                </div>
                
                <div className="flex flex-col items-center gap-4 py-4">
                    <FaTools className="text-yellow-400" size={48} />
                    <h2 className="text-2xl font-bold text-white">Feature Coming Soon!</h2>
                    <p className="text-gray-300">
                        The "{featureName}" feature is currently under construction. Please check back later!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ComingSoonModal;