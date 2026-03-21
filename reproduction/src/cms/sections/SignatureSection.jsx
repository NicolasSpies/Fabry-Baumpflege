import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/cms/components/ui/Icon';
import { renderCmsInline } from '@/cms/components/ui/CmsText';
import { isExternalHref } from '@/cms/bridge-resolver';


const SignatureSection = ({ 
    title,
    name,
    label = "Ihr Partner für die Natur", 
    cta = "Jetzt anfragen", 
    ctaHref = "/kontakt" 
}) => {
const isExternalCta = isExternalHref(ctaHref);

return (
        <section className="py-14 md:py-32 bg-primary/[0.035] dark:bg-surface-dark/30 border-y border-slate-100 dark:border-slate-800">
            <div className="max-w-4xl mx-auto px-6 text-center reveal">
                <h2 className="text-[2rem] md:text-5xl font-serif text-primary mb-6 md:mb-12">
                    {renderCmsInline(title)}
                </h2>
                <div className="mb-8 md:mb-16 reveal stagger-1">
                    <p className="text-primary font-signature text-[3rem] sm:text-[4.25rem] md:text-8xl select-none leading-none whitespace-normal md:whitespace-nowrap">
                        {renderCmsInline(name)}
                    </p>
                    <p className="text-[10px] tracking-[0.3em] md:tracking-[0.4em] uppercase text-muted-accessible mt-3 md:mt-6 font-bold">
                        {renderCmsInline(label)}
                    </p>
                </div>
                {isExternalCta ? (
                    <a
                        href={ctaHref}
                        className="inline-flex items-center gap-3 md:gap-4 bg-primary text-white px-9 md:px-12 py-3.5 md:py-5 rounded-full text-[0.95rem] md:text-lg font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all group shadow-md md:shadow-xl reveal stagger-2"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {cta}
                        <Icon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
                    </a>
                ) : (
                    <Link
                        to={ctaHref}
                        className="inline-flex items-center gap-3 md:gap-4 bg-primary text-white px-9 md:px-12 py-3.5 md:py-5 rounded-full text-[0.95rem] md:text-lg font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all group shadow-md md:shadow-xl reveal stagger-2"
                    >
                        {cta}
                        <Icon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>
        </section>
    );
};

export default SignatureSection;
