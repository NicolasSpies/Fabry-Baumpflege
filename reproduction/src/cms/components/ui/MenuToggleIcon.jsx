import React from 'react';

/**
 * Animated hamburger / close icon.
 * Pass `open={true}` to animate into the X state.
 *
 * Props forwarded to the <svg> element (className, style, aria-*, etc.).
 * Stroke colour inherits `currentColor` so wrap in a text-* class.
 */
export function MenuToggleIcon({
    open,
    className = '',
    strokeWidth = 2,
    duration = 420,
    ...props
}) {
    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ease-in-out ${open ? '-rotate-45' : 'rotate-0'} ${className}`}
            style={{ transitionDuration: `${duration}ms` }}
            aria-hidden="true"
            {...props}
        >
            {/* Morphing top line → diagonal arm of X */}
            <path
                className={`transition-all ease-in-out ${
                    open
                        ? '[stroke-dasharray:20_300] [stroke-dashoffset:-32.42px]'
                        : '[stroke-dasharray:12_63]'
                }`}
                style={{ transitionDuration: `${duration}ms` }}
                d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
            />
            {/* Middle line — always present */}
            <path d="M7 16 27 16" />
        </svg>
    );
}

export default MenuToggleIcon;
