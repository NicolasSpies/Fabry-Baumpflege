import React from 'react';


const ContactSidebarSection = ({ details_label, phone, email, office_label, address, address_link, area_label, area_text }) => {

// Safety for phone rendering
    const safePhone = typeof phone === 'string' ? phone : String(phone || '');

return (
        <div className="lg:col-span-4 space-y-8 reveal">
            <div className="bg-white dark:bg-surface-dark p-10 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-12">
                <section>
                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-8">{details_label}</h3>
                    <ul className="space-y-10">
                        <li>
                            <p className="text-[9px] uppercase tracking-widest text-slate-400/70 mb-2 font-medium">PHONE</p>
                            <a className="text-xl font-sans text-slate-700 dark:text-slate-200 hover:text-primary transition-colors" href={`tel:${safePhone.replace(/\s/g, '')}`}>{safePhone}</a>
                        </li>
                        <li>
                            <p className="text-[9px] uppercase tracking-widest text-slate-400/70 mb-2 font-medium">EMAIL</p>
                            <a className="text-xl font-sans text-slate-700 dark:text-slate-200 hover:text-primary transition-colors" href={`mailto:${email}`}>{email}</a>
                        </li>
                        <li>
                            <p className="text-[9px] uppercase tracking-widest text-slate-400/70 mb-2 font-medium">{office_label}</p>
                            <a href={address_link} target="_blank" rel="noopener noreferrer" className="text-xl font-sans text-slate-700 dark:text-slate-200 leading-relaxed hover:text-primary">{address}</a>
                        </li>
                    </ul>
                </section>
                <section className="bg-primary/5 dark:bg-primary/10 p-8 rounded-xl border border-primary/10">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#9bb221] font-bold mb-4">{area_label}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{area_text}</p>
                </section>
            </div>
        </div>
    );
};

export default ContactSidebarSection;
