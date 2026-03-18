import React, { useState } from 'react';
import BaumpflegeIcon from '@/cms/components/icons/BaumpflegeIcon';
import BaumfaellungIcon from '@/cms/components/icons/BaumfaellungIcon';
import GartenpflegeIcon from '@/cms/components/icons/GartenpflegeIcon';
import BepflanzungIcon from '@/cms/components/icons/BepflanzungIcon';


const IconRenderer = ({ icon, isSelected }) => {
    const className = `w-8 h-8 md:w-12 md:h-12 flex items-center justify-center text-3xl md:text-5xl font-light ${isSelected ? 'text-primary' : 'text-slate-400'}`;
    switch (icon) {
        case 'BaumpflegeIcon': return <BaumpflegeIcon className={className} />;
        case 'BaumfaellungIcon': return <BaumfaellungIcon className={`w-8 h-8 md:w-12 md:h-12 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />;
        case 'GartenpflegeIcon': return <GartenpflegeIcon className={className} />;
        case 'BepflanzungIcon': return <BepflanzungIcon className={className} />;
        default: return <span className={`material-symbols-outlined text-3xl md:text-5xl font-light ${isSelected ? 'text-primary' : 'text-slate-400'}`}>info</span>;
    }
};

const ContactFormSection = ({ 
    heading = "Anfrage stellen", 
    formSchema = null,
    button: defaultButtonLabel = "Senden"
}) => {
    const [formData, setFormData] = useState({});
    const [selectedServices, setSelectedServices] = useState([]);
    const [errors, setErrors] = useState({});

    // If no schema yet, show a skeleton or loading state
    if (!formSchema) {
        return (
            <div className="lg:col-span-8 reveal stagger-1">
                <div className="bg-white dark:bg-surface-dark p-10 md:p-16 border border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl animate-pulse">
                    <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded mb-12"></div>
                    <div className="grid grid-cols-2 gap-4 mb-12">
                        <div className="h-40 bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
                        <div className="h-40 bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Ensure formSchema behaves predictably if it's a raw array (from a direct field mapping)
    const normalizedSchema = Array.isArray(formSchema) 
        ? { fields: formSchema } 
        : (formSchema || {});

    const { fields = [], submit_label } = normalizedSchema;
    const finalButtonLabel = submit_label || defaultButtonLabel;

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user changes value
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const toggleService = (name, value) => {
        setSelectedServices(prev => {
            const next = prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value];
            handleInputChange(name, next);
            return next;
        });
    };

    const validateForm = () => {
        const newErrors = {};
        fields.forEach(field => {
            if (field.required && !formData[field.name]) {
                newErrors[field.name] = true;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log('[ContactForm] Submitting:', formData);
            // Implement real submission logic here if needed
        }
    };

    const renderField = (field) => {
        const { type, label, name, placeholder, required, options = [] } = field;
        const hasError = errors[name];

        switch (type) {
            case 'checkbox_group':
                return (
                    <div key={name} className="space-y-8 col-span-full">
                        {label && (
                            <label className={`text-[10px] uppercase tracking-[0.2em] font-bold block ${hasError ? 'text-red-500' : 'text-slate-500'}`}>
                                {label} {required && '*'}
                            </label>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            {options.map((opt) => (
                                <div
                                    key={opt.value}
                                    className={`relative border p-6 md:p-8 transition-all duration-300 cursor-pointer flex flex-col items-center text-center gap-4 rounded-xl ${
                                        selectedServices.includes(opt.value) 
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                                            : 'border-slate-200 bg-white hover:border-primary shadow-sm'
                                    }`}
                                    onClick={() => toggleService(name, opt.value)}
                                >
                                    <IconRenderer icon={opt.icon || 'info'} isSelected={selectedServices.includes(opt.value)} />
                                    <div>
                                        <p className={`text-[10px] md:text-sm font-bold uppercase tracking-widest mb-1 ${selectedServices.includes(opt.value) ? 'text-primary' : 'text-slate-700'}`}>
                                            {opt.label}
                                        </p>
                                        {opt.sub && <p className="text-[9px] md:text-[11px] text-slate-400 uppercase tracking-widest leading-tight">{opt.sub}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'textarea':
                return (
                    <div key={name} className="relative col-span-full">
                        <label className={`text-[10px] uppercase tracking-[0.2em] font-bold block mb-2 ${hasError ? 'text-red-500' : 'text-slate-500'}`}>
                            {label} {required && '*'}
                        </label>
                        <textarea 
                            rows="4" 
                            name={name}
                            className={`w-full bg-transparent border-b-2 px-0 py-3 transition-colors text-lg focus:ring-0 ${
                                hasError ? 'border-red-500 focus:border-red-600' : 'border-slate-200 focus:border-primary'
                            }`}
                            placeholder={placeholder}
                            value={formData[name] || ''}
                            onChange={(e) => handleInputChange(name, e.target.value)}
                        />
                    </div>
                );

            default: // text, email, tel
                return (
                    <div key={name} className="relative">
                        <label className={`text-[10px] uppercase tracking-[0.2em] font-bold block mb-2 ${hasError ? 'text-red-500' : 'text-slate-500'}`}>
                            {label} {required && '*'}
                        </label>
                        <input 
                            type={type} 
                            name={name}
                            className={`w-full bg-transparent border-b-2 px-0 py-3 transition-colors text-lg focus:ring-0 ${
                                hasError ? 'border-red-500 focus:border-red-600' : 'border-slate-200 focus:border-primary'
                            }`}
                            placeholder={placeholder || ''}
                            value={formData[name] || ''}
                            onChange={(e) => handleInputChange(name, e.target.value)}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="lg:col-span-8 reveal stagger-1">
            <div className="bg-white dark:bg-surface-dark p-10 md:p-16 border border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl">
                <form className="space-y-12" onSubmit={handleSubmit}>
                    <div className="space-y-8">
                        <h2 className="text-2xl font-serif italic text-primary">{heading}</h2>
                        {fields.filter(f => f.type === 'checkbox_group').map(renderField)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {fields.filter(f => f.type !== 'checkbox_group' && f.type !== 'textarea').map(renderField)}
                    </div>

                    {fields.filter(f => f.type === 'textarea').map(renderField)}

                    <div className="pt-6 flex justify-end">
                        <button
                            type="submit"
                            className="bg-primary text-white w-full md:w-auto px-14 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-opacity-90 transition-all flex items-center justify-center gap-4 group rounded-full shadow-lg"
                        >
                            {finalButtonLabel}
                            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">send</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactFormSection;
