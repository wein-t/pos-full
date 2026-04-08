import React from 'react';

const MiniCard = ({ title, icon, number, footerNum }) => {

   

    
    const isPositive = footerNum >= 0;

    
    const percentageColorClass = isPositive ? 'text-green-500' : 'text-red-500';

    
    const arrowPath = isPositive ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7";

   

    return (
        <div className='bg-[#1a1a1a] py-5 px-5 rounded-lg w-[50%]'>
            <div className='flex items-start justify-between'>
                <h1 className='text-[#f5f5f5] text-lg font-semibold tracking-wide'>
                    {title}
                </h1>
                <button className={`${title === "Total Earnings" ? "bg-[#02ca3a]" : "bg-[#f6b100]"} p-3 rounded-lg text-[#f5f5f5] text-2xl`}>
                    {icon}
                </button>
            </div>
            <div>
                <h1 className='text-[#f5f5f5] text-4xl font-bold mt-5'>
                   
                    {title === "Total Earnings" ? `₱${Number(number).toFixed(2)}` : number}
                </h1>
                
                <h1 className={`text-lg mt-2 flex items-center gap-1`}>
                    <span className={`${percentageColorClass} flex items-center`}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" fill="none">
                            <path d={arrowPath} />
                        </svg>
                       
                        {Math.abs(footerNum)}%
                    </span>
                    <span className='text-[#f5f5f5]'>than yesterday</span>
                </h1>
            </div>
        </div>
    );
};

export default MiniCard;