import React from 'react';

/**
 * Gartenpflege icon with outline and solid variants.
 */
const GartenpflegeIcon = ({ className = '', variant = 'outline', ...props }) => {
    if (variant === 'solid') {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className={className}
                fill="currentColor"
                aria-hidden="true"
                {...props}
            >
                <path d="M3 19.8h18v1.6H3z" />
                <path d="M6.15 19.8c0-3.8 1.12-6.56 3.42-8.45v8.45H6.15Z" />
                <path d="M10.74 19.8c0-5.12 1.88-8.93 5.71-11.61V19.8h-5.71Z" />
                <path d="M17.33 19.8c0-2.93.92-5.2 2.82-6.92V19.8h-2.82Z" />
            </svg>
        );
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            <path d="M4 20h16" />
            <path d="M7 20c0-4 1.5-7.1 4.5-9.5" />
            <path d="M12 20c0-5 2-9 6-12" />
            <path d="M10 20c0-3.5-1.5-6.5-4.5-9" />
            <path d="M15 20c0-2.7.9-5 2.8-6.9" />
        </svg>
    );
};

export default GartenpflegeIcon;
