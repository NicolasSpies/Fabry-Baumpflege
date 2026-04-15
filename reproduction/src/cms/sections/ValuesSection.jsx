import React from 'react';
import ValueItem from '@/cms/components/ui/ValueItem';

const ValuesSection = ({ 
    val1_title,
    val1_text,
    val1_image,
    val2_title,
    val2_text,
    val2_image,
    val3_title,
    val3_text,
    val3_image,
    page = 'AboutMe',
    section = 'ValuesSection'
}) => {
    return (
        <section className="pt-12 pb-20 md:py-24 lg:py-32 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
                    <ValueItem 
                        title={val1_title} 
                        text={val1_text} 
                        image={val1_image} 
                        idx={0} 
                        page={page} 
                        section={section} 
                    />
                    <ValueItem 
                        title={val2_title} 
                        text={val2_text} 
                        image={val2_image} 
                        idx={1} 
                        offset={true} 
                        page={page} 
                        section={section} 
                    />
                    <ValueItem 
                        title={val3_title} 
                        text={val3_text} 
                        image={val3_image} 
                        idx={2} 
                        page={page} 
                        section={section} 
                    />
                </div>
            </div>
        </section>
    );
};

export default ValuesSection;
