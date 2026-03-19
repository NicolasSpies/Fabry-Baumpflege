import React from 'react';

/**
 * Baumpflege icon with matching outline and solid variants.
 */
const BaumpflegeIcon = ({ className = '', variant = 'outline', ...props }) => {
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
                <path d="M12 2.6 8.4 7.3h2.04l-2.82 3.82h2.36L7.46 15h2.7L8.9 18.4h2.22V21h1.76v-2.6h2.22L13.84 15h2.7l-2.56-3.88h2.36l-2.82-3.82h2.04L12 2.6Z" />
                <rect x="7" y="20.1" width="10" height="1.4" rx="0.7" />
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
            <path d="M12 3.4 9.1 7.2h2.08L8.5 10.9h2.15L8.2 14.5h2.57l-1.26 3.1h5l-1.26-3.1h2.57l-2.45-3.6h2.15l-2.68-3.7h2.08L12 3.4Z" />
            <path d="M12 17.6V21" />
            <path d="M8.2 21h7.6" />
        </svg>
    );
};

export default BaumpflegeIcon;
