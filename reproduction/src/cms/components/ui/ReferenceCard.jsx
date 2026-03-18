import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/cms/i18n/routes';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { resolveInstanceProps } from '@/cms/bridge-resolver';

/**
 * Reusable Reference Card Component.
 */
const ReferenceCard = ({ id, title, description, location, thumbnailImage, animateEntry, staggerIndex, forceSquare, language, data, page = 'Home', section = 'ReferencesSection' }) => {
    const props = resolveInstanceProps(page, `${section}/ReferenceCard`, {
        id, title, description, location, thumbnailImage
    }, data);

    const { t } = useLanguage();
    const detailBase = ROUTES[language].referenceDetail.split('/:')[0];
    const detailPath = `${detailBase}/${id}`; 

    return (
        <Link
            to={detailPath}
            className={`group relative rounded-2xl bg-white dark:bg-slate-800 block shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden ${animateEntry ? 'animate-entrance' : ''}`}
            style={animateEntry ? { animationDelay: `${staggerIndex * 0.1}s` } : {}}
        >
            <div className="relative w-full overflow-hidden aspect-[4/5] sm:aspect-square">
                <img
                    alt={props.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={props.thumbnailImage}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:bg-primary/70 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 text-white" style={{ willChange: 'opacity' }}>
                    <span className="text-[10px] uppercase tracking-widest mb-2 opacity-100 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                        {props.location}
                    </span>
                    <h3 className="font-serif text-2xl mb-1 opacity-100 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-200">
                        {props.title}
                    </h3>
                    <p className="text-xs opacity-100 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-300 line-clamp-2">
                        {props.description}
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
