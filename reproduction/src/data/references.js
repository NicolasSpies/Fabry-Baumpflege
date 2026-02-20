import thumbResidenzEupen from '../assets/images/references/thumb_residenz_eupen.png';
import beforeResidenzEupen from '../assets/images/references/before_residenz_eupen.png';
import afterResidenzEupen from '../assets/images/references/after_residenz_eupen.png';
import gallery1ResidenzEupen from '../assets/images/references/gallery1_residenz_eupen.png';

import thumbPrivatgartenRaeren from '../assets/images/references/thumb_privatgarten_raeren.png';
import beforePrivatgartenRaeren from '../assets/images/references/before_privatgarten_raeren.png';
import afterPrivatgartenRaeren from '../assets/images/references/after_privatgarten_raeren.png';

import thumbBaumfaellungKettenis from '../assets/images/references/thumb_baumfaellung_kettenis.png';
import beforeBaumfaellungKettenis from '../assets/images/references/before_baumfaellung_kettenis.png';
import afterBaumfaellungKettenis from '../assets/images/references/after_baumfaellung_kettenis.png';

import thumbParkpflegeLontzen from '../assets/images/references/thumb_parkpflege_lontzen.png';
import beforeParkpflegeLontzen from '../assets/images/references/before_parkpflege_lontzen.png';
import afterParkpflegeLontzen from '../assets/images/references/after_parkpflege_lontzen.png';

import thumbNeuanlageKelmis from '../assets/images/references/thumb_neuanlage_kelmis.png';
import beforeNeuanlageKelmis from '../assets/images/references/before_neuanlage_kelmis.png';
import afterNeuanlageKelmis from '../assets/images/references/after_neuanlage_kelmis.png';

import thumbPflegeEupen from '../assets/images/references/thumb_pflege_eupen.png';
import beforePflegeEupen from '../assets/images/references/before_pflege_eupen.png';
import afterPflegeEupen from '../assets/images/references/after_pflege_eupen.png';

import galleryBranchLowering from '../assets/images/references/gallery_branch_lowering.png';
import galleryStumpGrinding from '../assets/images/references/gallery_stump_grinding.png';
import galleryTreeAssessment from '../assets/images/references/gallery_tree_assessment.png';
import galleryPlantingMulch from '../assets/images/references/gallery_planting_mulch.png';

export const references = [
    {
        id: "schlossgarten-park",
        title: "Residenz Eupen",
        titleFR: "Résidence Eupen",
        location: "Eupen",
        categories: ["Baumpflege", "Gartenbau"],
        categoriesFR: ["Arboriculture", "Horticulture"],
        description: "Kronensicherung & Erhaltungsschnitt",
        descriptionFR: "Sécurisation de la couronne & taille d'entretien",
        thumbnailImage: thumbResidenzEupen,
        headerImage: thumbResidenzEupen,
        beforeImage: beforeResidenzEupen,
        afterImage: afterResidenzEupen,
        galleryImages: [
            thumbResidenzEupen,
            gallery1ResidenzEupen,
            galleryBranchLowering,
            galleryTreeAssessment
        ],
        challengeDE: "Bei diesem Projekt handelte es sich um eine über 80 Jahre alte Buche, die aufgrund von Pilzbefall im Stammfußbereich die Verkehrssicherheit nicht mehr gewährleisten konnte. Die besondere Herausforderung lag in der unmittelbaren Nähe zu einem Gebäude.",
        challengeFR: "Ce projet concernait un hêtre de plus de 80 ans qui, en raison d'une attaque fongique à la base du tronc, ne pouvait plus garantir la sécurité du trafic. Le défi particulier résidait dans la proximité immédiate d'un bâtiment.",
        implementationDE: "Unser Team entschied sich für eine kontrollierte Abtragung mittels Seilklettertechnik (SKT). Dabei wurde jeder Ast einzeln abgeseilt, um Beschädigungen an der umliegenden Architektur zu vermeiden. Durch präzise Planung wurde die Arbeit sicher abgeschlossen.",
        implementationFR: "Notre équipe a opté pour un démontage contrôlé par technique de grimpe (SKT). Chaque branche a été descendue individuellement pour éviter tout dommage à l'architecture environnante. Grâce à une planification précise, le travail a été achevé en toute sécurité.",
        wide: false,
        tall: true
    },
    {
        id: "residenz-baldeneysee",
        title: "Privatgarten Raeren",
        titleFR: "Jardin privé Raeren",
        location: "Raeren",
        categories: ["Gartenbau"],
        categoriesFR: ["Horticulture"],
        description: "Ganzjährige Pflege",
        descriptionFR: "Entretien toute l'année",
        thumbnailImage: thumbPrivatgartenRaeren,
        headerImage: thumbPrivatgartenRaeren,
        beforeImage: beforePrivatgartenRaeren,
        afterImage: afterPrivatgartenRaeren,
        galleryImages: [
            thumbPrivatgartenRaeren,
            galleryStumpGrinding,
            galleryPlantingMulch,
            galleryTreeAssessment
        ],
        challengeDE: "Ein verwilderter Privatgarten in Raeren sollte in eine gepflegte Wohlfühloase verwandelt werden. Der Rasen war voller Moos und die Hecken hatten seit Jahren keinen Formschnitt mehr erhalten.",
        challengeFR: "Un jardin privé à Raeren devait être transformé en une oasis de bien-être soignée. La pelouse était envahie par la mousse et les haies n'avaient pas été taillées depuis des années.",
        implementationDE: "Wir führten eine umfassende Grundreinigung durch, vertikutierten den Rasen und gaben den Hecken ihren architektonischen Schnitt zurück. Ein dauerhafter Pflegeplan sorgt nun für konstante Ästhetik.",
        implementationFR: "Nous avons effectué un nettoyage complet, scarifié la pelouse et redonné aux haies leur coupe architecturale. Un plan d'entretien permanent assure désormais une esthétique constante.",
        wide: false,
        tall: false
    },
    {
        id: "grossbaumfaellung-duesseldorf",
        title: "Baumfällung Kettenis",
        titleFR: "Abattage Kettenis",
        location: "Kettenis",
        categories: ["Baumfällung"],
        categoriesFR: ["Abattage"],
        description: "Präzisionsarbeit mittels Seilklettertechnik",
        descriptionFR: "Travail de précision par technique de grimpe",
        thumbnailImage: thumbBaumfaellungKettenis,
        headerImage: thumbBaumfaellungKettenis,
        beforeImage: beforeBaumfaellungKettenis,
        afterImage: afterBaumfaellungKettenis,
        galleryImages: [
            thumbBaumfaellungKettenis,
            galleryBranchLowering,
            galleryStumpGrinding,
            galleryTreeAssessment
        ],
        challengeDE: "In einer engen Wohnsiedlung in Kettenis musste eine große, instabile Eiche gefällt werden. Da kein Kran Zugang hatte, war höchste Präzision gefordert.",
        challengeFR: "Dans un lotissement étroit à Kettenis, un grand chêne instable devait être abattu. Comme aucun camion-grue n'avait accès, une précision maximale était requise.",
        implementationDE: "Mittels Seilklettertechnik wurde der Baum von oben nach unten stückweise abgetragen. Dank professioneller Seiltechnik konnten alle Stammteile punktgenau gelandet werden.",
        implementationFR: "Le démontage a été effectué de haut en bas par technique de grimpe. Grâce à une technique de rétention professionnelle, toutes les sections du tronc ont pu être descendues précisément.",
        wide: true,
        tall: false
    },
    {
        id: "historische-baumallee",
        title: "Parkpflege Lontzen",
        titleFR: "Entretien du parc Lontzen",
        location: "Lontzen",
        categories: ["Baumpflege", "Pflanzung"],
        categoriesFR: ["Arboriculture", "Plantation"],
        description: "Erhaltung historischer Substanz",
        descriptionFR: "Préservation de la substance historique",
        thumbnailImage: thumbParkpflegeLontzen,
        headerImage: thumbParkpflegeLontzen,
        beforeImage: beforeParkpflegeLontzen,
        afterImage: afterParkpflegeLontzen,
        galleryImages: [
            thumbParkpflegeLontzen,
            galleryBranchLowering,
            galleryTreeAssessment,
            galleryPlantingMulch
        ],
        challengeDE: "Ein historischer Park in Lontzen litt unter vernachlässigter Baumpflege. Totholz in den alten Eichen stellte eine Gefahr für die Besucher dar.",
        challengeFR: "Un parc historique à Lontzen souffrait d'un manque d'entretien. Le bois mort dans les vieux chênes représentait un danger pour les visiteurs.",
        implementationDE: "Wir führten eine fachgerechte Totholzentfernung und Kronenpflege an den historischen Bäumen durch. Zudem wurden neue, standortgerechte Bäume gepflanzt, um den Parkcharakter zu erhalten.",
        implementationFR: "Nous avons procédé à l'enlèvement du bois mort et à la taille de formation des arbres historiques. De plus, de nouveaux arbres adaptés au site ont été plantés pour préserver le caractère du parc.",
        wide: false,
        tall: false
    },
    {
        id: "stadtbegruenung-zentrum",
        title: "Gartenneuanlage Kelmis",
        titleFR: "Nouveaux jardins Kelmis",
        location: "Kelmis",
        categories: ["Pflanzung", "Gartenbau"],
        categoriesFR: ["Plantation", "Horticulture"],
        description: "Nachhaltige Stadtgestaltung",
        descriptionFR: "Aménagement urbain durable",
        thumbnailImage: thumbNeuanlageKelmis,
        headerImage: thumbNeuanlageKelmis,
        beforeImage: beforeNeuanlageKelmis,
        afterImage: afterNeuanlageKelmis,
        galleryImages: [
            thumbNeuanlageKelmis,
            galleryPlantingMulch,
            galleryTreeAssessment,
            galleryStumpGrinding
        ],
        challengeDE: "Nach Abschluss eines Neubauprojekts in Kelmis sollte eine moderne, pflegeleichte Außenanlage geschaffen werden. Die Fläche war zuvor reines Bauland ohne Bewuchs.",
        challengeFR: "Après l'achèvement d'un projet de construction neuve à Kelmis, un aménagement extérieur moderne et facile d'entretien devait être créé. Le terrain était auparavant un terrain à bâtir nu.",
        implementationDE: "Wir modellierten das Gelände, verlegten Fertigrasen und pflanzten eine Auswahl an klimaresilienten Bäumen und Stauden. Eine automatische Bewässerung sorgt nun für optimales Wachstum.",
        implementationFR: "Nous avons modelé le terrain, posé du gazon en plaques et planté une sélection d'arbres et de vivaces résilients au climat. Un arrosage automatique assure désormais une croissance optimale.",
        wide: false,
        tall: false
    },
    {
        id: "privatgarten-luxus",
        title: "Umfassende Pflege Eupen",
        titleFR: "Entretien complet Eupen",
        location: "Eupen",
        categories: ["Gartenbau", "Baumpflege"],
        categoriesFR: ["Horticulture", "Arboriculture"],
        description: "Ganzjährige Pflege & Formgestaltung",
        descriptionFR: "Entretien toute l'année & mise en forme",
        thumbnailImage: thumbPflegeEupen,
        headerImage: thumbPflegeEupen,
        beforeImage: beforePflegeEupen,
        afterImage: afterPflegeEupen,
        galleryImages: [
            thumbPflegeEupen,
            galleryPlantingMulch,
            galleryStumpGrinding,
            galleryTreeAssessment
        ],
        challengeDE: "Dieser anspruchsvolle Privatgarten in Eupen benötigt ein hohes Maß an gärtnerischer Präzision. Besonders die zahlreichen Formgehölze drohten ihre Form zu verlieren.",
        challengeFR: "Ce jardin privé exigeant à Eupen nécessite un haut niveau de précision horticole. En particulier, les nombreux arbustes façonnés menaçaient de perdre leur forme.",
        implementationDE: "Durch regelmäßigen, fachgerechten Formschnitt und eine abgestimmte Düngung halten wir die Gartenanlage das ganze Jahr über auf höchstem Niveau.",
        implementationFR: "Grâce à une taille régulière et professionnelle des formes et à une fertilisation adaptée, nous maintenons le jardin au plus haut niveau tout au long de l'année.",
        wide: false,
        tall: true
    }
];
