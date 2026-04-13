import React, { useState, useEffect, useRef } from 'react';
import { resolveInstanceProps } from '@/cms/bridge-resolver';

/**
 * StatCounter component for animated numbers.
 */
const StatCounter = ({ statValue, statLabel, className = "", compact = false, data, page = 'Home', section = 'StatsSection' }) => {
    const props = resolveInstanceProps(page, `${section}/StatCounter`, { statValue, statLabel }, data);
    const safeVal = String(props.statValue || '0');
    const target = parseInt(safeVal.replace(/\D/g, '')) || 0;
    const countDown = target === 0;
    const startFrom = countDown ? 50 : 0;

    const [count, setCount] = useState(startFrom);
    const countRef = useRef(null);
    const hasAnimated = useRef(false);
    const animFrameRef = useRef(null);

    useEffect(() => {
        setCount(startFrom);
        hasAnimated.current = false;
    }, [startFrom]);

    useEffect(() => {
        // Cancel any running animation when deps change
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        hasAnimated.current = false;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimated.current) {
                const el = countRef.current;
                const isVisible = el && getComputedStyle(el.closest('.soft-entrance-item') || el).opacity !== '0';

                if (!isVisible) {
                    const retryInterval = setInterval(() => {
                        const nowVisible = el && getComputedStyle(el.closest('.soft-entrance-item') || el).opacity !== '0';
                        if (nowVisible && !hasAnimated.current) {
                            clearInterval(retryInterval);
                            startAnimation();
                        }
                    }, 100);
                    setTimeout(() => clearInterval(retryInterval), 5000);
                    return;
                }

                startAnimation();
            }
        }, { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });

        function startAnimation() {
            hasAnimated.current = true;
            const duration = 2000;
            let startTime = null;

            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);

                if (countDown) {
                    setCount(Math.round(startFrom - eased * startFrom));
                } else {
                    setCount(Math.floor(eased * target));
                }

                if (progress < 1) {
                    animFrameRef.current = requestAnimationFrame(animate);
                } else {
                    setCount(target);
                    animFrameRef.current = null;
                }
            };
            animFrameRef.current = requestAnimationFrame(animate);
        }

        if (countRef.current) observer.observe(countRef.current);
        return () => {
            observer.disconnect();
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [target, startFrom, countDown]);

    const safeValStr = String(props.statValue || '');
    const suffix = safeValStr.includes('+') ? '+' : safeValStr.includes('%') ? '%' : '';

    const hasContent = props.statValue || props.statLabel;

    return (
        <div ref={countRef} className={`text-center px-2 md:px-3 font-sans ${className}`} style={hasContent ? undefined : { visibility: 'hidden' }}>
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
