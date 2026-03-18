import React, { useRef } from 'react';
import { useParallax } from '@/cms/hooks/useParallax';

const ParallaxImage = ({ src, alt, className = "", speed = 0.04, maxTravel = 24 }) => {
    const ref = useRef(null);
    useParallax(ref, { speed, maxTravel, scale: 1.15 });
    return (
        <img
            ref={ref}
            alt={alt}
            className={`w-full h-full object-cover ${className}`}
            src={src}
        />
    );
};

import { resolveInstanceProps } from '@/cms/bridge-resolver';
 
 const ValueItem = ({ title, text, image, offset, idx, data, page = 'AboutMe', section = 'ValuesSection' }) => {
    const props = resolveInstanceProps(page, `${section}/ValueItem`, { title, text, image }, data);
 
    return (
        <div className={`space-y-6 group ${offset ? 'md:mt-24 reveal stagger-1' : ''}`}>
            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-slate-100 shadow-xl">
                <ParallaxImage
                    src={props.image}
                    alt={props.title}
                    speed={idx === 1 ? 0.06 : idx === 2 ? 0.10 : 0.02}
                    maxTravel={idx === 1 ? 40 : idx === 2 ? 60 : 20}
                    className="grayscale hover:grayscale-0 transition-opacity duration-700 scale-[1.05]"
                />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-serif text-primary">
                    {props.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {props.text}
                </p>
            </div>
        </div>
    );
 };

export default ValueItem;
