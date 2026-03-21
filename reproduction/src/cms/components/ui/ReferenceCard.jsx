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
    animateEntry, staggerIndex, forceSquare, compactMobileOverlay = false, 
    language, data, page = 'Home', section = 'ReferencesSection', loading 
}) => {
    const props = resolveInstanceProps(page, `${section}/ReferenceCard`, {
        id, slug, path, title, description, location, thumbnailImage, loading
    }, data);


    const { t } = useLanguage();
    const detailPath = props.path || `${ROUTES[language].referenceDetail.split('/:')[0]}/${props.slug || props.id}`;
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

    return (
        <Link
            ref={linkRef}
            to={detailPath}
            onMouseEnter={prefetchDetail}
            onFocus={prefetchDetail}
            className={`group relative rounded-2xl bg-white dark:bg-slate-800 block shadow-sm md:shadow-md md:hover:shadow-xl transition-[box-shadow] duration-500 overflow-hidden ${animateEntry ? 'animate-entrance' : ''}`}
            style={animateEntry ? { animationDelay: `${staggerIndex * 0.1}s` } : {}}
        >
            <div className={`relative w-full overflow-hidden ${forceSquare ? 'aspect-square' : 'aspect-[4/5] sm:aspect-square'}`}>
                <CmsImage
                    image={props.thumbnailImage}
                    alt={props.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw"
                    loading={props.loading || 'lazy'}
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:bg-primary/70 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end text-white ${compactMobileOverlay ? 'p-4 md:p-8' : 'p-8'}`} style={{ willChange: 'opacity' }}>
                    <div className={`mb-3 flex flex-wrap gap-x-3 gap-y-1 opacity-100 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-[opacity,transform] duration-500 delay-100`}>
                        {props.categories && props.categories.length > 0 && (
                            <span className={`uppercase tracking-widest font-bold text-white/90 ${compactMobileOverlay ? 'text-[8.5px] md:text-[9.5px]' : 'text-[9.5px]'}`}>
                                {props.categories.join(', ')}
                            </span>
                        )}
                        {props.location && (
                            <>
                                {props.categories && props.categories.length > 0 && (
                                    <span className="w-0.5 h-2.5 bg-white/20 self-center hidden md:block" />
                                )}
                                <span className={`uppercase tracking-widest font-normal text-white/70 ${compactMobileOverlay ? 'text-[8.5px] md:text-[9.5px]' : 'text-[9.5px]'}`}>
                                    {props.location}
                                </span>
                            </>
                        )}
                    </div>

                    <h3 className={`font-serif mb-1 opacity-100 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-[opacity,transform] duration-500 delay-200 ${compactMobileOverlay ? 'text-lg md:text-2xl' : 'text-2xl'}`}>
                        {renderCmsInline(props.title)}
                    </h3>
                    <p className={`text-xs opacity-100 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-[opacity,transform] duration-500 delay-300 line-clamp-2 ${compactMobileOverlay ? 'hidden md:block' : ''}`}>
                        {renderCmsInline(props.description)}
                    </p>

                    <div className={`mt-4 opacity-100 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-2 group-hover:translate-y-0 transition-[opacity,transform] duration-500 delay-400 ${compactMobileOverlay ? 'hidden md:block' : ''}`}>
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
