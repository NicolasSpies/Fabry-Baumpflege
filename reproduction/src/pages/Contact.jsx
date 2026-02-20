import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/useLanguage';
import { useScrollReveal } from '../hooks/useScrollReveal';
import servicesHeroImg from '../assets/images/hero/services_hero.png';

const Contact = () => {
    const { language } = useLanguage();
    useScrollReveal();
    const [selectedServices, setSelectedServices] = useState(['Baumpflege']);

    const services = [
        { id: 'Baumpflege', label: { DE: 'Baumpflege', FR: 'Arboriculture' }, sub: { DE: 'Kronenschnitt & Erhalt', FR: 'Taille & Maintien' }, icon: 'park' },
        { id: 'Baumfällung', label: { DE: 'Baumfällung', FR: 'Abattage' }, sub: { DE: 'Sichere Abtragung', FR: 'Évacuation Sûre' }, icon: 'nature' },
        { id: 'Gartenpflege', label: { DE: 'Gartenpflege', FR: 'Entretien' }, sub: { DE: 'Gesamtkonzepte', FR: 'Concepts Globaux' }, icon: 'grass' },
        { id: 'Bepflanzung', label: { DE: 'Bepflanzung', FR: 'Plantation' }, sub: { DE: 'Nachhaltige Neuanlage', FR: 'Nouvelle Plantation' }, icon: 'potted_plant' },
    ];

    const toggleService = (id) => {
        setSelectedServices(prev =>
            prev.includes(id) ? prev.filter(serviceId => serviceId !== id) : [...prev, id]
        );
    };

    const [scrollY, setScrollY] = useState(0);
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <main className="bg-[#F9FBF7] dark:bg-background-dark transition-colors duration-300">
            {/* Header Section */}
            <section className="relative h-[45vh] flex items-center justify-center pt-20 overflow-hidden">
                <img
                    alt="Contact"
                    className="absolute inset-0 w-full h-full object-cover"
                    src={servicesHeroImg}
                    style={{
                        transform: `scale(${1.1 + scrollY * 0.0001}) translateY(${scrollY * 0.1}px)`,
                        transition: 'transform 0.1s ease-out'
                    }}
                />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="relative z-10 text-center reveal">
                    <h1 className="text-5xl md:text-7xl font-serif text-white drop-shadow-xl mb-4">
                        {language === 'DE' ? 'Kontakt' : 'Contact'}
                    </h1>
                    <div className="w-16 h-1 bg-white mx-auto rounded-full opacity-60"></div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* Left Column: Contact Details */}
                    <div className="lg:col-span-4 space-y-8 reveal">
                        <div className="bg-white dark:bg-surface-dark p-10 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-12">
                            <section>
                                <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-8">
                                    {language === 'DE' ? 'Details' : 'Détails'}
                                </h3>
                                <ul className="space-y-10">
                                    <li className="group">
                                        <p className="text-[9px] uppercase tracking-widest text-slate-400/70 mb-2 font-medium">
                                            {language === 'DE' ? 'Telefon' : 'Téléphone'}
                                        </p>
                                        <a className="text-xl font-sans text-slate-700 dark:text-slate-200 hover:text-primary transition-colors duration-300" href="tel:+32476320969">+32 476 32 09 69</a>
                                    </li>
                                    <li className="group">
                                        <p className="text-[9px] uppercase tracking-widest text-slate-400/70 mb-2 font-medium">Email</p>
                                        <a className="text-xl font-sans text-slate-700 dark:text-slate-200 hover:text-primary transition-colors duration-300" href="mailto:info@fabry-baumpflege.be">info@fabry-baumpflege.be</a>
                                    </li>
                                    <li className="group">
                                        <p className="text-[9px] uppercase tracking-widest text-slate-400/70 mb-2 font-medium">
                                            {language === 'DE' ? 'Büro' : 'Bureau'}
                                        </p>
                                        <a
                                            href="https://www.google.com/maps/dir/?api=1&destination=Halloux+16,+4830+Limbourg"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xl font-sans text-slate-700 dark:text-slate-200 leading-relaxed hover:text-primary transition-colors duration-300"
                                        >
                                            Halloux 16,<br />4830 Limbourg
                                        </a>
                                    </li>
                                </ul>
                            </section>

                            <section className="bg-primary/5 dark:bg-primary/10 p-8 rounded-xl border border-primary/10 transition-colors duration-300">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] text-primary/70 font-bold mb-4">
                                    {language === 'DE' ? 'Einsatzgebiet' : 'Zone d\'Intervention'}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                    {language === 'DE'
                                        ? 'Ich bin in der gesamten Region Limbourg und Umgebung für dich im Einsatz. Fachgerechte Beratung vor Ort.'
                                        : 'Je suis à votre service dans toute la région du Limbourg et ses environs. Conseils professionnels sur place.'}
                                </p>
                            </section>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="lg:col-span-8 reveal stagger-1">
                        <div className="bg-white dark:bg-surface-dark p-10 md:p-16 border border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl transition-colors duration-300">
                            <form className="space-y-12">
                                <div className="space-y-8">
                                    <h2 className="text-2xl font-serif italic text-primary">
                                        {language === 'DE' ? 'Womit kann ich helfen?' : 'Comment puis-je aider ?'}
                                    </h2>
                                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
                                        {services.map((s) => (
                                            <div
                                                key={s.id}
                                                className={`relative border p-6 md:p-8 transition-all duration-300 cursor-pointer flex flex-col items-center text-center gap-4 rounded-xl ${selectedServices.includes(s.id)
                                                    ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary'
                                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark hover:border-primary shadow-sm'
                                                    }`}
                                                onClick={() => toggleService(s.id)}
                                            >
                                                {selectedServices.includes(s.id) && (
                                                    <div className="absolute top-4 right-4 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                                                    </div>
                                                )}
                                                <span className={`material-symbols-outlined text-3xl md:text-5xl font-light ${selectedServices.includes(s.id) ? 'text-primary' : 'text-slate-400'
                                                    }`}>{s.icon}</span>
                                                <div>
                                                    <p className={`text-[10px] md:text-sm font-bold uppercase tracking-widest mb-1 ${selectedServices.includes(s.id) ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                                                        }`}>{s.label[language]}</p>
                                                    <p className="text-[9px] md:text-[11px] text-slate-400 uppercase tracking-widest leading-tight">{s.sub[language]}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="relative">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                                            {language === 'DE' ? 'Vorname' : 'Prénom'}
                                        </label>
                                        <input
                                            className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 border-slate-200 dark:border-slate-700 focus:ring-0 focus:border-primary px-0 py-3 transition-colors duration-300 text-lg dark:text-white placeholder-slate-300"
                                            placeholder="John"
                                            type="text"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                                            {language === 'DE' ? 'Nachname' : 'Nom'}
                                        </label>
                                        <input
                                            className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 border-slate-200 dark:border-slate-700 focus:ring-0 focus:border-primary px-0 py-3 transition-colors duration-300 text-lg dark:text-white placeholder-slate-300"
                                            placeholder="Doe"
                                            type="text"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                                            {language === 'DE' ? 'Email-Adresse' : 'Adresse E-Mail'}
                                        </label>
                                        <input
                                            className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 border-slate-200 dark:border-slate-700 focus:ring-0 focus:border-primary px-0 py-3 transition-colors duration-300 dark:text-white placeholder-slate-300"
                                            placeholder="john@example.com"
                                            type="email"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                                            {language === 'DE' ? 'Telefonnummer' : 'Téléphone'}
                                        </label>
                                        <input
                                            className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 border-slate-200 dark:border-slate-700 focus:ring-0 focus:border-primary px-0 py-3 transition-colors duration-300 dark:text-white placeholder-slate-300"
                                            placeholder="+32 ..."
                                            type="tel"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                                        {language === 'DE' ? 'Notiz' : 'Note'}
                                    </label>
                                    <textarea
                                        rows="4"
                                        className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b-2 border-slate-200 dark:border-slate-700 focus:ring-0 focus:border-primary px-0 py-3 transition-colors duration-300 text-lg dark:text-white placeholder-slate-300"
                                        placeholder={language === 'DE' ? 'Wie kann ich dir helfen?' : 'Comment puis-je vous aider ?'}
                                    ></textarea>
                                </div>

                                <div className="pt-6 flex justify-end">
                                    <button className="bg-primary text-white w-full md:w-auto px-14 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-opacity-90 transition-all flex items-center justify-center gap-4 group rounded-full shadow-lg" type="button">
                                        {language === 'DE' ? 'Anfrage senden' : 'Envoyer la demande'}
                                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">send</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Contact;
