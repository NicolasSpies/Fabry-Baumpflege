import React from 'react';
import { resolveInstanceProps } from '@/cms/bridge-resolver';
import Icon from '@/cms/components/ui/Icon';
import { renderCmsInline } from '@/cms/components/ui/CmsText';

/**
 * Preview Metadata for ContentBridge scanning.
 */

const TestimonialCard = ({ author, rating_raw, text, data, page = 'Home', section = 'TestimonialsSection' }) => {
    const props = resolveInstanceProps(page, `${section}/TestimonialCard`, { author, rating_raw, text }, data);
    
    // Safety for rendering
    const rating = Math.max(0, Math.min(5, parseInt(props.rating_raw) || 0));

    return (
        <div
            data-testimonial-card
            className="flex-shrink-0 self-stretch w-[78vw] sm:w-[30rem] md:w-[28rem] bg-white dark:bg-surface-dark px-6 py-7 md:px-9 md:py-9 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm md:shadow-md transition-shadow pointer-events-none flex flex-col"
        >
            <div className="flex items-center gap-1 text-amber-400 mb-3 md:mb-4">
                {[...Array(rating)].map((_, i) => (
                    <Icon key={i} name="star" className="text-sm md:text-base" />
                ))}
            </div>
            <p className="text-slate-700 dark:text-slate-300 italic mb-7 md:mb-8 leading-relaxed font-sans text-[0.95rem] md:text-base">
                "{renderCmsInline(props.text)}"
            </p>
            <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-6 mt-auto">
                <div>
                    <h4 className="font-serif text-primary text-lg">{renderCmsInline(props.author)}</h4>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;
