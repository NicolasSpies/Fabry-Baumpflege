import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useParallax } from '@/cms/hooks/useParallax';
import Icon from '@/cms/components/ui/Icon';
import CmsImage from '@/cms/components/ui/CmsImage';
import CmsText from '@/cms/components/ui/CmsText';
import { isExternalHref } from '@/cms/bridge-resolver';


const AboutSection = ({ 
    label,
    title,
    description,
    quote,
    cta,
    image, 
    ctaHref 
}) => {

const expertiseImgRef = useRef(null);
    useParallax(expertiseImgRef, { 
        speed: 0.12, 
        maxTravel: 60, 
        scale: 1.25,
        desktopOnly: true 
    });
    const isExternalCta = isExternalHref(ctaHref);

    return (
        <section className="py-24 px-6 overflow-hidden bg-white dark:bg-surface-dark/50" id="about" style={{ minHeight: '600px' }}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 md:mb-20 space-y-4">
                    <span className="text-accent-label font-bold tracking-widest uppercase text-xs block">{label}</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-primary leading-[1.15] md:leading-tight reveal mx-auto max-w-3xl">{title}</h2>
                </div>
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    <div className="w-full lg:w-1/2 relative">
                        <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -z-10" />
                        <div className="relative rounded-2xl overflow-hidden shadow-lg md:shadow-2xl group">
                            <CmsImage
                                image={image}
                                ref={expertiseImgRef}
                                alt=""
                                size="768"
                                className="w-full aspect-square object-cover"
                                sizes="(max-width: 768px) 85vw, 33vw"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-10 flex items-end">
                                <div className="text-white italic font-serif text-2xl border-l-4 border-primary pl-4 drop-shadow-lg">
                                    <CmsText text={quote} className="space-y-2" paragraphClassName="leading-snug" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 space-y-8">
                        <CmsText
                            text={description}
                            className="space-y-4 text-slate-600 font-sans"
                            paragraphClassName="text-[0.875rem] md:text-[1.05rem] leading-[1.5] md:leading-[1.7]"
                        />
                        <div className="pt-4">
                            {isExternalCta ? (
                                <a
                                    href={ctaHref}
                                    className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all group border-b border-primary/30 pb-1 hover:border-primary"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {cta}
                                    <Icon name="arrow_forward" className="text-lg group-hover:translate-x-1 transition-transform" />
                                </a>
                            ) : (
                                <Link
                                    to={ctaHref}
                                    className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all group border-b border-primary/30 pb-1 hover:border-primary"
                                >
                                    {cta}
                                    <Icon name="arrow_forward" className="text-lg group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
