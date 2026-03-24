import React, { useEffect, useState } from 'react';
import { getCmsImageProps } from '@/cms/lib/cms';

const CmsImage = React.forwardRef(function CmsImage(
    { image, alt, sizes, size, className = '', loading, decoding = 'async', fetchPriority, preferSmallSource, preferMediumSource, maxWidth, ...props },
    ref
) {
    const [preferSmall, setPreferSmall] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth < 768;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const mediaQuery = window.matchMedia('(max-width: 767px)');
        const sync = () => setPreferSmall(mediaQuery.matches);

        sync();
        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', sync);
            return () => mediaQuery.removeEventListener('change', sync);
        }

        mediaQuery.addListener(sync);
        return () => mediaQuery.removeListener(sync);
    }, []);

    const imageProps = getCmsImageProps(image, {
        alt,
        sizes,
        size,
        loading,
        decoding,
        fetchPriority,
        preferSmall: typeof preferSmallSource === 'boolean' ? preferSmallSource : preferSmall,
        preferMedium: Boolean(preferMediumSource),
        preferDesktopSharpness: !preferSmall,
        maxWidth,
    });

    if (!imageProps?.src) return null;

    return <img ref={ref} className={className} {...imageProps} {...props} />;
});

export default CmsImage;
