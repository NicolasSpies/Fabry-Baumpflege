import React, { useState, useEffect, useRef } from 'react';
import { resolveInstanceProps } from '@/cms/bridge-resolver';

/**
 * StatCounter component for animated numbers.
 */
const StatCounter = ({ statValue, statLabel, className = "", compact = false, data, page = 'Home', section = 'StatsSection' }) => {
    const props = resolveInstanceProps(page, `${section}/StatCounter`, { statValue, statLabel }, data);
    const [count, setCount] = useState(0);
    const countRef = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimated.current) {
                const safeVal = String(props.statValue || '0');
                const target = parseInt(safeVal.replace(/\D/g, '')) || 0;
                
                if (target > 0) {
                    hasAnimated.current = true;
                }

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
        }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

        if (countRef.current) observer.observe(countRef.current);
        return () => observer.disconnect();
    }, [props.statValue]);

    const safeValStr = String(props.statValue || '');
    const suffix = safeValStr.includes('+') ? '+' : safeValStr.includes('%') ? '%' : '';

    if (!props.statValue && !props.statLabel) return null;

    return (
        <div ref={countRef} className={`text-center px-2 md:px-3 font-sans ${className}`}>
            <div 
                className={`${compact ? 'text-[2.35rem] md:text-[3rem] mb-1' : 'text-4xl md:text-5xl mb-2'} font-serif text-primary leading-none tabular-nums`}
                style={{ minHeight: compact ? '2.5rem' : '3.5rem' }}
            >
                {count}{suffix}
            </div>
            <div className={`${compact ? 'text-[10px] md:text-[12px] tracking-[0.16em] md:tracking-[0.2em]' : 'text-xs md:text-sm tracking-widest'} text-accent-label uppercase font-medium`}>
                {props.statLabel}
            </div>
        </div>
    );
};

export default StatCounter;
