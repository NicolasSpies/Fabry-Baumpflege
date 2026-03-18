import baumfaellungKettenis from '@/assets/images/references/thumb_baumfaellung_kettenis.png';
import baumfaellungKettenisBefore from '@/assets/images/references/before_baumfaellung_kettenis.png';
import baumfaellungKettenisAfter from '@/assets/images/references/after_baumfaellung_kettenis.png';

import neuanlageKelmis from '@/assets/images/references/thumb_neuanlage_kelmis.png';
import neuanlageKelmisBefore from '@/assets/images/references/before_neuanlage_kelmis.png';
import neuanlageKelmisAfter from '@/assets/images/references/after_neuanlage_kelmis.png';

import parkpflegeLontzen from '@/assets/images/references/thumb_parkpflege_lontzen.png';
import parkpflegeLontzenBefore from '@/assets/images/references/before_parkpflege_lontzen.png';
import parkpflegeLontzenAfter from '@/assets/images/references/after_parkpflege_lontzen.png';

import pflegeEupen from '@/assets/images/references/thumb_pflege_eupen.png';
import pflegeEupenBefore from '@/assets/images/references/before_pflege_eupen.png';
import pflegeEupenAfter from '@/assets/images/references/after_pflege_eupen.png';

import privatgartenRaeren from '@/assets/images/references/thumb_privatgarten_raeren.png';
import privatgartenRaerenBefore from '@/assets/images/references/before_privatgarten_raeren.png';
import privatgartenRaerenAfter from '@/assets/images/references/after_privatgarten_raeren.png';

import residenzEupen from '@/assets/images/references/thumb_residenz_eupen.png';
import residenzEupenBefore from '@/assets/images/references/before_residenz_eupen.png';
import residenzEupenAfter from '@/assets/images/references/after_residenz_eupen.png';

import gallery1Residenz from '@/assets/images/references/gallery1_residenz_eupen.png';
import gallery2Residenz from '@/assets/images/references/gallery_stump_grinding.png';
import gallery3Residenz from '@/assets/images/references/gallery_tree_assessment.png';
import gallery4Residenz from '@/assets/images/references/gallery_branch_lowering.png';
import gallery5Residenz from '@/assets/images/references/gallery_planting_mulch.png';

export const references = [
    {
        id: 'baumfaellung-kettenis',
        slug: 'baumfaellung-kettenis',
        title: { de: 'Baumfällung Kettenis', fr: 'Abattage à Kettenis' },
        description: { 
            de: 'Sicherheitsfällung einer großen Fichte in unmittelbarer Nähe eines Wohnhauses.',
            fr: 'Abattage de sécurité d\'un grand épicéa à proximité immédiate d\'une maison d\'habitation.'
        },
        location: 'Kettenis',
        date: '2023-11-12',
        categories: ['baumfaellung'],
        thumbnailImage: baumfaellungKettenis,
        beforeImage: baumfaellungKettenisBefore,
        afterImage: baumfaellungKettenisAfter,
        challenge: {
            de: 'Die Fichte neigte sich stark zum Nachbarhaus. Mittels Seilklettertechnik wurde der Baum stückweise abgetragen.',
            fr: 'L\'épicéa penchait fortement vers la maison voisine. L\'arbre a été démonté morceau par morceau par technique de grimpe.'
        },
        gallery: [gallery2Residenz, gallery3Residenz, gallery4Residenz]
    },
    {
        id: 'neuanlage-kelmis',
        slug: 'neuanlage-kelmis',
        title: { de: 'Garten-Neuanlage Kelmis', fr: 'Nouvel aménagement à La Calamine' },
        description: {
            de: 'Komplette Neugestaltung eines modernen Privatgartens inkl. Bepflanzung.',
            fr: 'Réaménagement complet d\'un jardin privé moderne, y compris les plantations.'
        },
        location: 'Kelmis',
        date: '2023-09-20',
        categories: ['bepflanzung', 'gartenpflege'],
        thumbnailImage: neuanlageKelmis,
        beforeImage: neuanlageKelmisBefore,
        afterImage: neuanlageKelmisAfter,
        challenge: {
            de: 'Schaffung einer pflegeleichten und dennoch ökologisch wertvollen Grünfläche.',
            fr: 'Création d\'un espace vert facile d\'entretien mais de grande valeur écologique.'
        },
        gallery: [gallery5Residenz, gallery1Residenz, gallery2Residenz]
    },
    {
        id: 'parkpflege-lontzen',
        slug: 'parkpflege-lontzen',
        title: { de: 'Parkpflege Lontzen', fr: 'Entretien de parc à Lontzen' },
        description: {
            de: 'Umfassende Kronenpflege und Verjüngungsschnitt im Schlosspark.',
            fr: 'Soin complet des couronnes et taille de rajeunissement dans le parc du château.'
        },
        location: 'Lontzen',
        date: '2023-05-15',
        categories: ['baumpflege'],
        thumbnailImage: parkpflegeLontzen,
        beforeImage: parkpflegeLontzenBefore,
        afterImage: parkpflegeLontzenAfter,
        challenge: {
            de: 'Erhalt des historischen Baumbestands durch fachgerechte Entlastungsschnitte.',
            fr: 'Préservation du patrimoine arboré historique grâce à des tailles de délestage professionnelles.'
        },
        gallery: [gallery3Residenz, gallery4Residenz, gallery5Residenz]
    },
    {
        id: 'pflege-eupen',
        slug: 'pflege-eupen',
        title: { de: 'Baumpflege Eupen', fr: 'Soin des arbres à Eupen' },
        description: {
            de: 'Totholzentfernung und Lichtraumprofilschnitt an einer alten Eiche.',
            fr: 'Suppression du bois mort et taille de gabarit sur un chêne ancien.'
        },
        location: 'Eupen',
        date: '2023-03-10',
        categories: ['baumpflege'],
        thumbnailImage: pflegeEupen,
        beforeImage: pflegeEupenBefore,
        afterImage: pflegeEupenAfter,
        challenge: {
            de: 'Sicherstellung der Verkehrssicherheit im öffentlichen Raum.',
            fr: 'Garantir la sécurité routière dans l\'espace public.'
        },
        gallery: [gallery1Residenz, gallery2Residenz, gallery3Residenz]
    },
    {
        id: 'privatgarten-raeren',
        slug: 'privatgarten-raeren',
        title: { de: 'Privatgarten Raeren', fr: 'Jardin privé à Raeren' },
        description: {
            de: 'Regelmäßige Gartenpflege und Heckenschnitt in einem weitläufigen Anwesen.',
            fr: 'Entretien régulier du jardin et taille des haies dans une vaste propriété.'
        },
        location: 'Raeren',
        date: '2023-08-05',
        categories: ['gartenpflege'],
        thumbnailImage: privatgartenRaeren,
        beforeImage: privatgartenRaerenBefore,
        afterImage: privatgartenRaerenAfter,
        challenge: {
            de: 'Präzise Formschnitte an großen Hainbuchenhecken.',
            fr: 'Tailles de formation précises sur de grandes haies de charmes.'
        },
        gallery: [gallery4Residenz, gallery5Residenz, gallery1Residenz]
    },
    {
        id: 'residenz-eupen',
        slug: 'residenz-eupen',
        title: { de: 'Residenz Eupen', fr: 'Résidence à Eupen' },
        description: {
            de: 'Großflächiges Wurzelstockfräsen und Vorbereitung für Neupflanzungen.',
            fr: 'Essouchage à grande échelle et préparation pour de nouvelles plantations.'
        },
        location: 'Eupen',
        date: '2023-06-25',
        categories: ['baumfaellung', 'bepflanzung'],
        thumbnailImage: residenzEupen,
        beforeImage: residenzEupenBefore,
        afterImage: residenzEupenAfter,
        challenge: {
            de: 'Schonung der umliegenden Bausubstanz bei schweren Rodungsarbeiten.',
            fr: 'Préservation des bâtiments environnants lors de travaux de dessouchage lourds.'
        },
        gallery: [gallery1Residenz, gallery2Residenz, gallery3Residenz, gallery4Residenz, gallery5Residenz]
    }
];

export const referenceCategories = [
    { id: 'baumpflege', name: { de: 'Baumpflege', fr: 'Soin des arbres' }, slug: 'baumpflege' },
    { id: 'baumfaellung', name: { de: 'Baumfällung', fr: 'Abattage' }, slug: 'baumfaellung' },
    { id: 'gartenpflege', name: { de: 'Gartenpflege', fr: 'Entretien' }, slug: 'gartenpflege' },
    { id: 'bepflanzung', name: { de: 'Bepflanzung', fr: 'Plantation' }, slug: 'bepflanzung' }
];
