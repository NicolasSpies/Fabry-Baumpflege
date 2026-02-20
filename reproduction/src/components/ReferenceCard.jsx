import React from 'react';
import { Link } from 'react-router-dom';

const ReferenceCard = ({ project, language, forceSquare = false }) => {
    return (
        <Link
            to={`/referenzen/${project.id}`}
            className="group relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 transition-all duration-500 break-inside-avoid mb-8 block shadow-sm hover:shadow-2xl reveal"
        >
            <img
                alt={project.title}
                className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${forceSquare ? 'aspect-square' : (project.tall ? 'aspect-[3/5]' : 'aspect-square')
                    }`}
                src={project.thumbnailImage}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:bg-primary/70 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[1px] flex flex-col justify-end p-8 text-white">
                <span className="text-[10px] uppercase tracking-widest mb-2 opacity-100 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    {project.location}
                </span>
                <h3 className="font-serif text-2xl mb-1 opacity-100 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-200">
                    {language === 'DE' ? project.title : project.titleFR}
                </h3>
                <p className="text-xs opacity-100 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-300 line-clamp-2">
                    {language === 'DE' ? project.description : project.descriptionFR}
                </p>

                <div className="mt-4 opacity-100 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-400">
                    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border-b border-white/40 pb-1">
                        {language === 'DE' ? 'Projekt ansehen' : 'Voir le projet'}
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default ReferenceCard;
