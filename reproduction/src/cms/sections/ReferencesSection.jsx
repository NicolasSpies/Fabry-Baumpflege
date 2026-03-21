import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReferenceCard from '@/cms/components/ui/ReferenceCard';
import Icon from '@/cms/components/ui/Icon';
import { renderCmsInline } from '@/cms/components/ui/CmsText';
import { isExternalHref } from '@/cms/bridge-resolver';


const ReferencesSection = ({ 
    label,
    title,
    view_all = "Alle Projekte ansehen", 
    items = [], 
    language = "de", 
    allRefsHref = "/referenzen", 
    isLoading,
    page = 'Home', 
    section = 'ReferencesSection'
}) => {
    const isExternalViewAll = isExternalHref(allRefsHref);

    return (
        <section className="py-24 px-6 bg-primary/[0.035] dark:bg-surface-dark/50 border-y border-slate-100 dark:border-slate-800" id="references-preview">
            <div className="max-w-7xl mx-auto">
                    <div className="text-center space-y-4 mb-12 md:mb-16">
                        <span className="text-accent-label font-bold tracking-widest uppercase text-xs block">{label}</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-primary reveal">{title}</h2>
                    </div>
                <div className={`md:hidden -mx-6 px-6 overflow-x-auto scrollbar-hide ${isLoading ? 'min-h-[24rem]' : ''}`}>
                    <div className="flex gap-4 w-max snap-x snap-mandatory pb-2">
                        {!isLoading && items.map((project, idx) => (
                            <div key={project.id || idx} className="w-[84vw] max-w-[26rem] flex-shrink-0 snap-center">
                                <ReferenceCard
                                    {...project}
                                    language={language}
                                    forceSquare={true}
                                    data={project.data}
                                    page={page}
                                    section={section}
                                    loading="lazy" // Never eager on home to let Hero win
                                    sizes="(max-width: 768px) 85vw, 400px"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8 ${isLoading ? 'min-h-[28rem]' : ''}`}>
                    {!isLoading && items.map((project, idx) => (
                        <ReferenceCard 
                            key={project.id || idx} 
                            {...project} 
                            language={language} 
                            forceSquare={true} 
                            data={project.data} 
                            page={page}
                            section={section}
                            loading="lazy" // Never eager on home to let Hero win
                            sizes="(max-width: 1024px) 45vw, 30vw"
                        />
                    ))}
                </div>
                {view_all && allRefsHref && (
                    <div className="text-center mt-16">
                        {isExternalViewAll ? (
                            <a
                                href={allRefsHref}
                                className="inline-flex items-center gap-3 px-10 py-4 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 text-sm uppercase tracking-widest"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {renderCmsInline(view_all)}
                                <Icon name="arrow_forward" className="text-sm" />
                            </a>
                        ) : (
                            <Link
                                to={allRefsHref}
                                className="inline-flex items-center gap-3 px-10 py-4 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 text-sm uppercase tracking-widest"
                            >
                                {renderCmsInline(view_all)}
                                <Icon name="arrow_forward" className="text-sm" />
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ReferencesSection;
