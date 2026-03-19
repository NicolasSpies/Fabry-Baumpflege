import React from 'react';

const Svg = ({ children, className = '', viewBox = '0 0 24 24', fill = 'none', stroke = 'currentColor', strokeWidth = 1.8, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        width="1em"
        height="1em"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`inline-block shrink-0 align-middle ${className}`.trim()}
        aria-hidden="true"
        {...props}
    >
        {children}
    </svg>
);

const Icon = ({ name, className = '', ...props }) => {
    switch (name) {
        case 'nature':
            return (
                <Svg className={className} {...props}>
                    <path d="M12 3c-2.8 1.8-4.5 4.2-5.1 7.2h3.4L7.8 14h3.1L8.5 18h7l-2.4-4h3.1l-2.5-3.8h3.4C16.5 7.2 14.8 4.8 12 3Z" />
                    <path d="M12 18v3" />
                    <path d="M7 21h10" />
                </Svg>
            );
        case 'grass':
            return (
                <Svg className={className} {...props}>
                    <path d="M4 20h16" />
                    <path d="M7 20c0-4 1.5-7.1 4.5-9.5" />
                    <path d="M12 20c0-5 2-9 6-12" />
                    <path d="M10 20c0-3.5-1.5-6.5-4.5-9" />
                    <path d="M15 20c0-2.7.9-5 2.8-6.9" />
                </Svg>
            );
        case 'potted_plant':
            return (
                <Svg className={className} {...props}>
                    <path d="M8 14h8l-1.2 6H9.2L8 14Z" />
                    <path d="M7 10h10" />
                    <path d="M12 14V6" />
                    <path d="M12 6c0-2.1 1.6-3.8 3.7-4" />
                    <path d="M12 8c-1.6 0-3-1.1-3.4-2.6" />
                </Svg>
            );
        case 'menu':
            return (
                <Svg className={className} {...props}>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                </Svg>
            );
        case 'close':
            return (
                <Svg className={className} {...props}>
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                </Svg>
            );
        case 'arrow_forward':
            return (
                <Svg className={className} {...props}>
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                </Svg>
            );
        case 'arrow_back':
            return (
                <Svg className={className} {...props}>
                    <path d="M19 12H5" />
                    <path d="M11 18l-6-6 6-6" />
                </Svg>
            );
        case 'arrow_back_ios_new':
            return (
                <Svg className={className} {...props}>
                    <path d="M15 5l-7 7 7 7" />
                </Svg>
            );
        case 'arrow_forward_ios':
            return (
                <Svg className={className} {...props}>
                    <path d="M9 5l7 7-7 7" />
                </Svg>
            );
        case 'refresh':
            return (
                <Svg className={className} {...props}>
                    <path d="M20 11a8 8 0 1 0 2 5.3" />
                    <path d="M20 4v7h-7" />
                </Svg>
            );
        case 'swap_horiz':
            return (
                <Svg className={className} {...props}>
                    <path d="M5 8h12" />
                    <path d="M13 4l4 4-4 4" />
                    <path d="M19 16H7" />
                    <path d="M11 12l-4 4 4 4" />
                </Svg>
            );
        case 'info':
            return (
                <Svg className={className} {...props}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 10v6" />
                    <path d="M12 7h.01" />
                </Svg>
            );
        case 'check':
            return (
                <Svg className={className} {...props}>
                    <path d="M5 12l4 4L19 6" />
                </Svg>
            );
        case 'check_circle':
            return (
                <Svg className={className} {...props}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8.5 12.3l2.2 2.2 4.8-5.1" />
                </Svg>
            );
        case 'error':
            return (
                <Svg className={className} {...props}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v5" />
                    <path d="M12 16h.01" />
                </Svg>
            );
        case 'location_on':
            return (
                <Svg className={className} {...props}>
                    <path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z" />
                    <circle cx="12" cy="10" r="2.5" />
                </Svg>
            );
        case 'phone':
            return (
                <Svg className={className} {...props}>
                    <path d="M7.5 4.5h2.6l1.2 4.1-1.7 1.7a14.2 14.2 0 0 0 4.1 4.1l1.7-1.7 4.1 1.2v2.6a1.7 1.7 0 0 1-1.9 1.7A15.8 15.8 0 0 1 5.8 6.4 1.7 1.7 0 0 1 7.5 4.5Z" />
                </Svg>
            );
        case 'mail':
            return (
                <Svg className={className} {...props}>
                    <rect x="3" y="6" width="18" height="12" rx="2" />
                    <path d="M4 8l8 6 8-6" />
                </Svg>
            );
        case 'star':
            return (
                <Svg className={className} fill="currentColor" stroke="none" {...props}>
                    <path d="M12 2.8l2.7 5.48 6.05.88-4.38 4.27 1.03 6.03L12 16.63 6.6 19.46l1.03-6.03-4.38-4.27 6.05-.88L12 2.8Z" />
                </Svg>
            );
        default:
            return null;
    }
};

export default Icon;
