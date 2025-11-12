import React from 'react';

interface IconProps {
    size?: number;
    className?: string;
}

export const CheckCircleIcon: React.FC<IconProps> = ({ size = 20, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || `h-5 w-5 flex-shrink-0`} style={{height: size, width: size}} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

export const XCircleIcon: React.FC<IconProps> = ({ size = 20, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || `h-5 w-5 flex-shrink-0`} style={{height: size, width: size}} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);

export const LightbulbIcon: React.FC<IconProps> = ({ size = 20, className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className || `h-5 w-5 flex-shrink-0`} style={{height: size, width: size}} viewBox="0 0 20 20" fill="currentColor">
        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.657 5.657L5 6.364a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zM10 18a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1zM3.636 14.364l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zM14.364 14.364l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414z" />
        <path d="M10 16a6 6 0 100-12 6 6 0 000 12z" />
     </svg>
);