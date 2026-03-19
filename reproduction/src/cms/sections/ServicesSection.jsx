import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useServiceCardsEntrance } from '@/cms/hooks/useServiceCardsEntrance';
import { useSoftEntrance } from '@/cms/hooks/useSoftEntrance';
import BaumpflegeIcon from '@/cms/components/icons/BaumpflegeIcon';
import BaumfaellungIcon from '@/cms/components/icons/BaumfaellungIcon';
import GartenpflegeIcon from '@/cms/components/icons/GartenpflegeIcon';
import BepflanzungIcon from '@/cms/components/icons/BepflanzungIcon';

const ServiceCardInternal = ({ title, description, icon, href, image, ctaLabel, iconVariant = 'outline' }) => {
    const IconComponent = () => {
        switch (icon) {
            case 'BaumpflegeIcon': return <BaumpflegeIcon variant={iconVariant} className="w-6 h-6" />;
            case 'BaumfaellungIcon': return <BaumfaellungIcon variant={iconVariant} className="w-6 h-6" />;
            case 'GartenpflegeIcon': return <GartenpflegeIcon variant={iconVariant} className="w-6 h-6" />;
            case 'BepflanzungIcon': return <BepflanzungIcon variant={iconVariant} className="w-6 h-6" />;
            default: return null;
        }
    };

    return (
        <div className="expert-card-anim h-full">
            <Link
                to={href || '#'}
                className="group relative bg-white dark:bg-surface-dark rounded-[2rem] p-8 md:p-10 hover:-translate-y-2 transition-transform duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full"
            >
                {/* Visual enhancement: Show service image if available, else show gradient blob */}
                {image ? (
                    <div className="absolute inset-x-0 bottom-0 top-1/2 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
                         <img src={image} className="w-full h-full object-cover grayscale" alt="" />
                    </div>
                ) : (
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-primary/10 transition-colors duration-500"></div>
                )}
                
                <div className="relative z-10 flex flex-col flex-grow">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-6 text-[#3E5F25] group-hover:bg-[#3E5F25] group-hover:text-white transition-all duration-300">
                        <IconComponent />
                    </div>
                    <h3 className="text-2xl font-serif text-primary mb-4 group-hover:text-[#3E5F25] dark:group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-slate-600 dark:text-slate-400 text-[0.9375rem] leading-relaxed font-sans mb-8 flex-grow">
                            {description}
                        </p>
                    )}
                    <div className="flex items-center text-primary font-bold text-xs tracking-[0.15em] uppercase mt-auto">
                        <span>
                            {ctaLabel}
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
};

const ServicesSection = ({ 
    label,
    title,
    ctaLabel = '',
    iconVariant = 'outline',
    getServiceHref,
    page = 'Home',
    section = 'ServicesSection',

    // Use aligned sX_ prefixing to match ServicesBlocksSection
    s1_title, s1_description, s1_icon = 'BaumpflegeIcon', s1_id = 'baumpflege', s1_image,
    s2_title, s2_description, s2_icon = 'BaumfaellungIcon', s2_id = 'baumfaellung', s2_image,
    s3_title, s3_description, s3_icon = 'GartenpflegeIcon', s3_id = 'gartenpflege', s3_image,
    s4_title, s4_description, s4_icon = 'BepflanzungIcon', s4_id = 'bepflanzung', s4_image,
}) => {

    const sectionRef = useRef(null);
    const cardsRef = useRef(null);
    useSoftEntrance(sectionRef);
    useServiceCardsEntrance(cardsRef);

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
                    <span className="text-[#9bb221] font-bold tracking-widest uppercase text-xs">{label}</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">{title}</h2>
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
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
