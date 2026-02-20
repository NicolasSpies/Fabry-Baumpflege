import React from 'react';

/**
 * Minimalist outline icon for Baumfällung (tree felling).
 * Concept: Vertical rounded-rectangle trunk with subtle grain lines
 * and a geometric axe embedded diagonally.
 */
const BaumfaellungIcon = ({ className = '', ...props }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        {/* Tree trunk — rounded rectangle */}
        <rect x="7" y="2" width="7" height="20" rx="2" />

        {/* Subtle wood grain lines */}
        <line x1="10" y1="5" x2="10" y2="19" />
        <line x1="12.5" y1="6" x2="12.5" y2="18" />

        {/* Axe handle — diagonal line from top-right into the trunk */}
        <line x1="20" y1="4" x2="14" y2="11" />

        {/* Axe head — small geometric wedge at the impact point */}
        <path d="M14 9l2-1.5v4z" />
    </svg>
);

export default BaumfaellungIcon;
