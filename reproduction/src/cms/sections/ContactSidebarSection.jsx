import React from 'react';


const ContactSidebarSection = ({ contact_person, phone, email, office_label, address, address_link, area_label, area_text }) => {

// Safety for phone rendering
    const safePhone = typeof phone === 'string' ? phone : String(phone || '');
    const hasAreaBox = Boolean(area_label || area_text);

return (
        <div className="lg:col-span-4 space-y-6 reveal">
            <div className="bg-white dark:bg-surface-dark p-8 md:p-9 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                <section>
                    {contact_person && (
                        <h3 className="text-2xl md:text-[1.65rem] font-serif text-primary mb-6 leading-tight break-words">
                            {contact_person}
                        </h3>
                    )}
                    <ul className="space-y-7">
                        {safePhone && (
                            <li>
                                <p className="text-[9px] uppercase tracking-widest text-slate-400/70 mb-2 font-medium">PHONE</p>
                                <a className="text-base md:text-lg lg:text-[1.1rem] font-sans text-slate-700 dark:text-slate-200 hover:text-primary transition-colors" href={`tel:${safePhone.replace(/\s/g, '')}`}>{safePhone}</a>
                            </li>
                        )}
                        {email && (
                            <li>
                                <p className="text-[9px] uppercase tracking-widest text-slate-400/70 mb-2 font-medium">EMAIL</p>
                                <a className="text-base md:text-lg lg:text-[1.1rem] font-sans text-slate-700 dark:text-slate-200 hover:text-primary transition-colors break-all" href={`mailto:${email}`}>{email}</a>
                            </li>
                        )}
                        {address && (
                            <li>
                                <p className="text-[9px] uppercase tracking-widest text-slate-400/70 mb-2 font-medium">{office_label}</p>
                                {address_link ? (
                                    <a href={address_link} target="_blank" rel="noopener noreferrer" className="text-base md:text-lg lg:text-[1.02rem] font-sans text-slate-700 dark:text-slate-200 leading-relaxed hover:text-primary break-words lg:whitespace-nowrap">{address}</a>
                                ) : (
                                    <p className="text-base md:text-lg lg:text-[1.02rem] font-sans text-slate-700 dark:text-slate-200 leading-relaxed break-words lg:whitespace-nowrap">{address}</p>
                                )}
                            </li>
                        )}
                    </ul>
                </section>
                {hasAreaBox && (
                    <section className="bg-primary/5 dark:bg-primary/10 p-6 rounded-xl border border-primary/10">
                        {area_label && <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#9bb221] font-bold mb-3">{area_label}</h3>}
                        {area_text && <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{area_text}</p>}
                    </section>
                )}
            </div>
        </div>
    );
};

export default ContactSidebarSection;
