import { useEffect } from 'react';

export const useServiceCardsEntrance = (ref, options = {}) => {
    const {
        threshold = 0.15,
        staggerDelayMs = 120,
        itemSelector = '.expert-card-anim',
        durationMs = 750,
        easing = 'cubic-bezier(0.22, 1, 0.36, 1)'
    } = options;

    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const items = Array.from(container.querySelectorAll(itemSelector));
        if (items.length === 0) return;

        // Initialize state before animation
        items.forEach((item) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(22px)';
            item.style.willChange = 'transform, opacity';
            // Important: We don't apply `transition` globally yet to avoid conflicts with Tailwind hovers.
            // We apply it inline exactly when the animation starts, and clear it afterwards.
        });

        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries;

            if (entry.isIntersecting) {
                // Step 1: Calculate DOM geometry to find visual rows
                let rowsMap = new Map();

                items.forEach((item) => {
                    const rect = item.getBoundingClientRect();
                    // Group by top position, allowing for ~20px variance
                    const rowKey = Math.round(rect.top / 20) * 20;
                    if (!rowsMap.has(rowKey)) {
                        rowsMap.set(rowKey, []);
                    }
                    rowsMap.get(rowKey).push({ item, rect });
                });

                // Convert map to array of rows, sorted visually from top to bottom
                let rows = Array.from(rowsMap.entries())
                    .sort((a, b) => a[0] - b[0])
                    .map(entry => entry[1]);

                // Sort items within each row from left to right
                rows.forEach(row => {
                    row.sort((a, b) => a.rect.left - b.rect.left);
                });

                // Step 2: Determine stagger order
                let orderedItems = [];

                if (rows.length === items.length) {
                    // Mobile (1 column layout): Top-to-Bottom stagger
                    rows.forEach(row => {
                        orderedItems.push(row[0].item);
                    });
                } else {
                    // Tablet/Desktop (2 or 4 column layout): Bottom-to-Top stagger
                    for (let i = rows.length - 1; i >= 0; i--) {
                        rows[i].forEach(node => {
                            orderedItems.push(node.item);
                        });
                    }
                }

                // Step 3: Execute staggered reveal
                orderedItems.forEach((item, index) => {
                    setTimeout(() => {
                        // Apply inline transition for entrance
                        item.style.transition = `opacity ${durationMs}ms ${easing}, transform ${durationMs}ms ${easing}`;

                        // Force a reflow to ensure the transition takes effect cleanly
                        void item.offsetWidth;

                        // Apply final resting state
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';

                        // Clean up transition and will-change after animation completes
                        // This ensures our inline transition string doesn't fight Tailwind's `hover:transition-transform` later.
                        setTimeout(() => {
                            if (item.style) {
                                item.style.willChange = 'auto';
                                item.style.transition = '';
                            }
                        }, durationMs + 50);

                    }, index * staggerDelayMs);
                });

                // Animate exactly once
                observer.disconnect();
            }
        }, { threshold });

        observer.observe(container);

        return () => observer.disconnect();
    }, [ref, threshold, staggerDelayMs, itemSelector, durationMs, easing]);
};
