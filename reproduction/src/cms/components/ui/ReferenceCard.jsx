import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/cms/i18n/routes';
import { useLanguage } from '@/cms/i18n/useLanguage';
import { resolveInstanceProps } from '@/cms/bridge-resolver';
import { prefetchReferenceDetail } from '@/cms/lib/cms';
import Icon from '@/cms/components/ui/Icon';
import CmsImage from '@/cms/components/ui/CmsImage';
import { renderCmsInline } from '@/cms/components/ui/CmsText';

const preloadReferenceDetailPage = () => import('@/cms/pages/ReferenceDetail');

/**
 * Reusable Reference Card Component.
 */
const ReferenceCard = ({ 
    id, slug, path, title, description, location, thumbnailImage, 
    animateEntry, staggerIndex,
    language, data, page = 'Home', section = 'ReferencesSection', loading 
}) => {
    const props = resolveInstanceProps(page, `${section}/ReferenceCard`, {
        id, slug, path, title, description, location, thumbnailImage, loading
    }, data);


    const { t } = useLanguage();
    const detailPath = props.path || `${ROUTES[language || 'DE'].referenceDetail.split('/:')[0]}/${props.slug || props.id}`;
    const linkRef = useRef(null);
    const hasPrefetchedRef = useRef(false);

    const prefetchDetail = () => {
        if (hasPrefetchedRef.current) return;
        // Skip prefetch on low-end or touch-primary devices if needed, 
        // but for now we'll just keep it manual (focus/hover)
        hasPrefetchedRef.current = true;
        preloadReferenceDetailPage();
        prefetchReferenceDetail(props.slug || props.id, language);
    };

    // Removed visibility-based prefetch to save mobile bandwidth.
    // Prefetch now only happens on explicit intent (hover/focus).

    // ... hydration logic ...

    return (
        <Link
            ref={linkRef}
            to={detailPath}
            state={{ 
                preview: {
                    title: props.title,
                    categoryLabel: props.categories && props.categories.length > 0 ? props.categories[0] : '',
                    image: props.thumbnailImage
                }
            }}
            onMouseEnter={prefetchDetail}
            onFocus={prefetchDetail}
            className={`group relative rounded-2xl block shadow-md md:shadow-lg md:hover:shadow-2xl md:hover:-translate-y-1 transition-all duration-500 overflow-hidden ${animateEntry ? 'animate-entrance' : ''}`}
            style={animateEntry ? { animationDelay: `${staggerIndex * 0.1}s` } : {}}
        >
            <div className={`relative w-full overflow-hidden aspect-square md:aspect-[4/5] lg:aspect-square bg-slate-100 dark:bg-slate-900`}>
                <CmsImage
                    image={props.thumbnailImage}
                    alt={props.title}
                    size="768"
                    className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110"
                    sizes={props.sizes || "(max-width: 768px) 85vw, 33vw"}
                    loading={props.loading || 'lazy'}
                    maxWidth={768}
                />
                
                {/* Unified Overlay System */}
                <div 
                    className={`absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white transition-all duration-500
                        /* Subtle dark gradient overlay used for both mobile default and desktop hover */
                        bg-gradient-to-t from-black/90 via-black/20 to-transparent
                        /* Mobile: Static visible */
                        opacity-100
                        /* Desktop: Hidden by default, Visible on hover */
                        md:opacity-0 md:group-hover:opacity-100
                    `}
                >
                    <div className="mb-2 md:mb-3 flex flex-wrap gap-x-3 gap-y-1 transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 delay-100">
                        {props.categories && props.categories.length > 0 && (
                            <span className="uppercase tracking-widest font-bold text-[9px] md:text-[9.5px] text-white/90">
                                {props.categories.join(', ')}
                            </span>
                        )}
                        {props.location && (
                            <>
                                <span className="w-0.5 h-2.5 bg-white/20 self-center" />
                                <span className="uppercase tracking-widest font-normal text-[9px] md:text-[9.5px] text-white/70">
                                    {props.location}
                                </span>
                            </>
                        )}
                    </div>
                    
                    <h3 className="font-serif text-xl md:text-2xl mb-1 transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 delay-200 leading-tight">
                        {renderCmsInline(props.title)}
                    </h3>
                    
                    <p className="text-[12px] md:text-xs line-clamp-2 opacity-90 md:opacity-0 md:group-hover:opacity-100 transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-all duration-500 delay-300 mb-4 md:mb-0">
                        {renderCmsInline(props.description)}
                    </p>
                    
                    <div className="mt-2 md:mt-4 transform translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 transition-transform duration-500 delay-400">
                        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border-b border-white/40 pb-1">
                            {t('expertise.learn_more')}
                            <Icon name="arrow_forward" className="text-sm" />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ReferenceCard;
