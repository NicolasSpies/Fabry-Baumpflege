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
    compact = false,
    tone = 'plain',
    page = 'Home',
    section = 'StatsSection'
}) => {
    const sectionRef = useRef(null);
    useSoftEntrance(sectionRef);
    const sectionTone =
        tone === 'tint'
            ? 'bg-primary/[0.035] border-y border-primary/10'
            : 'bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800';

    return (
        <section ref={sectionRef} className={`${sectionTone} ${compact ? 'py-7 md:py-9 min-h-[120px] md:min-h-[140px]' : 'py-16 md:py-20 min-h-[300px] md:min-h-[350px]'}`}>
            <div className="max-w-7xl mx-auto px-6 text-center">
                <div className={`grid grid-cols-2 md:grid-cols-4 ${compact ? 'gap-y-6 gap-x-4 md:gap-5' : 'gap-12 md:gap-8'}`}>
                    <div className="soft-entrance-item">
                        <StatCounter statValue={stat1_value} statLabel={stat1_label} compact={compact} page={page} section={section} />
                    </div>
                    <div className="soft-entrance-item">
                        <StatCounter statValue={stat2_value} statLabel={stat2_label} compact={compact} page={page} section={section} />
                    </div>
                    <div className="soft-entrance-item">
                        <StatCounter statValue={stat3_value} statLabel={stat3_label} compact={compact} page={page} section={section} />
                    </div>
                    <div className="soft-entrance-item">
                        <StatCounter statValue={stat4_value} statLabel={stat4_label} compact={compact} page={page} section={section} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
