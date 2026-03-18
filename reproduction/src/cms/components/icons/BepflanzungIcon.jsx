import React from 'react';

/**
 * Shared icon component for Bepflanzung.
 * Uses the canonical 'potted_plant' Material Symbol from the Contact page.
 */
const BepflanzungIcon = ({ className = '', ...props }) => (
    <span
        className={`material-symbols-outlined ${className}`}
        {...props}
    >
        potted_plant
    </span>
);

export default BepflanzungIcon;
