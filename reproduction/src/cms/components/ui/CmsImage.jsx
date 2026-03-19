import React from 'react';
import { getCmsImageProps } from '@/cms/lib/cms';

const CmsImage = React.forwardRef(function CmsImage(
    { image, alt, sizes, className = '', loading, decoding = 'async', fetchPriority, ...props },
    ref
) {
    const imageProps = getCmsImageProps(image, { alt, sizes, loading, decoding, fetchPriority });

    if (!imageProps?.src) return null;

    return <img ref={ref} className={className} {...imageProps} {...props} />;
});

export default CmsImage;
