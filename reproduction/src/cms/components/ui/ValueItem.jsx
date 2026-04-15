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
            ? { speed: 0.07, maxTravel: 45 }
            : idx === 2
                ? { speed: 0.10, maxTravel: 65 }
                : { speed: 0.04, maxTravel: 25 };
    useParallax(blockRef, { ...parallaxConfig, scale: 1, desktopOnly: true });
 
    return (
        <div ref={blockRef} className={`group ${offset ? 'lg:mt-24 reveal stagger-1' : ''}`}>
            <div className="lg:hidden space-y-4 rounded-[1.75rem] px-4 py-4 bg-primary/[0.035] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="relative rounded-[1.35rem] overflow-hidden shadow-md h-[17.5rem] sm:h-[21.5rem]">
                    <CmsImage
                        image={props.image}
                        alt={props.title}
                        className="w-full h-full object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        loading="lazy"
                    />
                </div>
                <div className="space-y-3 px-1 pb-1">
                    <h2 className="text-[1.8rem] sm:text-[2.2rem] font-serif text-primary leading-[1.05]">
                        {renderCmsInline(props.title)}
                    </h2>
                    <CmsText
                        text={props.text}
                        className="text-slate-600 dark:text-slate-400 font-light"
                        paragraphClassName="text-[0.875rem] leading-[1.5]"
                    />
                </div>
            </div>

            <div className="hidden lg:block space-y-6">
                <div className="aspect-[4/5] overflow-hidden rounded-xl bg-slate-100 shadow-xl">
                    <CmsImage
                        image={props.image}
                        alt={props.title}
                        className="w-full h-full object-cover scale-[1.04] lg:grayscale transition-[filter,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:group-hover:grayscale-0 lg:group-hover:scale-[1.08]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-serif text-primary">
                        {renderCmsInline(props.title)}
                    </h2>
                    <CmsText
                        text={props.text}
                        className="text-sm text-muted-accessible"
                        paragraphClassName="leading-[1.65]"
                    />
                </div>
            </div>
        </div>
    );
 };

export default ValueItem;
