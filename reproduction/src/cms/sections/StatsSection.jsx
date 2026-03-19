import React, { useRef } from 'react';
import { useSoftEntrance } from '@/cms/hooks/useSoftEntrance';
import StatCounter from '@/cms/components/ui/StatCounter';


const StatsSection = ({ 
    stat1_value,
    stat1_label,
    stat2_value,
    stat2_label,
    stat3_value,
    stat3_label,
    stat4_value,
    stat4_label,
    page = 'Home',
    section = 'StatsSection'
}) => {
    const sectionRef = useRef(null);
    useSoftEntrance(sectionRef);

    return (
        <section ref={sectionRef} className="bg-white dark:bg-slate-900 py-16 md:py-20 border-b border-slate-100 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
                    <div className="soft-entrance-item">
                        <StatCounter statValue={stat1_value} statLabel={stat1_label} page={page} section={section} />
                    </div>
                    <div className="soft-entrance-item">
                        <StatCounter statValue={stat2_value} statLabel={stat2_label} page={page} section={section} />
                    </div>
                    <div className="soft-entrance-item">
                        <StatCounter statValue={stat3_value} statLabel={stat3_label} page={page} section={section} />
                    </div>
                    <div className="soft-entrance-item">
                        <StatCounter statValue={stat4_value} statLabel={stat4_label} page={page} section={section} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
