import React from 'react';
import { IoArrowBackOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';

const BackButton = ({ onClick }) => {
    const navigate = useNavigate();

    return (
        
        <button onClick={() => navigate(-1)} className='cursor-pointer bg-[#025cca] p-3 text-xl font-bold rounded-full text-white hover:bg-[#024a9e] transition-colors'>
            <IoArrowBackOutline />
        </button> 
    );
};

export default BackButton;