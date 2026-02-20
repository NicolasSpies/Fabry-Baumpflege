import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/useLanguage';
import { references } from '../data/references';
import ReferenceCard from '../components/ReferenceCard';

import { useScrollReveal } from '../hooks/useScrollReveal';

const References = () => {
    const { language } = useLanguage();
    const [activeFilter, setActiveFilter] = useState('Alle');

    const filters = [
        { DE: 'Alle', FR: 'Tous' },
        { DE: 'Baumpflege', FR: 'Arboriculture' },
        { DE: 'Baumfällung', FR: 'Abattage' },
        { DE: 'Gartenbau', FR: 'Horticulture' },
        { DE: 'Pflanzung', FR: 'Plantation' }
    ];

    const filteredProjects = activeFilter === 'Alle' || activeFilter === 'Tous'
        ? references
        : references.filter(p => p.categories?.includes(activeFilter));

    const [hasAnimated, setHasAnimated] = useState(false);
    const [isInitialRender, setIsInitialRender] = useState(true);

    useEffect(() => {
        // Only run stagger on initial mount
        const timer = setTimeout(() => {
            setIsInitialRender(false);
            setHasAnimated(true);
        }, 1500); // Sufficient time for staggered entrance to complete
        return () => clearTimeout(timer);
    }, []);

    // We no longer use useScrollReveal here to prevent visibility bugs
    // useScrollReveal([activeFilter]);

    return (
        <main className="pt-28">
            <section className="pt-8 pb-8 px-6 text-center">
                <div className="max-w-7xl mx-auto text-center space-y-6">
                    <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
                        {language === 'DE'
                            ? 'Entdecke eine Auswahl meiner Arbeiten. Von präziser Baumpflege bis hin zu komplexen Fällungen und hochwertiger Gartengestaltung.'
                            : 'Découvrez une sélection de nos travaux. De l\'arboriculture précise aux abattages complexes et à l\'aménagement paysager de haute qualité.'}
                    </p>
                </div>
            </section>

            <section className="sticky top-20 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-y border-slate-100 dark:border-slate-800 mb-8">
                <div className="max-w-7xl mx-auto px-6 py-4 overflow-x-auto">
                    <div className="flex items-center justify-center min-w-max gap-4 md:gap-8">
                        {filters.map((f) => (
                            <button
                                key={f.DE}
                                onClick={() => setActiveFilter(f.DE)}
                                className={`px-6 py-2 rounded-full text-sm font-medium uppercase tracking-widest transition-all ${activeFilter === f.DE
                                    ? 'bg-[#2a411a] text-white shadow-lg'
                                    : 'text-slate-500 hover:text-primary border border-transparent hover:border-primary/20'
                                    }`}
                            >
                                {f[language]}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        {filteredProjects.map((project, index) => (
                            <ReferenceCard
                                key={project.id}
                                project={project}
                                language={language}
                                animateEntry={isInitialRender}
                                staggerIndex={index}
                            />
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <button className="inline-flex items-center gap-3 px-12 py-4 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300">
                            {language === 'DE' ? 'Mehr Projekte laden' : 'Charger plus de projets'}
                            <span className="material-symbols-outlined">refresh</span>
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default References;
