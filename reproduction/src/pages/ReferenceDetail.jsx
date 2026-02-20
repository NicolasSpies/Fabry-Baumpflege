import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/useLanguage';
import { references } from '../data/references';

import { useScrollReveal } from '../hooks/useScrollReveal';

const ReferenceDetail = () => {
    const { id } = useParams();
    const { language } = useLanguage();
    useScrollReveal();
    const [sliderValue, setSliderValue] = useState(50);
    const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const carouselRef = useRef(null);

    // Find project by id
    const project = references.find(p => p.id === id);

    if (!project) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-3xl font-display text-primary mb-4">
                    {language === 'DE' ? 'Referenz nicht gefunden' : 'Référence non trouvée'}
                </h2>
                <Link
                    to="/referenzen"
                    className="text-primary hover:underline font-medium uppercase tracking-widest text-sm"
                >
                    {language === 'DE' ? 'Zurück zur Übersicht' : 'Retour à l\'aperçu'}
                </Link>
            </div>
        );
    }

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (project.galleryImages && !isLightboxOpen) {
                setCurrentGalleryIndex((prev) => (prev + 1) % project.galleryImages.length);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [project.galleryImages, isLightboxOpen]);

    const nextSlide = () => {
        setCurrentGalleryIndex((prev) => (prev + 1) % project.galleryImages.length);
    };

    const prevSlide = () => {
        setCurrentGalleryIndex((prev) => (prev - 1 + project.galleryImages.length) % project.galleryImages.length);
    };

    const openLightbox = (index) => {
        setLightboxIndex(index);
        setIsLightboxOpen(true);
    };

    return (
        <>
            <section className="max-w-7xl mx-auto px-6 pt-12 pb-8 mt-20">
                <Link
                    to="/referenzen"
                    className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    {language === 'DE' ? 'Zurück zur Übersicht' : 'Retour à l\'aperçu'}
                </Link>
            </section>

            <section className="px-6 mb-24">
                <div className="max-w-7xl mx-auto">
                    <div className="relative h-[70vh] w-full rounded-3xl overflow-hidden shadow-2xl reveal">
                        <img
                            alt={project.title}
                            className="w-full h-full object-cover"
                            src={project.thumbnailImage}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12">
                            <div className="max-w-3xl">
                                <span className="text-white/80 text-sm uppercase tracking-[0.3em] mb-4 block reveal stagger-1">
                                    {language === 'DE' ? 'Referenzprojekt' : 'Projet de Référence'}
                                </span>
                                <h1 className="text-5xl md:text-7xl font-display text-white leading-tight mb-4 reveal stagger-2">{project.title}</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Sidebar */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit reveal">
                        <div className="bg-surface-light dark:bg-surface-dark p-10 rounded-3xl space-y-8">
                            <h2 className="text-2xl font-display text-primary">
                                {language === 'DE' ? 'Projekt Details' : 'Détails du Projet'}
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 block mb-1">
                                        {language === 'DE' ? 'Datum' : 'Date'}
                                    </span>
                                    <p className="text-lg font-medium">September 2023</p>
                                </div>
                                <div className="h-px bg-slate-200 dark:bg-slate-700"></div>
                                <div>
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 block mb-1">
                                        {language === 'DE' ? 'Dienstleistung' : 'Service'}
                                    </span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {project.categories?.map((cat) => (
                                            <span key={cat} className="text-sm font-medium bg-primary/5 text-primary px-3 py-1 rounded-full border border-primary/10">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-px bg-slate-200 dark:bg-slate-700"></div>
                                <div>
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 block mb-1">
                                        {language === 'DE' ? 'Standort' : 'Lieu'}
                                    </span>
                                    <p className="text-lg font-medium">{project.location}</p>
                                </div>
                                <div className="h-px bg-slate-200 dark:bg-slate-700"></div>
                            </div>
                            <Link
                                to="/kontakt"
                                className="block w-full text-center py-5 mt-4 border border-primary text-primary hover:bg-primary hover:text-white rounded-full transition-all uppercase text-xs font-bold tracking-widest"
                            >
                                {language === 'DE' ? 'Ähnliches Projekt anfragen' : 'Demander un projet similaire'}
                            </Link>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8 reveal stagger-1">
                        <div className="prose prose-slate prose-lg dark:prose-invert max-w-none">
                            <h2 className="font-display text-3xl text-primary mb-8">
                                {language === 'DE' ? 'Herausforderung & Umsetzung' : 'Défi & Mise en oeuvre'}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 whitespace-pre-wrap">
                                {language === 'DE' ? project.challengeDE : project.challengeFR}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-12 whitespace-pre-wrap">
                                {language === 'DE' ? project.implementationDE : project.implementationFR}
                            </p>
                        </div>

                        <div className="mt-16 space-y-12">
                            {/* Before/After Slider */}
                            <div className="relative w-full h-[600px] overflow-hidden rounded-3xl no-select group shadow-2xl bg-slate-100">
                                <img
                                    alt="Nachher"
                                    className="absolute inset-0 w-full h-full object-cover"
                                    src={project.afterImage}
                                />
                                <span className="absolute top-6 right-6 font-montserrat text-[10px] text-white/90 uppercase tracking-[0.2em] z-10 bg-black/20 backdrop-blur-sm px-3 py-1 rounded">
                                    {language === 'DE' ? 'NACHHER' : 'APRÈS'}
                                </span>

                                <div
                                    className="absolute inset-0 overflow-hidden border-r-2 border-primary/30"
                                    style={{ width: `${sliderValue}%` }}
                                >
                                    <img
                                        alt="Vorher"
                                        className="absolute inset-0 w-[800px] md:w-[1200px] lg:w-[1600px] h-full object-cover max-w-none"
                                        src={project.beforeImage}
                                    />
                                    <span className="absolute top-6 left-6 font-montserrat text-[10px] text-white/90 uppercase tracking-[0.2em] z-10 bg-black/20 backdrop-blur-sm px-3 py-1 rounded">
                                        {language === 'DE' ? 'VORHER' : 'AVANT'}
                                    </span>
                                </div>

                                <div
                                    className="absolute inset-y-0 -ml-[1px] w-[2px] bg-white cursor-ew-resize z-20"
                                    style={{ left: `${sliderValue}%` }}
                                >
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center slider-handle-shadow border-4 border-white transition-transform group-hover:scale-105">
                                        <span className="material-symbols-outlined text-primary text-3xl font-bold select-none">swap_horiz</span>
                                    </div>
                                </div>

                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={sliderValue}
                                    onChange={(e) => setSliderValue(e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                                />
                            </div>

                            {/* Gallery Carousel */}
                            <div className="relative group/carousel reveal stagger-2">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-display text-primary">
                                        {language === 'DE' ? 'Projekt-Galerie' : 'Galerie du Projet'}
                                    </h3>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={prevSlide}
                                            className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all"
                                        >
                                            <span className="material-symbols-outlined">arrow_back</span>
                                        </button>
                                        <button
                                            onClick={nextSlide}
                                            className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all"
                                        >
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-3xl">
                                    <div
                                        className="flex transition-transform duration-700 ease-in-out"
                                        style={{ transform: `translateX(-${currentGalleryIndex * 50}%)` }}
                                    >
                                        {project.galleryImages?.map((img, idx) => (
                                            <div
                                                key={idx}
                                                className="min-w-[50%] p-2 cursor-zoom-in"
                                                onClick={() => openLightbox(idx)}
                                            >
                                                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg group/img">
                                                    <img
                                                        src={img}
                                                        alt={`${project.title} - ${idx + 1}`}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-white text-4xl">zoom_in</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Lightbox */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-6 md:p-12">
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-4xl">close</span>
                    </button>

                    <button
                        onClick={() => setLightboxIndex((prev) => (prev - 1 + project.galleryImages.length) % project.galleryImages.length)}
                        className="absolute left-4 md:left-8 text-white/60 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-5xl">chevron_left</span>
                    </button>

                    <div className="relative w-full max-w-5xl aspect-video">
                        <img
                            src={project.galleryImages[lightboxIndex]}
                            alt="Project Gallery Large"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <button
                        onClick={() => setLightboxIndex((prev) => (prev + 1) % project.galleryImages.length)}
                        className="absolute right-4 md:right-8 text-white/60 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-5xl">chevron_right</span>
                    </button>

                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40 text-sm tracking-widest uppercase">
                        {lightboxIndex + 1} / {project.galleryImages?.length}
                    </div>
                </div>
            )}

            {/* CTA Section and Footer handled globally in App.jsx */}
        </>
    );
};

export default ReferenceDetail;
