import React from 'react';
import { Link } from 'react-router-dom';

const ReferenceSidebarSection = ({ 
    title = "Projekt-Details",
    dateLabel = "Datum",
    dateValue,
    serviceLabel = "Leistung",
    categories = [],
    locationLabel = "Standort",
    locationValue,
    ctaLabel = "Ähnliches Projekt anfragen",
    ctaLink = "/kontakt"
}) => {
    return (
        <div className="bg-surface-light dark:bg-surface-dark p-10 rounded-3xl space-y-8">
            <h2 className="text-2xl font-display text-primary">
                {title}
            </h2>
            <div className="space-y-6">
                {dateValue && (
                    <>
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 block mb-1">{dateLabel}</span>
                            <p className="text-lg font-medium">{dateValue}</p>
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
                                    <span key={cat} className="text-sm font-medium bg-primary/5 text-primary px-3 py-1 rounded-full border border-primary/10">{cat}</span>
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
                            <p className="text-lg font-medium">{locationValue}</p>
                        </div>
                        <div className="h-px bg-slate-200 dark:bg-slate-700" />
                    </>
                )}
            </div>
            <Link to={ctaLink} className="block w-full text-center py-5 mt-4 border border-primary text-primary hover:bg-primary hover:text-white rounded-full transition-all uppercase text-xs font-bold tracking-widest">
                {ctaLabel}
            </Link>
        </div>
    );
};

export default ReferenceSidebarSection;
