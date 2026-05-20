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
        <section className="py-24 px-6 bg-primary/[0.035] dark:bg-surface-dark/50 border-y border-slate-100 dark:border-slate-800" id="references-preview" style={{ minHeight: '680px' }}>
            <div className="max-w-7xl mx-auto">
                    <div className="text-center space-y-4 mb-12 md:mb-16">
                        <span className="text-accent-label font-bold tracking-widest uppercase text-xs block">{label}</span>
                        <h2 className="text-4xl md:text-[2.75rem] lg:text-5xl font-serif text-primary reveal">{title}</h2>
                    </div>
                <div className="lg:hidden -mx-6 px-6 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-4 w-max snap-x snap-mandatory pb-2">
                        {isLoading
                            ? [0, 1, 2].map((i) => (
                                <div key={i} className="w-[84vw] max-w-[26rem] flex-shrink-0 snap-center">
                                    <div className="rounded-xl overflow-hidden animate-pulse">
                                        <div className="bg-slate-200 dark:bg-slate-700 aspect-[4/3] w-full" />
                                        <div className="p-4 space-y-2 bg-white dark:bg-surface-dark">
                                            <div className="bg-slate-200 dark:bg-slate-700 h-4 rounded w-3/4" />
                                            <div className="bg-slate-200 dark:bg-slate-700 h-3 rounded w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            ))
                            : items.map((project, idx) => (
                                <div key={project.id || idx} className="w-[84vw] max-w-[26rem] flex-shrink-0 snap-center">
                                    <ReferenceCard
                                        {...project}
                                        language={language}
                                        data={project.data}
                                        page={page}
                                        section={section}
                                        loading="lazy"
                                        sizes="(max-width: 768px) 85vw, 400px"
                                    />
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className={`hidden lg:grid lg:grid-cols-3 gap-8 ${isLoading ? 'min-h-[28rem]' : ''}`}>
                    {isLoading
                        ? [0, 1, 2].map((i) => (
                            <div key={i} className="rounded-xl overflow-hidden animate-pulse">
                                <div className="bg-slate-200 dark:bg-slate-700 aspect-square w-full" />
                                <div className="p-5 space-y-2 bg-white dark:bg-surface-dark">
                                    <div className="bg-slate-200 dark:bg-slate-700 h-5 rounded w-3/4" />
                                    <div className="bg-slate-200 dark:bg-slate-700 h-4 rounded w-1/2" />
                                </div>
                            </div>
                        ))
                        : items.map((project, idx) => (
                            <ReferenceCard
                                key={project.id || idx}
                                {...project}
                                language={language}
                                forceSquare={true}
                                data={project.data}
                                page={page}
                                section={section}
                                loading="lazy"
                                sizes="(max-width: 1024px) 45vw, 30vw"
                            />
                        ))
                    }
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
