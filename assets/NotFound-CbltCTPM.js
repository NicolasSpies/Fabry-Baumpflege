import{u as i,r as o,j as e,L as n,w as l}from"./index-DRLhjmOc.js";const r={DE:{title:"Hier wächst nichts mehr",subtitle:"Die Seite, die du suchst, wurde wohl schon abgeholzt.",cta:"Zurück zur Startseite"},FR:{title:"Plus rien ne pousse ici",subtitle:"La page que tu cherches a dû être abattue.",cta:"Retour à l'accueil"}},d=()=>{const{language:a,setPageReady:s}=i(),t=r[a]||r.DE;return o.useEffect(()=>{s(!0)},[]),e.jsxs("main",{className:"pt-28 pb-24 md:pb-32 min-h-[75vh] flex flex-col items-center justify-center px-6 text-center",children:[e.jsxs("div",{className:"seedling-scene mb-8","aria-hidden":"true",children:[e.jsx("div",{className:"seedling-pot",children:e.jsx("div",{className:"seedling-dirt"})}),e.jsx("div",{className:"seedling-stem"}),e.jsx("div",{className:"seedling-leaf seedling-leaf-left"}),e.jsx("div",{className:"seedling-leaf seedling-leaf-right"})]}),e.jsx("h1",{className:"text-7xl md:text-9xl font-serif text-primary/20 font-bold leading-none hero-enter hero-enter-1",children:"404"}),e.jsx("h2",{className:"text-2xl md:text-3xl font-serif text-primary mt-4 hero-enter hero-enter-2",children:t.title}),e.jsx("p",{className:"text-slate-500 mt-3 max-w-md text-base md:text-lg hero-enter hero-enter-2",children:t.subtitle}),e.jsx(n,{to:l[a].home,className:"mt-10 inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors duration-300 text-sm uppercase tracking-widest hero-enter hero-enter-3",children:t.cta}),e.jsx("style",{children:`
                .seedling-scene {
                    position: relative;
                    width: 120px;
                    height: 140px;
                }

                /* Pot — above stem and leaves */
                .seedling-pot {
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 3;
                    width: 60px;
                    height: 40px;
                    background: linear-gradient(to bottom, #c4956a, #a87a52);
                    border-radius: 0 0 8px 8px;
                    overflow: hidden;
                }
                .seedling-pot::before {
                    content: '';
                    position: absolute;
                    top: -6px;
                    left: -4px;
                    right: -4px;
                    height: 10px;
                    background: #a87a52;
                    border-radius: 3px;
                }
                .seedling-dirt {
                    position: absolute;
                    top: 4px;
                    left: 4px;
                    right: 4px;
                    height: 14px;
                    background: #5c3d2e;
                    border-radius: 2px 2px 0 0;
                }

                /* Stem */
                .seedling-stem {
                    z-index: 1;
                    position: absolute;
                    bottom: 36px;
                    left: 50%;
                    width: 4px;
                    height: 60px;
                    margin-left: -2px;
                    background: linear-gradient(to top, #6b8f3c, #8ab34a);
                    border-radius: 2px;
                    transform-origin: bottom center;
                    animation: stemLife 10s ease infinite;
                }

                /* Leaves — positioned in scene at stem attachment points */
                .seedling-leaf {
                    position: absolute;
                    width: 20px;
                    height: 12px;
                    background: #8ab34a;
                    opacity: 0;
                    z-index: 2;
                }
                /* Left leaf — attached to upper-left of stem */
                .seedling-leaf-left {
                    bottom: 84px;
                    left: 50%;
                    margin-left: -22px;
                    border-radius: 50% 50% 50% 0;
                    transform-origin: right center;
                    animation: leafLeftLife 10s ease infinite;
                }
                /* Right leaf — attached slightly lower, right side of stem */
                .seedling-leaf-right {
                    bottom: 74px;
                    left: 50%;
                    margin-left: 2px;
                    border-radius: 50% 50% 0 50%;
                    transform-origin: left center;
                    animation: leafRightLife 10s ease infinite;
                }

                /* Stem: grow → hold → wither → pause → repeat
                   Active phase: 0-65%, Pause: 65-100% */
                @keyframes stemLife {
                    0% { height: 0; opacity: 0; transform: rotate(0deg); filter: saturate(1) brightness(1); }
                    3% { opacity: 1; }
                    15% { height: 60px; opacity: 1; transform: rotate(0deg); filter: saturate(1) brightness(1); }
                    /* alive */
                    38% { height: 60px; transform: rotate(0deg); filter: saturate(0.8) brightness(0.9); }
                    /* withering */
                    48% { height: 45px; transform: rotate(10deg); filter: saturate(0.3) brightness(0.65); }
                    58% { height: 25px; transform: rotate(18deg); filter: saturate(0.1) brightness(0.5); opacity: 0.45; }
                    65% { height: 14px; transform: rotate(22deg); filter: saturate(0) brightness(0.4); opacity: 0; }
                    /* pause */
                    100% { height: 0; opacity: 0; transform: rotate(0deg); filter: saturate(1) brightness(1); }
                }

                /* Left leaf: sprout → hold → dry → fall → pause
                   Delayed start via keyframes (starts at 10%) */
                @keyframes leafLeftLife {
                    0% { opacity: 0; transform: scale(0); }
                    10% { opacity: 0; transform: scale(0); }
                    16% { opacity: 1; transform: scale(1); }
                    /* alive */
                    28% { opacity: 1; transform: scale(1) rotate(0deg); filter: saturate(1) brightness(1); }
                    /* drying */
                    35% { opacity: 0.9; transform: scale(0.9) rotate(15deg); filter: saturate(0.3) brightness(0.75); }
                    /* drooping */
                    43% { opacity: 0.7; transform: scale(0.8) rotate(50deg) translateY(10px); filter: saturate(0.1) brightness(0.6); }
                    /* falls off */
                    50% { opacity: 0.2; transform: scale(0.6) rotate(70deg) translateY(45px); filter: saturate(0) brightness(0.5); }
                    55% { opacity: 0; transform: scale(0.5) rotate(80deg) translateY(60px); }
                    /* pause */
                    100% { opacity: 0; transform: scale(0); }
                }

                /* Right leaf: same but slightly later start */
                @keyframes leafRightLife {
                    0% { opacity: 0; transform: scale(0); }
                    13% { opacity: 0; transform: scale(0); }
                    19% { opacity: 1; transform: scale(1); }
                    /* alive */
                    27% { opacity: 1; transform: scale(1) rotate(0deg); filter: saturate(1) brightness(1); }
                    /* drying */
                    34% { opacity: 0.9; transform: scale(0.9) rotate(-15deg); filter: saturate(0.3) brightness(0.75); }
                    /* drooping */
                    42% { opacity: 0.7; transform: scale(0.8) rotate(-50deg) translateY(10px); filter: saturate(0.1) brightness(0.6); }
                    /* falls off */
                    49% { opacity: 0.2; transform: scale(0.6) rotate(-70deg) translateY(45px); filter: saturate(0) brightness(0.5); }
                    54% { opacity: 0; transform: scale(0.5) rotate(-80deg) translateY(60px); }
                    /* pause */
                    100% { opacity: 0; transform: scale(0); }
                }
            `})]})};export{d as default};
