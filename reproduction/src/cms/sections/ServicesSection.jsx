import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useServiceCardsEntrance } from '@/cms/hooks/useServiceCardsEntrance';
import { useSoftEntrance } from '@/cms/hooks/useSoftEntrance';
import BaumpflegeIcon from '@/cms/components/icons/BaumpflegeIcon';
import BaumfaellungIcon from '@/cms/components/icons/BaumfaellungIcon';
import GartenpflegeIcon from '@/cms/components/icons/GartenpflegeIcon';
import BepflanzungIcon from '@/cms/components/icons/BepflanzungIcon';
import CmsImage from '@/cms/components/ui/CmsImage';
import Icon from '@/cms/components/ui/Icon';
import CmsText, { renderCmsInline } from '@/cms/components/ui/CmsText';
import { isExternalHref } from '@/cms/bridge-resolver';

function renderServiceIcon(icon, iconVariant) {
    switch (icon) {
        case 'BaumpflegeIcon': return <BaumpflegeIcon variant={iconVariant} className="w-6 h-6" />;
        case 'BaumfaellungIcon': return <BaumfaellungIcon variant={iconVariant} className="w-6 h-6" />;
        case 'GartenpflegeIcon': return <GartenpflegeIcon variant={iconVariant} className="w-6 h-6" />;
        case 'BepflanzungIcon': return <BepflanzungIcon variant={iconVariant} className="w-6 h-6" />;
        default: return null;
    }
}

const ServiceCardInternal = ({ title, description, icon, href, image, ctaLabel, iconVariant = 'outline', isActive = false, cardRef = null }) => {
    const isExternal = isExternalHref(href);
    const activeState = isActive
        ? 'shadow-xl shadow-slate-200/60 -translate-y-2'
        : '';
    const imageState = isActive
        ? 'opacity-10'
        : 'opacity-0';
    const titleState = isActive
        ? 'text-[#395824]'
        : '';
    const iconContainerState = isActive
        ? 'bg-[#395824] text-white'
        : 'bg-slate-100 dark:bg-slate-800/50 text-[#395824]';

    const cardClassName = `group relative bg-white dark:bg-surface-dark rounded-[2rem] p-8 md:p-10 transition-[transform,box-shadow] duration-500 shadow-lg md:shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full md:hover:-translate-y-2 md:hover:shadow-xl md:hover:shadow-slate-200/60 ${activeState}`;

    const cardInner = (
        <>
                {/* Visual enhancement: Show service image if available, else show gradient blob */}
                {image ? (
                    <div className={`absolute inset-x-0 bottom-0 top-1/2 transition-opacity duration-700 ${imageState} md:opacity-0 md:group-hover:opacity-10`}>
                         <CmsImage image={image} className="w-full h-full object-cover grayscale" alt="" sizes="(max-width: 1024px) 100vw, 25vw" loading="lazy" />
                    </div>
                ) : (
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 transition-colors duration-500 ${isActive ? 'bg-primary/10' : ''} md:group-hover:bg-primary/10`}></div>
                )}
                
                <div className="relative z-10 flex flex-col flex-grow">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${iconContainerState} md:group-hover:bg-[#395824] md:group-hover:text-white`}>
                        {renderServiceIcon(icon, iconVariant)}
                    </div>
                    <h3 className={`text-2xl font-serif text-primary mb-4 transition-colors ${titleState} md:group-hover:text-[#395824]`}>
                        {renderCmsInline(title)}
                    </h3>
                    {description && (
                        <CmsText
                            text={description}
                            className="mb-8 flex-grow space-y-3 text-slate-600 dark:text-slate-400 font-sans"
                            paragraphClassName="text-[0.9375rem] leading-relaxed"
                        />
                    )}
                    <div className="flex items-center text-accent-label font-bold text-xs tracking-[0.15em] uppercase mt-auto">
                        <span>
                            {ctaLabel}
                        </span>
                    </div>
                </div>
        </>
    );

    return (
        <div ref={cardRef} className="expert-card-anim h-full">
            {isExternal ? (
                <a
                    href={href || '#'}
                    className={cardClassName}
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noreferrer' : undefined}
                >
                    {cardInner}
                </a>
            ) : (
                <Link
                    to={href || '#'}
                    className={cardClassName}
                >
                    {cardInner}
                </Link>
            )}
        </div>
    );
};

const ServicesSection = ({ 
    label,
    title,
    ctaLabel = '',
    viewAllLabel = '',
    allServicesHref = '',
    iconVariant = 'outline',
    getServiceHref,
    // Use aligned sX_ prefixing to match ServicesBlocksSection
    s1_title, s1_description, s1_icon = 'BaumpflegeIcon', s1_id = 'baumpflege', s1_image,
    s2_title, s2_description, s2_icon = 'BaumfaellungIcon', s2_id = 'baumfaellung', s2_image,
    s3_title, s3_description, s3_icon = 'GartenpflegeIcon', s3_id = 'gartenpflege', s3_image,
    s4_title, s4_description, s4_icon = 'BepflanzungIcon', s4_id = 'bepflanzung', s4_image,
}) => {

    const sectionRef = useRef(null);
    const cardsRef = useRef(null);
    const cardNodeRefs = useRef([]);
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
    const [activeMobileIndex, setActiveMobileIndex] = useState(0);
    useSoftEntrance(sectionRef);
    useServiceCardsEntrance(cardsRef);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isMobile || typeof IntersectionObserver === 'undefined') {
            setActiveMobileIndex(0);
            return undefined;
        }

        const nodes = cardNodeRefs.current.filter(Boolean);
        if (!nodes.length) return undefined;

        const ratios = new Map();
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    ratios.set(Number(entry.target.dataset.cardIndex), entry.intersectionRatio);
                });

                let winnerIndex = 0;
                let winnerRatio = 0;
                ratios.forEach((ratio, index) => {
                    if (ratio > winnerRatio) {
                        winnerRatio = ratio;
                        winnerIndex = index;
                    }
                });

                setActiveMobileIndex(winnerIndex);
            },
            {
                threshold: [0.2, 0.35, 0.5, 0.65, 0.8],
                rootMargin: '-12% 0px -12% 0px',
            }
        );

        nodes.forEach((node, index) => {
            node.dataset.cardIndex = String(index);
            observer.observe(node);
        });

        return () => observer.disconnect();
    }, [isMobile]);

    const getHref = (id) => getServiceHref ? getServiceHref(id) : `#${id}`;

    return (
        <section
            ref={sectionRef}
            className="py-24 md:py-32 px-6 bg-white dark:bg-background-dark relative overflow-hidden"
            id="services"
        >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 md:mb-24 space-y-4 soft-entrance-item">
                    <span className="text-accent-label font-bold tracking-widest uppercase text-xs">{renderCmsInline(label)}</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">{renderCmsInline(title)}</h2>
                </div>
                <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-6">
                    <div className="soft-entrance-item">
                        <ServiceCardInternal
                            title={s1_title}
                            description={s1_description}
                            icon={s1_icon}
                            href={getHref(s1_id)}
                            image={s1_image}
                            ctaLabel={ctaLabel}
                            iconVariant={iconVariant}
                            isActive={isMobile && activeMobileIndex === 0}
                            cardRef={(node) => { cardNodeRefs.current[0] = node; }}
                        />
                    </div>
                    <div className="soft-entrance-item">
                        <ServiceCardInternal
                            title={s2_title}
                            description={s2_description}
                            icon={s2_icon}
                            href={getHref(s2_id)}
                            image={s2_image}
                            ctaLabel={ctaLabel}
                            iconVariant={iconVariant}
                            isActive={isMobile && activeMobileIndex === 1}
                            cardRef={(node) => { cardNodeRefs.current[1] = node; }}
                        />
                    </div>
                    <div className="soft-entrance-item">
                        <ServiceCardInternal
                            title={s3_title}
                            description={s3_description}
                            icon={s3_icon}
                            href={getHref(s3_id)}
                            image={s3_image}
                            ctaLabel={ctaLabel}
                            iconVariant={iconVariant}
                            isActive={isMobile && activeMobileIndex === 2}
                            cardRef={(node) => { cardNodeRefs.current[2] = node; }}
                        />
                    </div>
                    <div className="soft-entrance-item">
                        <ServiceCardInternal
                            title={s4_title}
                            description={s4_description}
                            icon={s4_icon}
                            href={getHref(s4_id)}
                            image={s4_image}
                            ctaLabel={ctaLabel}
                            iconVariant={iconVariant}
                            isActive={isMobile && activeMobileIndex === 3}
                            cardRef={(node) => { cardNodeRefs.current[3] = node; }}
                        />
                    </div>
                </div>
                {viewAllLabel && allServicesHref ? (
                    <div className="text-center mt-16">
                        {isExternalHref(allServicesHref) ? (
                            <a
                                href={allServicesHref}
                                className="inline-flex items-center gap-3 px-10 py-4 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 text-sm uppercase tracking-widest"
                                target={allServicesHref.startsWith('http') ? '_blank' : undefined}
                                rel={allServicesHref.startsWith('http') ? 'noreferrer' : undefined}
                            >
                                {renderCmsInline(viewAllLabel)}
                                <Icon name="arrow_forward" className="text-sm" />
                            </a>
                        ) : (
                            <Link
                                to={allServicesHref}
                                className="inline-flex items-center gap-3 px-10 py-4 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 text-sm uppercase tracking-widest"
                            >
                                {renderCmsInline(viewAllLabel)}
                                <Icon name="arrow_forward" className="text-sm" />
                            </Link>
                        )}
                    </div>
                ) : null}
            </div>
        </section>
    );
};

export default ServicesSection;
