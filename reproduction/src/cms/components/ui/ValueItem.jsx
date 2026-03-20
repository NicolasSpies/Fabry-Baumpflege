import React, { useRef } from 'react';
import { useParallax } from '@/cms/hooks/useParallax';
import CmsImage from '@/cms/components/ui/CmsImage';
import CmsText, { renderCmsInline } from '@/cms/components/ui/CmsText';

import { resolveInstanceProps } from '@/cms/bridge-resolver';
 
 const ValueItem = ({ title, text, image, offset, idx, data, page = 'AboutMe', section = 'ValuesSection' }) => {
    const props = resolveInstanceProps(page, `${section}/ValueItem`, { title, text, image }, data);
    const blockRef = useRef(null);
    const parallaxConfig =
        idx === 1
            ? { speed: 0.05, maxTravel: 32 }
            : idx === 2
                ? { speed: 0.08, maxTravel: 46 }
                : { speed: 0.025, maxTravel: 18 };
    useParallax(blockRef, { ...parallaxConfig, scale: 1 });
 
    return (
        <div ref={blockRef} className={`group ${offset ? 'md:mt-24 reveal stagger-1' : ''}`}>
            <div className="flex items-center gap-4 md:hidden">
                <div className="w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 shadow-sm aspect-square">
                    <CmsImage
                        image={props.image}
                        alt={props.title}
                        className="w-full h-full object-cover"
                        sizes="112px"
                    />
                </div>
                <div className="min-w-0 space-y-1.5">
                    <h3 className="text-[1.1rem] font-serif text-primary">
                        {renderCmsInline(props.title)}
                    </h3>
                    <CmsText
                        text={props.text}
                        className="text-[0.95rem] text-slate-500 dark:text-slate-400"
                        paragraphClassName="leading-[1.6]"
                    />
                </div>
            </div>

            <div className="hidden md:block space-y-6">
                <div className="aspect-[4/5] overflow-hidden rounded-xl bg-slate-100 shadow-xl">
                    <CmsImage
                        image={props.image}
                        alt={props.title}
                        className="w-full h-full object-cover scale-[1.04] md:grayscale transition-[filter,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:grayscale-0 md:group-hover:scale-[1.08]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-serif text-primary">
                        {renderCmsInline(props.title)}
                    </h3>
                    <CmsText
                        text={props.text}
                        className="text-sm text-slate-500 dark:text-slate-400"
                        paragraphClassName="leading-[1.65]"
                    />
                </div>
            </div>
        </div>
    );
 };

export default ValueItem;
