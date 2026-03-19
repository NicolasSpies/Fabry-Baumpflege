import React from 'react';
import { resolveInstanceProps } from '@/cms/bridge-resolver';
import Icon from '@/cms/components/ui/Icon';

/**
 * Preview Metadata for ContentBridge scanning.
 */

const TestimonialCard = ({ author, rating_raw, text, data, page = 'Home', section = 'TestimonialsSection' }) => {
    const props = resolveInstanceProps(page, `${section}/TestimonialCard`, { author, rating_raw, text }, data);
    
    // Safety for rendering
    const rating = Math.max(0, Math.min(5, parseInt(props.rating_raw) || 0));

    return (
        <div className="flex-shrink-0 w-[90vw] md:w-[450px] bg-white dark:bg-surface-dark p-8 md:p-10 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow pointer-events-none">
            <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(rating)].map((_, i) => (
                    <Icon key={i} name="star" className="text-sm" />
                ))}
            </div>
            <p className="text-slate-700 dark:text-slate-300 italic mb-8 leading-relaxed font-sans">
                "{props.text}"
            </p>
            <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-6">
                <div>
                    <h4 className="font-serif text-primary text-lg">{props.author}</h4>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;
