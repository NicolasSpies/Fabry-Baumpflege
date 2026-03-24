import React from 'react';

export function normalizeCmsParagraphs(text) {
    if (!text) return [];

    const normalized = String(text)
        .replace(/\r\n/g, '\n')
        .replace(/<\/p>\s*<p>/gi, '\n\n')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/p>/gi, '')
        .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .trim();

    if (!normalized) return [];

    return normalized
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
}

export function renderCmsInline(text) {
    return String(text)
        .split('\n')
        .map((part, index, arr) => (
            <React.Fragment key={`${part}-${index}`}>
                {part}
                {index < arr.length - 1 ? <br /> : null}
            </React.Fragment>
        ));
}

const CmsText = ({
    text,
    className = '',
    paragraphClassName = '',
    leadClassName = '',
}) => {
    const paragraphs = normalizeCmsParagraphs(text);

    // During cold start / initial hydration, we render the container with a fixed height
    // placeholder if empty to prevent the section from collapsing to 0px.
    if (!paragraphs.length) {
        return (
            <div className={`${className} min-h-[1em] opacity-0`} aria-hidden="true">
                <p className={paragraphClassName}>&nbsp;</p>
            </div>
        );
    }

    return (
        <div className={className}>
            {paragraphs.map((paragraph, index) => (
                <p
                    key={`cms-paragraph-${index}`}
                    className={`${paragraphClassName}${index === 0 && leadClassName ? ` ${leadClassName}` : ''}`}
                >
                    {renderCmsInline(paragraph)}
                </p>
            ))}
        </div>
    );
};

export default CmsText;
