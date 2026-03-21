import React, { useRef } from 'react';
import BaumpflegeIcon from '@/cms/components/icons/BaumpflegeIcon';
import BaumfaellungIcon from '@/cms/components/icons/BaumfaellungIcon';
import GartenpflegeIcon from '@/cms/components/icons/GartenpflegeIcon';
import BepflanzungIcon from '@/cms/components/icons/BepflanzungIcon';
import { useParallax } from '@/cms/hooks/useParallax';
import Icon from '@/cms/components/ui/Icon';
import CmsImage from '@/cms/components/ui/CmsImage';
import CmsText from '@/cms/components/ui/CmsText';

const ServiceImage = ({ src, alt, priority = false }) => {
    const ref = useRef(null);
    useParallax(ref, { 
        speed: 0.1, 
        maxTravel: 55, 
        scale: 1.18,
        desktopOnly: true 
    });
    return (
        <CmsImage
            image={src}
            ref={ref}
            alt={alt}
            className="w-full h-full object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "low"}
        />
    );
};

const ServiceBlockInternal = ({ id, title, description, list, image, reverse, tone = 'plain', isFirst = false }) => {
    const IconComponent = () => {
        switch (id) {
            case 'baumpflege': return <BaumpflegeIcon variant="outline" className="w-16 h-16 text-primary" />;
            case 'baumfaellung': return <BaumfaellungIcon variant="outline" className="w-16 h-16 text-primary" />;
            case 'gartenpflege': return <GartenpflegeIcon variant="outline" className="w-16 h-16 text-primary" />;
            case 'bepflanzung': return <BepflanzungIcon variant="outline" className="w-16 h-16 text-primary" />;
            default: return <Icon name="info" className="text-primary text-6xl font-light" />;
        }
    };

    const toneClass = tone === 'soft' ? 'md:bg-surface-light md:dark:bg-surface-dark/20 md:border-y md:border-slate-100 md:dark:border-slate-800' : '';
    const mobilePanelClass = 'bg-surface-light border border-slate-100 dark:border-slate-800 shadow-sm';

    return (
        <section
            id={id}
            className={`${isFirst ? 'pt-4 md:pt-14 pb-9 md:pb-28' : 'py-9 md:py-32'} px-4 md:px-6 overflow-hidden ${toneClass}`}
        >
            <div className="max-w-7xl mx-auto">
                <div
                    className={`flex flex-col lg:flex-row items-start lg:items-center gap-8 md:gap-16 lg:gap-20 rounded-[1.75rem] md:rounded-none px-4 py-4 md:p-0 ${mobilePanelClass} md:bg-transparent md:border-0 md:shadow-none ${reverse ? 'lg:flex-row-reverse' : ''}`}
                >
                    <div className="w-full lg:w-1/2">
                        <div className="relative rounded-[1.35rem] md:rounded-xl overflow-hidden shadow-md md:shadow-2xl reveal h-[17.5rem] sm:h-[21rem] md:h-[500px]">
                            <ServiceImage src={image} alt={title} priority={isFirst} />
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 space-y-4 md:space-y-8 lg:space-y-10 reveal stagger-1">
                        <div className="space-y-5 md:space-y-6 lg:space-y-7">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="shrink-0 [&>svg]:w-10 [&>svg]:h-10 md:[&>svg]:w-11 md:[&>svg]:h-11 lg:[&>svg]:w-12 lg:[&>svg]:h-12">
                                    <IconComponent />
                                </div>
                                <h2 className="text-[2.35rem] md:text-[2.85rem] lg:text-4xl font-serif text-primary leading-[0.98] font-medium">
                                    {title}
                                </h2>
                            </div>
                        </div>
                        {description && (
                            <CmsText
                                text={description}
                                className="max-w-[34rem] space-y-3 text-slate-600 dark:text-slate-400"
                                paragraphClassName="text-base leading-relaxed"
                            />
                        )}
                        <ul className="space-y-1.5 md:space-y-2.5 lg:space-y-3 pt-5 md:pt-4 border-t border-primary/10">
                            {(list || []).map((feature, fIdx) => {
                                const text = typeof feature === 'object' ? (feature?.text || feature?.label || '') : feature;
                                if (!text) return null;
                                return (
                                    <li key={fIdx} className="flex items-start gap-2.5 md:gap-3">
                                        <Icon name="check" className="text-accent-label mt-[0.2rem] shrink-0" />
                                        <span className="text-[1rem] md:text-[1.02rem] lg:text-[1.05rem] text-slate-600 dark:text-slate-400 leading-[1.45]">{text}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

const ServicesBlocksSection = ({ 
    s1_title, s1_description, s1_list, s1_image,
    s2_title, s2_description, s2_list, s2_image,
    s3_title, s3_description, s3_list, s3_image,
    s4_title, s4_description, s4_list, s4_image,
}) => {
    return (
        <>
            <ServiceBlockInternal id="baumpflege" title={s1_title} description={s1_description} list={s1_list} image={s1_image} tone="plain" isFirst={true} />
            <ServiceBlockInternal id="baumfaellung" title={s2_title} description={s2_description} list={s2_list} image={s2_image} reverse tone="soft" />
            <ServiceBlockInternal id="gartenpflege" title={s3_title} description={s3_description} list={s3_list} image={s3_image} tone="plain" />
            <ServiceBlockInternal id="bepflanzung" title={s4_title} description={s4_description} list={s4_list} image={s4_image} reverse tone="soft" />
        </>
    );
};

export default ServicesBlocksSection;
