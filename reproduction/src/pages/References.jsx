import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { references } from '../data/references';

import { useScrollReveal } from '../hooks/useScrollReveal';

const References = () => {
    const { language } = useLanguage();
    useScrollReveal();
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
                        {filteredProjects.map((project) => (
                            <Link
                                key={project.id}
                                to={`/referenzen/${project.id}`}
                                className="group relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 transition-all duration-500 break-inside-avoid mb-8 block shadow-sm hover:shadow-2xl reveal"
                            >
                                <img
                                    alt={project.title}
                                    className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${project.tall ? 'aspect-[3/5]' : 'aspect-square'
                                        }`}
                                    src={project.image}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:bg-primary/70 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[1px] flex flex-col justify-end p-8 text-white">
                                    <span className="text-[10px] uppercase tracking-widest mb-2 opacity-100 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                        {project.location}
                                    </span>
                                    <h3 className="font-serif text-2xl mb-1 opacity-100 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-200">
                                        {project.title}
                                    </h3>
                                    <p className="text-xs opacity-100 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-300 line-clamp-2">
                                        {project.description}
                                    </p>

                                    <div className="mt-4 opacity-100 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-400">
                                        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border-b border-white/40 pb-1">
                                            {language === 'DE' ? 'Projekt ansehen' : 'Voir le projet'}
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </span>
                                    </div>
                                </div>
                            </Link>
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
