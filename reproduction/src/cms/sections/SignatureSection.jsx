import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/cms/components/ui/Icon';


const SignatureSection = ({ 
    title,
    name,
    label = "Ihr Partner für die Natur", 
    cta = "Jetzt anfragen", 
    ctaHref = "/kontakt" 
}) => {

return (
        <section className="py-32 bg-surface-light dark:bg-surface-dark/30 border-t border-slate-100 dark:border-slate-800">
            <div className="max-w-4xl mx-auto px-6 text-center reveal">
                <h2 className="text-4xl md:text-5xl font-serif text-primary mb-12">
                    {title}
                </h2>
                <div className="mb-16 reveal stagger-1">
                    <p className="text-primary font-signature text-5xl md:text-8xl select-none leading-none whitespace-nowrap">
                        {name}
                    </p>
                    <p className="text-[10px] tracking-[0.4em] uppercase text-slate-400 mt-6 font-bold">
                        {label}
                    </p>
                </div>
                <Link
                    to={ctaHref}
                    className="inline-flex items-center gap-4 bg-primary text-white px-12 py-5 rounded-full text-lg font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all group shadow-xl reveal stagger-2"
                >
                    {cta}
                    <Icon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </section>
    );
};

export default SignatureSection;
