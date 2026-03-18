import React, { useState, useEffect, useRef } from 'react';
import { resolveInstanceProps } from '@/cms/bridge-resolver';

/**
 * StatCounter component for animated numbers.
 */
const StatCounter = ({ statValue, statLabel, className = "", data, page = 'Home', section = 'StatsSection' }) => {
    const props = resolveInstanceProps(page, `${section}/StatCounter`, { statValue, statLabel }, data);
    const [count, setCount] = useState(0);
    const countRef = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimated.current) {
                hasAnimated.current = true;
                const safeVal = String(props.statValue || '0');
                const target = parseInt(safeVal.replace(/\D/g, '')) || 0;
                const duration = 2000;
                let startTime = null;

                const animate = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    setCount(Math.floor(progress * target));
                    if (progress < 1) requestAnimationFrame(animate);
                    else setCount(target);
                };
                requestAnimationFrame(animate);
            }
        }, { threshold: 0.5 });

        if (countRef.current) observer.observe(countRef.current);
        return () => observer.disconnect();
    }, [props.statValue]);

    const safeValStr = String(props.statValue || '');
    const suffix = safeValStr.includes('+') ? '+' : safeValStr.includes('%') ? '%' : '';

    return (
        <div ref={countRef} className={`text-center px-4 reveal font-sans ${className}`}>
            <div className="text-4xl md:text-5xl font-serif text-primary mb-2">
                {count}{suffix}
            </div>
            <div className="text-xs md:text-sm text-[#9bb221] uppercase tracking-widest font-medium">
                {props.statLabel}
            </div>
        </div>
    );
};

export default StatCounter;
