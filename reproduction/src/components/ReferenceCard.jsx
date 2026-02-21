import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../i18n/routes';
import { useLanguage } from '../i18n/useLanguage';

const ReferenceCard = ({ project, language, forceSquare = false, animateEntry = false, staggerIndex = 0 }) => {
    const { t } = useLanguage();

    // Construct the localized path for the reference detail page
    const detailBase = ROUTES[language].referenceDetail.split('/:')[0];
    const detailPath = `${detailBase}/${project.id}`; // project.id is actually the slug here

    return (
        <Link
            to={detailPath}
            className={`group relative rounded-2xl bg-white dark:bg-slate-800 break-inside-avoid mb-8 block shadow-sm hover:shadow-2xl transition-shadow duration-500 ${animateEntry ? 'animate-entrance' : ''}`}
            style={animateEntry ? { animationDelay: `${staggerIndex * 0.1}s` } : {}}
        >
            {/* Inner wrapper: handles rounded corners and image clipping — Safari-safe */}
            <div className="relative w-full rounded-2xl overflow-hidden backface-hidden" style={{ transform: 'translateZ(0)' }}>
                <img
                    alt={project.title}
                    className={`w-full object-cover scale-[1.05] transition-transform duration-700 group-hover:scale-[1.15] ${forceSquare ? 'aspect-square' : (project.tall ? 'aspect-[3/5]' : 'aspect-square')
                        }`}
                    style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                    src={project.thumbnailImage}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:bg-primary/70 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 text-white" style={{ willChange: 'opacity' }}>
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
                            {t('expertise.learn_more')}
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </span>
                    </div>
                </div>
            </div>

        </Link>
    );
};

export default ReferenceCard;
