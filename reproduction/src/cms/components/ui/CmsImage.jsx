import React, { useEffect, useState } from 'react';
import { getCmsImageProps } from '@/cms/lib/cms';

const CmsImage = React.forwardRef(function CmsImage(
    { image, alt, sizes, size, className = '', loading, decoding = 'async', fetchPriority, preferSmallSource, preferMediumSource, maxWidth, noFade, ...props },
    ref
) {
    const [preferSmall, setPreferSmall] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth < 768;
    });
    const [loaded, setLoaded] = useState(false);

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

    if (!imageProps?.src) {
        return <div ref={ref} className={`${className} bg-slate-200 dark:bg-slate-700 animate-pulse`} aria-hidden="true" {...props} />;
    }

    // Final safety: strip any srcSet entries without valid w/x descriptors
    if (imageProps.srcSet) {
        imageProps.srcSet = imageProps.srcSet
            .split(',')
            .map(e => e.trim())
            .filter(e => /\s\d+w$/.test(e) || /\s\d+(\.\d+)?x$/.test(e))
            .join(', ') || undefined;
    }

    return (
        <img
            ref={ref}
            className={noFade ? className : `${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0 bg-slate-200 dark:bg-slate-700'}`}
            {...imageProps}
            {...props}
            onLoad={(e) => {
                setLoaded(true);
                props.onLoad?.(e);
            }}
        />
    );
});

export default CmsImage;
