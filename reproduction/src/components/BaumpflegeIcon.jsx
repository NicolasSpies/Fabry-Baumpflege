import React from 'react';

/**
 * Shared icon component for Baumpflege.
 * Uses the canonical 'nature' Material Symbol.
 */
const BaumpflegeIcon = ({ className = '', ...props }) => (
    <span
        className={`material-symbols-outlined ${className}`}
        {...props}
    >
        nature
    </span>
);

export default BaumpflegeIcon;
