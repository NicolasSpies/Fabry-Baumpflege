import React, { useRef, useState, useEffect } from 'react';
import ReferenceCard from '@/cms/components/ui/ReferenceCard';


const ReferencesSection = ({ 
    label = "Referenzen", 
    title = "Unsere Projekte", 
    view_all = "Alle Projekte ansehen", 
    items = [], 
    language = "de", 
    allRefsHref = "/referenzen", 
    isLoading,
    page = 'Home', 
    section = 'ReferencesSection'
}) => {

    return (
        <section className="py-24 px-6 bg-white dark:bg-surface-dark/50" id="references-preview">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20 space-y-4">
                    <span className="text-[#9bb221] font-bold tracking-widest uppercase text-xs">{label}</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-primary reveal">{title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        <div className="col-span-3 flex justify-center py-12">
                            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                        </div>
                    ) : items.map((project, idx) => (
                        <ReferenceCard 
                            key={project.id || idx} 
                            {...project} 
                            language={language} 
                            forceSquare={true} 
                            data={project.data} 
                            page={page}
                            section={section}
                        />
                    ))}
                </div>
                {view_all && allRefsHref && (
                    <div className="text-center mt-16">
                        <a
                            href={allRefsHref}
                            className="inline-flex items-center gap-3 px-10 py-4 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 text-sm uppercase tracking-widest"
                        >
                            {view_all}
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ReferencesSection;
