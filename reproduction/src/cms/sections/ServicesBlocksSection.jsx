import React, { useRef } from 'react';
import BaumpflegeIcon from '@/cms/components/icons/BaumpflegeIcon';
import BaumfaellungIcon from '@/cms/components/icons/BaumfaellungIcon';
import GartenpflegeIcon from '@/cms/components/icons/GartenpflegeIcon';
import BepflanzungIcon from '@/cms/components/icons/BepflanzungIcon';
import { useParallax } from '@/cms/hooks/useParallax';
import Icon from '@/cms/components/ui/Icon';

const ServiceImage = ({ src, alt }) => {
    const ref = useRef(null);
    useParallax(ref, { speed: 0.04, maxTravel: 20, scale: 1.1 });
    return (
        <img
            ref={ref}
            alt={alt}
            className="w-full h-full object-cover"
            src={src}
        />
    );
};

const ServiceBlockInternal = ({ id, title, description, list, image, reverse, bg }) => {
    const IconComponent = () => {
        switch (id) {
            case 'baumpflege': return <BaumpflegeIcon variant="outline" className="w-16 h-16 text-primary" />;
            case 'baumfaellung': return <BaumfaellungIcon variant="outline" className="w-16 h-16 text-primary" />;
            case 'gartenpflege': return <GartenpflegeIcon variant="outline" className="w-16 h-16 text-primary" />;
            case 'bepflanzung': return <BepflanzungIcon variant="outline" className="w-16 h-16 text-primary" />;
            default: return <Icon name="info" className="text-primary text-6xl font-light" />;
        }
    };

    return (
        <section
            id={id}
            className={`py-32 px-6 overflow-hidden ${bg ? 'bg-surface-light/50 dark:bg-surface-dark/20' : ''}`}
        >
            <div className="max-w-7xl mx-auto">
                <div className={`flex flex-col lg:flex-row items-center gap-16 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
                    <div className="w-full lg:w-1/2">
                        <div className="relative rounded-xl overflow-hidden shadow-2xl reveal h-[500px]">
                            <ServiceImage src={image} alt={title} />
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 space-y-8 reveal stagger-1">
                        <div className="space-y-6">
                            <IconComponent />
                            <h2 className="text-4xl font-serif text-primary leading-tight font-medium">
                                {title}
                            </h2>
                        </div>
                        {description && (
                            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                                {description}
                            </p>
                        )}
                        <ul className="space-y-4">
                            {(list || []).map((feature, fIdx) => {
                                const text = typeof feature === 'object' ? (feature?.text || feature?.label || '') : feature;
                                if (!text) return null;
                                return (
                                    <li key={fIdx} className="flex items-start gap-3">
                                        <Icon name="check" className="text-[#9bb221] mt-1 shrink-0" />
                                        <span className="text-slate-600 dark:text-slate-400 leading-relaxed">{text}</span>
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
            <ServiceBlockInternal id="baumpflege" title={s1_title} description={s1_description} list={s1_list} image={s1_image} />
            <ServiceBlockInternal id="baumfaellung" title={s2_title} description={s2_description} list={s2_list} image={s2_image} reverse />
            <ServiceBlockInternal id="gartenpflege" title={s3_title} description={s3_description} list={s3_list} image={s3_image} />
            <ServiceBlockInternal id="bepflanzung" title={s4_title} description={s4_description} list={s4_list} image={s4_image} reverse bg />
        </>
    );
};

export default ServicesBlocksSection;
