import React from 'react';

export function ReferenceDetailSkeleton() {
    return (
        <main className="pt-28 pb-24 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="h-4 w-40 rounded-full bg-slate-200/80 dark:bg-slate-800 animate-pulse mb-8" />

                <div className="h-[56vh] rounded-3xl bg-slate-200/80 dark:bg-slate-800 animate-pulse mb-16" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-4">
                        <div className="rounded-3xl bg-surface-light dark:bg-surface-dark p-10 space-y-6 border border-slate-100 dark:border-slate-800">
                            <div className="h-8 w-40 rounded-full bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
                            <div className="space-y-5">
                                <div className="h-14 rounded-2xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
                                <div className="h-14 rounded-2xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
                                <div className="h-14 rounded-2xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
                            </div>
                            <div className="h-12 rounded-full bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-8">
                        <div className="space-y-4">
                            <div className="h-8 w-56 rounded-full bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
                            <div className="h-4 w-full rounded-full bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
                            <div className="h-4 w-[92%] rounded-full bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
                            <div className="h-4 w-[78%] rounded-full bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
                        </div>

                        <div className="h-[32rem] rounded-3xl bg-slate-200/80 dark:bg-slate-800 animate-pulse" />

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="aspect-square rounded-3xl bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
                            <div className="aspect-square rounded-3xl bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
                            <div className="aspect-square rounded-3xl bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function PageSkeleton() {
    return (
        <main className="flex-1 pt-28 pb-24 px-6">
            <div className="max-w-7xl mx-auto space-y-10">
                <div className="h-[38vh] rounded-3xl bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="h-48 rounded-3xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
                    <div className="h-48 rounded-3xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
                    <div className="h-48 rounded-3xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
                </div>
                <div className="space-y-4">
                    <div className="h-5 w-56 rounded-full bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
                    <div className="h-4 w-full rounded-full bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
                    <div className="h-4 w-[90%] rounded-full bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
                    <div className="h-4 w-[72%] rounded-full bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
                </div>
            </div>
        </main>
    );
}
