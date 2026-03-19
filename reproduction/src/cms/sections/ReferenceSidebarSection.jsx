import React from 'react';
import { Link } from 'react-router-dom';

const ReferenceSidebarSection = ({ 
    title = '',
    dateLabel = '',
    dateValue,
    serviceLabel = '',
    categories = [],
    locationLabel = '',
    locationValue,
    ctaLabel = '',
    ctaLink = '/kontakt',
    ctaState = undefined
}) => {
    return (
        <div className="bg-surface-light dark:bg-surface-dark p-6 md:p-8 lg:p-10 rounded-3xl space-y-5 md:space-y-6">
            <h2 className="text-[1.55rem] md:text-2xl font-display text-primary">
                {title}
            </h2>
            <div className="space-y-4 md:space-y-5">
                {dateValue && (
                    <>
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 block mb-1">{dateLabel}</span>
                            <p className="text-base md:text-lg font-medium">{dateValue}</p>
                        </div>
                        <div className="h-px bg-slate-200 dark:bg-slate-700" />
                    </>
                )}
                {categories.length > 0 && (
                    <>
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 block mb-1">{serviceLabel}</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {categories.map((cat) => (
                                    <span key={cat} className="text-xs md:text-sm font-medium bg-primary/5 text-primary px-2.5 md:px-3 py-1 rounded-full border border-primary/10">{cat}</span>
                                ))}
                            </div>
                        </div>
                        <div className="h-px bg-slate-200 dark:bg-slate-700" />
                    </>
                )}
                {locationValue && (
                    <>
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 block mb-1">{locationLabel}</span>
                            <p className="text-base md:text-lg font-medium">{locationValue}</p>
                        </div>
                        <div className="h-px bg-slate-200 dark:bg-slate-700" />
                    </>
                )}
            </div>
            <Link to={ctaLink} state={ctaState} className="block w-full text-center py-4 md:py-5 mt-2 md:mt-4 border border-primary text-primary hover:bg-primary hover:text-white rounded-full transition-all uppercase text-[11px] md:text-xs font-bold tracking-widest">
                {ctaLabel}
            </Link>
        </div>
    );
};

export default ReferenceSidebarSection;
