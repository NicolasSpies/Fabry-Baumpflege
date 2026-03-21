import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import BaumpflegeIcon from '@/cms/components/icons/BaumpflegeIcon';
import BaumfaellungIcon from '@/cms/components/icons/BaumfaellungIcon';
import GartenpflegeIcon from '@/cms/components/icons/GartenpflegeIcon';
import BepflanzungIcon from '@/cms/components/icons/BepflanzungIcon';
import { submitForm } from '@/cms/lib/cms';
import Icon from '@/cms/components/ui/Icon';
import { useLanguage } from '@/cms/i18n/useLanguage';


const IconRenderer = ({ icon, isSelected }) => {
    const className = `w-8 h-8 md:w-12 md:h-12 flex items-center justify-center text-3xl md:text-5xl font-light ${isSelected ? 'text-primary' : 'text-muted-accessible'}`;
    switch (icon) {
        case 'BaumpflegeIcon': return <BaumpflegeIcon variant="outline" className={className} />;
        case 'BaumfaellungIcon': return <BaumfaellungIcon variant="outline" className={`w-8 h-8 md:w-12 md:h-12 ${isSelected ? 'text-primary' : 'text-muted-accessible'}`} />;
        case 'GartenpflegeIcon': return <GartenpflegeIcon variant="outline" className={className} />;
        case 'BepflanzungIcon': return <BepflanzungIcon variant="outline" className={className} />;
        default: return <Icon name="info" className={`text-3xl md:text-5xl font-light ${isSelected ? 'text-primary' : 'text-muted-accessible'}`} />;
    }
};

const getServiceIcon = (field) => {
    const token = `${field?.name || ''} ${field?.label || ''}`.toLowerCase();
    const noAccents = token.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (noAccents.includes('baumfaellung') || noAccents.includes('baumfallung') || noAccents.includes('abattage')) return 'BaumfaellungIcon';
    if (noAccents.includes('baumpflege') || noAccents.includes('entretien des arbres') || noAccents.includes('taille')) return 'BaumpflegeIcon';
    if (noAccents.includes('gartenpflege') || noAccents.includes('entretien de jardin')) return 'GartenpflegeIcon';
    if (noAccents.includes('bepflanzung') || noAccents.includes('plantation')) return 'BepflanzungIcon';

    return field?.icon || 'info';
};

const ContactFormSection = ({ 
    heading,
    formSchema = null,
    button: _defaultButtonLabel,
    language = 'DE'
}) => {
    const { t } = useLanguage();
    const location = useLocation();
    
    const [formData, setFormData] = useState({});
    const [selectedServices, setSelectedServices] = useState([]);
    const [errors, setErrors] = useState({});
    const [honeypotValue, setHoneypotValue] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');
    const [submitState, setSubmitState] = useState('idle');
    const [submitMessage, setSubmitMessage] = useState('');
    const formRef = useRef(null);
    const turnstileRef = useRef(null);
    const turnstileWidgetIdRef = useRef(null);

    // Ensure formSchema behaves predictably if it's a raw array (from a direct field mapping)
    const normalizedSchema = Array.isArray(formSchema) 
        ? { fields: formSchema } 
        : (formSchema || {});

    const { fields = [], submit_label, redirect_url } = normalizedSchema;
    const preselectedServiceKeys = useMemo(() => {
        const searchParams = new URLSearchParams(location.search);
        const raw = searchParams.get('services') || '';
        const fromQuery = decodeURIComponent(raw)
            .split(',')
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean);
        const fromState = Array.isArray(location.state?.preselectedServices)
            ? location.state.preselectedServices.map((item) => String(item).trim().toLowerCase()).filter(Boolean)
            : [];

        return [...new Set([...fromQuery, ...fromState])];
    }, [location.search, location.state]);
    const finalHeading = heading || t('contact.help_heading');
    const finalButtonLabel = t('contact.send');
    const checkboxFields = fields.filter(f => f.type === 'checkbox');
    const nonCheckboxFields = fields.filter(f => f.type !== 'checkbox');
    const settings = normalizedSchema.settings || {};
    const isSubmitting = submitState === 'submitting';
    const turnstileSiteKey =
        normalizedSchema.turnstile_site_key ||
        settings.turnstile_site_key ||
        import.meta.env.VITE_TURNSTILE_SITE_KEY ||
        '';

    useEffect(() => {
        setSubmitState('idle');
        setSubmitMessage('');
        setTurnstileToken('');
        setHoneypotValue('');
        setFormData({});
        setErrors({});
    }, [formSchema, language]);

    useEffect(() => {
        if (!settings.enable_turnstile || !turnstileRef.current || !turnstileSiteKey || typeof window === 'undefined' || !window.turnstile) {
            return;
        }

        if (turnstileWidgetIdRef.current !== null) {
            window.turnstile.remove(turnstileWidgetIdRef.current);
            turnstileWidgetIdRef.current = null;
        }

        turnstileWidgetIdRef.current = window.turnstile.render(turnstileRef.current, {
            sitekey: turnstileSiteKey,
            callback: (token) => setTurnstileToken(token),
            'expired-callback': () => setTurnstileToken(''),
            'error-callback': () => setTurnstileToken(''),
        });

        return () => {
            if (turnstileWidgetIdRef.current !== null && window.turnstile) {
                window.turnstile.remove(turnstileWidgetIdRef.current);
                turnstileWidgetIdRef.current = null;
            }
        };
    }, [settings.enable_turnstile, turnstileSiteKey, formSchema]);

    useEffect(() => {
        if (!fields.length || !preselectedServiceKeys.length) return;

        const nextFormData = {};
        const nextSelectedServices = [];

        fields.forEach((field) => {
            if (field.type === 'checkbox') {
                const fieldLabelClean = String(field.label || '').trim().toLowerCase();
                const fieldNameClean = String(field.name || '').trim().toLowerCase();
                if (preselectedServiceKeys.includes(fieldLabelClean) || preselectedServiceKeys.includes(fieldNameClean)) {
                    nextFormData[field.name] = true;
                    nextSelectedServices.push(field.name);
                }
            }

            if (field.type === 'checkbox_group' && Array.isArray(field.options)) {
                const matchedValues = field.options
                    .filter((option) => {
                        const optLabelClean = String(option.label || '').trim().toLowerCase();
                        const optValClean = String(option.value || '').trim().toLowerCase();
                        return preselectedServiceKeys.includes(optLabelClean) || preselectedServiceKeys.includes(optValClean);
                    })
                    .map((option) => option.value);

                if (matchedValues.length) {
                    nextFormData[field.name] = matchedValues;
                    nextSelectedServices.push(...matchedValues);
                }
            }
        });

        if (!Object.keys(nextFormData).length) return;

        setFormData((prev) => ({ ...prev, ...nextFormData }));
        setSelectedServices([...new Set(nextSelectedServices)]);
    }, [fields, preselectedServiceKeys]);

    // If no schema yet, show a skeleton or loading state
    if (!formSchema) {
        return (
            <div className="lg:col-span-8 reveal stagger-1">
                <div className="bg-white dark:bg-surface-dark p-10 md:p-16 border border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl min-h-[42rem]" />
                </div>
        );
    }

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (submitState !== 'idle') {
            setSubmitState('idle');
            setSubmitMessage('');
        }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!validateForm()) return;
        if (settings.enable_turnstile && !turnstileToken) {
            setSubmitState('error');
            setSubmitMessage(t('contact.turnstile_missing'));
            return;
        }

        try {
            setSubmitState('submitting');
            setSubmitMessage('');

            const payload = formRef.current ? new FormData(formRef.current) : new FormData();
            payload.set('website', honeypotValue || '');

            if (settings.enable_turnstile && turnstileToken) {
                payload.set('turnstile_token', turnstileToken);
                payload.set('cf_turnstile_response', turnstileToken);
            }

            const response = await submitForm('formular', payload, language);
            const redirectTarget =
                response?.redirect_url ||
                response?.redirectUrl ||
                response?.redirect ||
                redirect_url ||
                settings.redirect_url;

            if (redirectTarget && typeof window !== 'undefined') {
                window.location.assign(redirectTarget);
                return;
            }

            setSubmitState('success');
            setSubmitMessage(t('contact.success_body'));
            setFormData({});
            setSelectedServices([]);
            setErrors({});
            setHoneypotValue('');
            formRef.current?.reset();

            if (settings.enable_turnstile && window.turnstile && turnstileWidgetIdRef.current !== null) {
                window.turnstile.reset(turnstileWidgetIdRef.current);
                setTurnstileToken('');
            }
        } catch (error) {
            setSubmitState('error');
            setSubmitMessage(error?.message || t('contact.error_submit'));
        }
    };

    const toggleSingleCheckbox = (name) => {
        const nextValue = !formData[name];
        handleInputChange(name, nextValue);
    };

    const renderField = (field) => {
        const { type, label, name, placeholder, required, options = [] } = field;
        const hasError = errors[name];
        const fieldId = `contact-${name}`;

        switch (type) {
            case 'checkbox':
                return (
                    <label
                        key={name}
                        htmlFor={fieldId}
                        className={`relative border p-5 md:p-6 transition-all duration-300 cursor-pointer flex flex-col items-center text-center gap-3 rounded-xl ${
                            formData[name]
                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                : 'border-slate-200 bg-white hover:border-primary shadow-sm'
                        }`}
                    >
                        <input
                            id={fieldId}
                            type="checkbox"
                            name={name}
                            checked={!!formData[name]}
                            onChange={() => toggleSingleCheckbox(name)}
                            className="sr-only"
                            aria-checked={!!formData[name]}
                        />
                        <IconRenderer icon={getServiceIcon(field)} isSelected={!!formData[name]} />
                        <div>
                            <p className={`text-[10px] md:text-[13px] font-bold uppercase tracking-widest mb-1 ${formData[name] ? 'text-primary' : 'text-slate-700'}`}>
                                {label}
                            </p>
                        </div>
                    </label>
                );
            case 'checkbox_group':
                return (
                    <fieldset key={name} className="space-y-6 col-span-full">
                        {label && (
                            <legend className={`text-[10px] uppercase tracking-[0.2em] font-bold block ${hasError ? 'text-red-500' : 'text-muted-accessible'}`}>
                                {label} {required && '*'}
                            </legend>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            {options.map((opt) => (
                                <button
                                    type="button"
                                    key={opt.value}
                                    aria-pressed={selectedServices.includes(opt.value)}
                                    aria-label={opt.label}
                                    className={`relative border p-5 md:p-6 transition-all duration-300 cursor-pointer flex flex-col items-center text-center gap-3 rounded-xl ${
                                        selectedServices.includes(opt.value) 
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                                            : 'border-slate-200 bg-white hover:border-primary shadow-sm'
                                    }`}
                                    onClick={() => toggleService(name, opt.value)}
                                >
                                    <IconRenderer icon={opt.icon || 'info'} isSelected={selectedServices.includes(opt.value)} />
                                    <div>
                                        <p className={`text-[10px] md:text-[13px] font-bold uppercase tracking-widest mb-1 ${selectedServices.includes(opt.value) ? 'text-primary' : 'text-slate-700'}`}>
                                            {opt.label}
                                        </p>
                                        {opt.sub && <p className="text-[9px] md:text-[11px] text-muted-accessible uppercase tracking-widest leading-tight">{opt.sub}</p>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </fieldset>
                );

            case 'textarea':
                return (
                    <div key={name} className="relative col-span-full">
                        <label htmlFor={fieldId} className={`text-[10px] uppercase tracking-[0.2em] font-bold block mb-2 ${hasError ? 'text-red-500' : 'text-slate-500'}`}>
                            {label} {required && '*'}
                        </label>
                        <textarea 
                            id={fieldId}
                            rows="3" 
                            name={name}
                            className={`w-full bg-white border px-5 py-3.5 rounded-xl transition-colors text-base md:text-lg focus:ring-0 ${
                                hasError ? 'border-red-500 focus:border-red-600' : 'border-slate-200 focus:border-primary'
                            }`}
                            placeholder={placeholder}
                            value={formData[name] || ''}
                            onChange={(e) => handleInputChange(name, e.target.value)}
                            aria-invalid={hasError ? 'true' : 'false'}
                        />
                    </div>
                );

            default: // text, email, tel
                return (
                    <div key={name} className="relative">
                        <label htmlFor={fieldId} className={`text-[10px] uppercase tracking-[0.2em] font-bold block mb-2 ${hasError ? 'text-red-500' : 'text-slate-500'}`}>
                            {label} {required && '*'}
                        </label>
                        <input 
                            id={fieldId}
                            type={type} 
                            name={name}
                            className={`w-full bg-white border px-5 py-3.5 rounded-xl transition-colors text-base md:text-lg focus:ring-0 ${
                                hasError ? 'border-red-500 focus:border-red-600' : 'border-slate-200 focus:border-primary'
                            }`}
                            placeholder={placeholder || ''}
                            value={formData[name] || ''}
                            onChange={(e) => handleInputChange(name, e.target.value)}
                            aria-invalid={hasError ? 'true' : 'false'}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="lg:col-span-8 reveal stagger-1">
            <div className="bg-white dark:bg-surface-dark p-6 md:p-9 border border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl">
                <form ref={formRef} className="space-y-6 md:space-y-8" onSubmit={handleSubmit}>
                    <fieldset disabled={isSubmitting} className="space-y-6 md:space-y-8 disabled:opacity-70">
                        <div className="space-y-5 md:space-y-6">
                            <h2 className="text-xl md:text-2xl font-serif italic text-primary">{finalHeading}</h2>
                            {checkboxFields.length > 0 && (
                                <div className="grid grid-cols-2 gap-4">
                                    {checkboxFields.map(renderField)}
                                </div>
                            )}
                            {nonCheckboxFields.filter(f => f.type === 'checkbox_group').map(renderField)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {nonCheckboxFields.filter(f => f.type !== 'checkbox_group' && f.type !== 'textarea').map(renderField)}
                        </div>

                        {nonCheckboxFields.filter(f => f.type === 'textarea').map(renderField)}

                        {settings.enable_honeypot && (
                            <div className="hidden" aria-hidden="true">
                                <label htmlFor="website">Website</label>
                                <input
                                    id="website"
                                    name="website"
                                    type="text"
                                    tabIndex="-1"
                                    autoComplete="off"
                                    value={honeypotValue}
                                    onChange={(e) => setHoneypotValue(e.target.value)}
                                />
                            </div>
                        )}

                        {settings.enable_turnstile && (
                            <div className="space-y-3">
                                {turnstileSiteKey ? (
                                    <div ref={turnstileRef} />
                                ) : (
                                    <p className="text-sm text-red-600">{t('contact.turnstile_error')}</p>
                                )}
                            </div>
                        )}

                        <div className="pt-0 md:pt-2">
                            {submitState === 'success' ? (
                                <div className="w-full rounded-[2rem] border border-primary/15 bg-primary px-6 py-5 text-white shadow-lg shadow-primary/15 transition-all duration-500">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/12">
                                            <Icon name="check_circle" className="text-2xl motion-safe:animate-pulse" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/80">
                                                {t('contact.success_title')}
                                            </p>
                                            <p className="mt-1 text-base font-medium text-white">
                                                {submitMessage}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="min-h-0 md:min-h-[3.5rem] flex items-center">
                                        {submitState === 'error' && submitMessage && (
                                            <div className="inline-flex items-center gap-3 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
                                                <Icon name="error" className="text-base" />
                                                <span>{submitMessage}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-primary text-white w-full md:w-auto px-14 py-4 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-opacity-90 transition-colors flex items-center justify-center rounded-full shadow-lg disabled:cursor-not-allowed disabled:opacity-80"
                                    >
                                        {isSubmitting ? t('contact.sending') : finalButtonLabel}
                                    </button>
                                </div>
                            )}
                        </div>
                    </fieldset>
                </form>
            </div>
        </div>
    );
};

export default ContactFormSection;
