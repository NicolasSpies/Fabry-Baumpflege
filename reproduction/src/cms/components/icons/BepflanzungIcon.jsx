import React from 'react';

/**
 * Bepflanzung icon with outline and solid variants.
 */
const BepflanzungIcon = ({ className = '', variant = 'outline', ...props }) => {
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
                <path d="M8.1 12.7h7.8l-1.18 7H9.28L8.1 12.7Z" />
                <path d="M7 9.6h10v1.7H7z" />
                <path d="M11.12 10V6.15c0-1.78 1.35-3.22 3.1-3.4V4c-.98.17-1.72.99-1.72 1.98V10h-1.38Z" />
                <path d="M10.5 6.35c-1.18 0-2.16-.87-2.33-2.02h1.37c.1.42.47.73.96.73V6.35Z" />
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
            <path d="M8 14h8l-1.2 6H9.2L8 14Z" />
            <path d="M7 10h10" />
            <path d="M12 14V6" />
            <path d="M12 6c0-2.1 1.6-3.8 3.7-4" />
            <path d="M12 8c-1.6 0-3-1.1-3.4-2.6" />
        </svg>
    );
};

export default BepflanzungIcon;
