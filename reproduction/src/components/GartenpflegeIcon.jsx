import React from 'react';

/**
 * Shared icon component for Gartenpflege.
 * Uses the canonical 'grass' Material Symbol from the Contact page.
 */
const GartenpflegeIcon = ({ className = '', ...props }) => (
    <span
        className={`material-symbols-outlined ${className}`}
        {...props}
    >
        grass
    </span>
);

export default GartenpflegeIcon;
