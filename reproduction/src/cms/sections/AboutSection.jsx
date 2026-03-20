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
    useParallax(expertiseImgRef, { speed: 0.04, maxTravel: 20, scale: 1.1 });
    const isExternalCta = isExternalHref(ctaHref);

    return (
        <section className="py-24 px-6 overflow-hidden bg-white dark:bg-surface-dark/50" id="about">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    <div className="w-full lg:w-1/2 relative">
                        <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -z-10" />
                        <div className="relative rounded-2xl overflow-hidden shadow-lg md:shadow-2xl group">
                            <CmsImage
                                image={image}
                                ref={expertiseImgRef}
                                alt=""
                                className="w-full h-[650px] object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-10 flex items-end">
                                <div className="text-white italic font-serif text-2xl border-l-4 border-primary pl-4 drop-shadow-lg">
                                    <CmsText text={quote} className="space-y-2" paragraphClassName="leading-snug" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 space-y-10">
                        <div className="space-y-4">
                            <span className="text-[#9bb221] font-bold tracking-widest uppercase text-xs block">{label}</span>
                            <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight reveal">{title}</h2>
                        </div>
                        <CmsText
                            text={description}
                            className="space-y-4 text-slate-700 dark:text-slate-300 font-sans"
                            paragraphClassName="text-base leading-[1.8]"
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
