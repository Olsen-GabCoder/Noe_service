import { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '../components/Icon';
import { Card, Button, useToast } from '../components/Primitives';
import { saveCadrageResponses, fetchMyCadrageResponses } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'noe_cadrage_responses';

// ── Données du questionnaire (11 sections, 45 questions) ─────
const SECTIONS = [
  {
    id: 's1', title: 'Identite et coeur de metier', icon: 'star', color: '#1B4F8C',
    description: 'Dites-nous qui vous etes et ce que vous faites.',
    questions: [
      { id: 'q1_1', label: 'Quel est le statut juridique de Noe Services ?', type: 'radio',
        options: ['Entreprise individuelle', 'SARL', 'SA', 'SAS'], hasOther: true },
      { id: 'q1_2', label: 'Depuis quelle annee Noe Services est-elle en activite ?', type: 'radio',
        options: ['Moins d\'1 an', '1 a 3 ans', '3 a 5 ans', '5 a 10 ans', 'Plus de 10 ans'] },
      { id: 'q1_3', label: 'Quel est le coeur de metier principal ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Vente d\'equipements de securite (EPI, extincteurs, detecteurs, etc.)', 'Vente d\'equipements de protection individuelle uniquement', 'Installation de systemes de securite (cameras, alarmes, controle d\'acces)', 'Maintenance et entretien d\'equipements de securite', 'Formation en securite (incendie, SST, etc.)', 'Conseil et audit en securite', 'Distribution / grossiste multi-produits', 'Import-export d\'equipements'], hasOther: true },
      { id: 'q1_4', label: 'Quels types de produits commercialisez-vous ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Extincteurs et materiel anti-incendie', 'Equipements de protection individuelle (casques, gants, chaussures, gilets, lunettes, harnais)', 'Vetements de travail et uniformes', 'Signalisation et balisage de securite', 'Cameras de surveillance / videosurveillance', 'Systemes d\'alarme et detection (incendie, intrusion, gaz)', 'Controle d\'acces (badges, biometrie, barrieres)', 'Materiel de premiers secours (trousses, defibrillateurs, brancards)', 'Produits chimiques / entretien industriel', 'Outillage et materiel technique', 'Mobilier et equipement de bureau', 'Consommables (piles, ampoules, cartouches, etc.)'], hasOther: true },
      { id: 'q1_5', label: 'Proposez-vous des services en plus de la vente ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Non, uniquement de la vente de produits', 'Installation sur site', 'Maintenance et reparation', 'Formation du personnel client', 'Audit et diagnostic securite', 'Location de materiel', 'Contrats de maintenance annuels', 'Service apres-vente / garantie'], hasOther: true },
    ],
  },
  {
    id: 's2', title: 'Structure et organisation', icon: 'users', color: '#7C3AED',
    description: 'Votre equipe, vos postes, vos besoins d\'acces.',
    questions: [
      { id: 'q2_1', label: 'Combien de personnes travaillent chez Noe Services ?', type: 'radio',
        options: ['1 a 5', '6 a 10', '11 a 20', '21 a 50', 'Plus de 50'] },
      { id: 'q2_2', label: 'Quels postes existent dans l\'equipe ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Directeur / Gerant', 'Responsable commercial / ventes', 'Commerciaux / vendeurs terrain', 'Responsable logistique / stock', 'Magasinier(s)', 'Livreurs / chauffeurs', 'Techniciens (installation, maintenance)', 'Comptable / responsable financier', 'Secretaire / assistante administrative', 'Caissier(e)', 'Responsable achats / approvisionnement'], hasOther: true },
      { id: 'q2_3', label: 'Qui utilisera l\'application au quotidien ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Le directeur / gerant uniquement', 'Le responsable commercial', 'Les commerciaux terrain (sur telephone)', 'Le/la responsable stock / magasinier', 'Le/la comptable', 'Tout le monde'], hasOther: true },
      { id: 'q2_4', label: 'Combien de personnes utiliseront l\'application simultanement ?', type: 'radio',
        options: ['1 a 2', '3 a 5', '6 a 10', 'Plus de 10'] },
    ],
  },
  {
    id: 's3', title: 'Logistique et depots', icon: 'box', color: '#1F9D6B',
    description: 'Vos locaux, votre gestion de stock actuelle, vos livraisons.',
    questions: [
      { id: 'q3_1', label: 'Combien de sites / depots possedez-vous ?', type: 'radio',
        options: ['1 seul (Moanda)', '2', '3', 'Plus de 3'], hasOther: true, otherLabel: 'Preciser les villes' },
      { id: 'q3_2', label: 'Quel type de local utilisez-vous ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Entrepot / magasin de stockage', 'Boutique / showroom avec vente directe', 'Bureau uniquement (livraison depuis fournisseur)', 'Conteneur / hangar'], hasOther: true },
      { id: 'q3_3', label: 'Projets d\'ouverture de nouveaux depots ?', type: 'radio',
        options: ['Non, pas pour le moment', 'Oui, dans les 6 prochains mois', 'Oui, dans l\'annee', 'A l\'etude, pas de date fixee'], hasOther: true, otherLabel: 'Villes envisagees' },
      { id: 'q3_4', label: 'Comment gerez-vous votre stock actuellement ?', type: 'radio',
        options: ['Cahier / registre papier', 'Fichier Excel', 'Logiciel de gestion', 'Pas de gestion formelle / de tete'], hasOther: true, otherLabel: 'Preciser le logiciel' },
      { id: 'q3_5', label: 'Faites-vous des inventaires ?', type: 'radio',
        options: ['Non, jamais', 'Oui, une fois par an', 'Oui, tous les trimestres', 'Oui, tous les mois', 'Oui, en continu (chaque semaine)'] },
      { id: 'q3_6', label: 'Livrez-vous les clients ?', type: 'radio',
        options: ['Non, les clients viennent chercher sur place', 'Oui, dans Moanda et environs', 'Oui, dans toute la province', 'Oui, dans tout le Gabon', 'Oui, y compris hors du Gabon', 'Ca depend du client et de la commande'] },
    ],
  },
  {
    id: 's4', title: 'Clients et marche', icon: 'target', color: '#E08200',
    description: 'Vos clients, votre marche, votre zone d\'intervention.',
    questions: [
      { id: 'q4_1', label: 'Qui sont vos clients principaux ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Entreprises minieres (Comilog, Eramet, etc.)', 'Entreprises petrolieres / gaz', 'Entreprises du BTP / construction', 'Industries et usines', 'Administrations publiques / Etat', 'Hopitaux, cliniques, centres de sante', 'Etablissements scolaires', 'Hotels et restaurants', 'Commerces et supermarches', 'Particuliers', 'ONG et organisations internationales'], hasOther: true },
      { id: 'q4_2', label: 'Repartition de votre clientele ?', type: 'radio',
        options: ['Majoritairement des entreprises (B2B > 80%)', 'Majoritairement des particuliers (B2C > 80%)', 'Mix equilibre entreprises / particuliers', 'Uniquement des entreprises', 'Uniquement des particuliers'] },
      { id: 'q4_3', label: 'Combien de clients actifs avez-vous ?', type: 'radio',
        options: ['Moins de 10', '10 a 30', '30 a 100', '100 a 500', 'Plus de 500'] },
      { id: 'q4_4', label: 'Avez-vous des clients reguliers / sous contrat ?', type: 'radio',
        options: ['Non, chaque vente est ponctuelle', 'Oui, quelques clients reguliers mais sans contrat', 'Oui, des clients sous contrat annuel', 'Oui, des contrats de maintenance / renouvellement periodique', 'Mix de tout'] },
      { id: 'q4_5', label: 'Zone geographique d\'intervention ?', type: 'radio',
        options: ['Moanda uniquement', 'Moanda et Franceville', 'Province du Haut-Ogooue', 'Plusieurs provinces du Gabon', 'Tout le Gabon', 'Gabon + pays voisins'], hasOther: true, otherLabel: 'Preciser' },
    ],
  },
  {
    id: 's5', title: 'Vente et processus commercial', icon: 'chart', color: '#D8334A',
    description: 'Comment vous vendez, facturez et encaissez.',
    questions: [
      { id: 'q5_1', label: 'Comment vos clients passent-ils commande ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['En se presentant au magasin / depot', 'Par telephone', 'Par WhatsApp', 'Par email', 'Via un commercial terrain', 'Via un site web / plateforme en ligne', 'Par appel d\'offres / consultation'], hasOther: true },
      { id: 'q5_2', label: 'Comment etablissez-vous vos prix ?', type: 'radio',
        options: ['Prix fixes pour tous (catalogue)', 'Prix negocies au cas par cas', 'Grille tarifaire avec remises volume', 'Prix differents selon le type de client', 'Devis systematique', 'Combinaison de plusieurs methodes'] },
      { id: 'q5_3', label: 'Quels documents commerciaux utilisez-vous ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Devis / proforma', 'Bon de commande', 'Bon de livraison', 'Facture', 'Bon de retour', 'Avoir / note de credit', 'Contrat de vente', 'Aucun document formel'], hasOther: true },
      { id: 'q5_4', label: 'Comment sont effectues les paiements ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Especes', 'Virement bancaire', 'Cheque', 'Mobile money (Airtel Money, Moov Money)', 'Carte bancaire / TPE', 'Paiement a credit (30j, 60j, 90j)', 'Paiement echelonne'], hasOther: true },
      { id: 'q5_5', label: 'Accordez-vous du credit / paiement differe ?', type: 'radio',
        options: ['Non, jamais', 'Oui, a quelques clients de confiance', 'Oui, systematiquement aux entreprises', 'Oui, et c\'est un vrai probleme de recouvrement'], hasOther: true, otherLabel: 'Delai standard en jours' },
      { id: 'q5_6', label: 'Montant moyen d\'une vente / commande ?', type: 'radio',
        options: ['Moins de 50 000 FCFA', '50 000 a 200 000 FCFA', '200 000 a 1 000 000 FCFA', '1 000 000 a 5 000 000 FCFA', 'Plus de 5 000 000 FCFA', 'Tres variable'] },
      { id: 'q5_7', label: 'Combien de ventes / commandes par mois ?', type: 'radio',
        options: ['Moins de 10', '10 a 30', '30 a 100', '100 a 300', 'Plus de 300'] },
    ],
  },
  {
    id: 's6', title: 'Approvisionnement', icon: 'truck', color: '#DD7B0E',
    description: 'Vos fournisseurs, delais et modes de commande.',
    questions: [
      { id: 'q6_1', label: 'Ou vous approvisionnez-vous ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Fournisseurs locaux (Gabon)', 'Importation directe (Europe, Chine, etc.)', 'Fournisseurs regionaux (Afrique Centrale)', 'Grossistes / distributeurs', 'Fabrication propre'], hasOther: true },
      { id: 'q6_2', label: 'Combien de fournisseurs principaux ?', type: 'radio',
        options: ['1 a 3', '4 a 10', '11 a 20', 'Plus de 20'] },
      { id: 'q6_3', label: 'Delai moyen de reapprovisionnement ?', type: 'radio',
        options: ['Immediat (stock fournisseur local)', '1 a 2 semaines', '2 a 4 semaines', '1 a 3 mois (import)', 'Plus de 3 mois', 'Variable selon les produits'] },
      { id: 'q6_4', label: 'Comment passez-vous vos commandes fournisseurs ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Par telephone', 'Par email', 'Via une plateforme en ligne du fournisseur', 'Via un representant / commercial fournisseur'], hasOther: true },
      { id: 'q6_5', label: 'Avez-vous des produits sur commande specifique ?', type: 'radio',
        options: ['Non, tout est en stock', 'Oui, certains a la demande', 'Oui, la majorite sur commande', 'Mix : stock permanent + commande speciale'] },
    ],
  },
  {
    id: 's7', title: 'Catalogue produits', icon: 'tag', color: '#64748B',
    description: 'Vos references, organisation et informations produits.',
    questions: [
      { id: 'q7_1', label: 'Combien de references produits gerez-vous ?', type: 'radio',
        options: ['Moins de 50', '50 a 100', '100 a 300', '300 a 1000', 'Plus de 1000'] },
      { id: 'q7_2', label: 'Comment sont organises vos produits ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Par categorie / famille', 'Par marque', 'Par fournisseur', 'Par usage / domaine', 'Pas d\'organisation particuliere'], hasOther: true },
      { id: 'q7_3', label: 'Utilisez-vous des codes / references internes ?', type: 'radio',
        options: ['Oui, codification propre', 'Oui, references fournisseur', 'Oui, codes-barres', 'Non, pas de codification'], hasOther: true, otherLabel: 'Exemple de code' },
      { id: 'q7_4', label: 'Vos produits ont-ils des dates de peremption ?', type: 'radio',
        options: ['Non, aucun', 'Oui, certains', 'Oui, la plupart (extincteurs, produits chimiques, etc.)'], hasOther: true, otherLabel: 'Preciser lesquels' },
      { id: 'q7_5', label: 'Gerez-vous des variantes (taille, couleur, modele) ?', type: 'radio',
        options: ['Non', 'Oui, quelques produits (tailles EPI)', 'Oui, beaucoup de variantes'], hasOther: true },
      { id: 'q7_6', label: 'Quelles informations stocker par produit ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Nom et description', 'Reference / code', 'Prix d\'achat', 'Prix de vente', 'Marge', 'Photo', 'Fournisseur', 'Emplacement depot', 'Poids / dimensions', 'Date de peremption', 'Numero de lot / serie', 'Certification / norme', 'Fiche technique PDF'], hasOther: true },
    ],
  },
  {
    id: 's8', title: 'Fonctionnalites attendues', icon: 'sparkle', color: '#F39200',
    description: 'Ce dont vous avez besoin dans l\'application.',
    questions: [
      { id: 'q8_1', label: 'Fonctionnalites INDISPENSABLES ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Gestion du stock (entrees, sorties, temps reel)', 'Catalogue produits detaille', 'Gestion des clients (fichier, historique)', 'Creation de devis', 'Creation de factures', 'Suivi des paiements et creances', 'Bons de livraison', 'Bons de commande fournisseur', 'Tableau de bord avec KPIs', 'Rapports et statistiques de vente', 'Gestion utilisateurs et permissions', 'Alertes stock bas', 'Historique de toutes les operations'], hasOther: true },
      { id: 'q8_2', label: 'Fonctionnalites APPRECIABLES (bonus) ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['App mobile pour commerciaux', 'Scan de codes-barres', 'Catalogue en ligne pour clients', 'Portail client (suivi commande)', 'Gestion contrats de maintenance', 'Planification interventions / tournees', 'Calcul automatique des marges', 'Relance automatique des impayes', 'Integration comptable', 'Gestion multi-devises (FCFA + EUR + USD)', 'Envoi devis / factures par email ou WhatsApp'], hasOther: true },
      { id: 'q8_3', label: 'L\'app doit-elle fonctionner sur telephone ?', type: 'radio',
        options: ['Non, uniquement ordinateur', 'Oui, principalement telephone', 'Oui, telephone ET ordinateur', 'Oui, avec mode hors connexion'] },
      { id: 'q8_4', label: 'Besoin de generer des PDF ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Devis', 'Factures', 'Bons de livraison', 'Bons de commande fournisseur', 'Rapports de stock', 'Non, pas necessaire'], hasOther: true },
    ],
  },
  {
    id: 's9', title: 'Securite et acces', icon: 'settings', color: '#14724A',
    description: 'Roles, permissions et restrictions d\'acces.',
    questions: [
      { id: 'q9_1', label: 'Quels niveaux d\'acces souhaitez-vous ?', type: 'radio',
        options: ['Un seul niveau, tout le monde voit tout', '2 niveaux : admin + utilisateur', '3 niveaux : admin + responsable + operateur', 'Roles personnalises selon les postes'], hasOther: true, otherLabel: 'Preciser les roles' },
      { id: 'q9_2', label: 'Quelles restrictions sont importantes ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Seul l\'admin voit les prix d\'achat et marges', 'Seul l\'admin modifie les prix de vente', 'Seul l\'admin supprime des produits / clients', 'Les magasiniers ne voient que le stock', 'Les commerciaux ne voient que les ventes', 'Le comptable voit uniquement factures et paiements', 'Chaque utilisateur ne voit que son depot'], hasOther: true },
    ],
  },
  {
    id: 's10', title: 'Situation actuelle', icon: 'alert', color: '#92520B',
    description: 'Vos outils actuels, vos problemes, votre budget.',
    questions: [
      { id: 'q10_1', label: 'Quels outils utilisez-vous actuellement ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Aucun outil informatique', 'Microsoft Excel / Google Sheets', 'Microsoft Word pour les documents', 'WhatsApp pour la communication interne', 'Un logiciel de comptabilite', 'Un logiciel de gestion commerciale'], hasOther: true, otherLabel: 'Preciser les logiciels' },
      { id: 'q10_2', label: 'Vos plus gros problemes actuels ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['On ne connait pas le stock en temps reel', 'Erreurs de stock (ecarts physique / registre)', 'Perte de temps a chercher des infos', 'Difficulte a faire des devis / factures', 'Suivi des paiements clients', 'Manque de visibilite sur les ventes', 'Coordination entre equipes / sites', 'Ruptures de stock imprevues', 'Difficulte a savoir quoi recommander'], hasOther: true },
      { id: 'q10_3', label: 'Budget approximatif pour l\'application ?', type: 'radio',
        options: ['Moins de 500 000 FCFA', '500 000 a 1 500 000 FCFA', '1 500 000 a 3 000 000 FCFA', '3 000 000 a 5 000 000 FCFA', 'Plus de 5 000 000 FCFA', 'A discuter selon les fonctionnalites'] },
      { id: 'q10_4', label: 'Delai souhaite de mise en service ?', type: 'radio',
        options: ['Le plus vite possible (< 1 mois)', '1 a 2 mois', '2 a 3 mois', 'Pas de date fixe, on avance progressivement'] },
      { id: 'q10_5', label: 'Donnees existantes a importer ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Non, on part de zero', 'Fichier Excel de produits', 'Fichier Excel de clients', 'Historique de ventes', 'Documents comptables'], hasOther: true },
    ],
  },
  {
    id: 's11', title: 'Informations complementaires', icon: 'info', color: '#3A78B5',
    description: 'Connexion, appareils et remarques libres.',
    questions: [
      { id: 'q11_1', label: 'Qualite de la connexion internet a Moanda ?', type: 'radio',
        options: ['Bonne et stable (fibre / 4G)', 'Correcte mais avec des coupures', 'Faible et instable', 'Tres mauvaise, mode hors connexion indispensable'] },
      { id: 'q11_2', label: 'Quels appareils seront utilises ?', type: 'checkbox', hint: 'Plusieurs choix possibles',
        options: ['Ordinateurs de bureau (Windows)', 'Ordinateurs portables', 'Tablettes', 'Smartphones Android', 'Smartphones iPhone'], hasOther: true },
      { id: 'q11_3', label: 'Autre chose que l\'application devrait faire ?', type: 'textarea' },
    ],
  },
];

const totalQuestions = SECTIONS.reduce((s, sec) => s + sec.questions.length, 0);

// ── Composant Option Radio ────────────────────────────────────
function RadioOption({ label, selected, onSelect }) {
  return (
    <div className="cadrage-option" onClick={onSelect} style={{
      display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
      padding: '12px 16px', borderRadius: 12,
      background: selected ? 'linear-gradient(135deg, var(--navy-50), rgba(27,79,140,0.08))' : 'white',
      border: selected ? '2px solid var(--navy-500)' : '1.5px solid var(--ink-200)',
      transition: 'all 0.2s ease',
      transform: selected ? 'scale(1.01)' : 'scale(1)',
      boxShadow: selected ? '0 2px 8px rgba(27,79,140,0.12)' : 'none',
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 999, flexShrink: 0,
        border: `2.5px solid ${selected ? 'var(--navy-600)' : 'var(--ink-300)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease',
        background: selected ? 'var(--navy-600)' : 'white',
      }}>
        {selected && <div style={{ width: 8, height: 8, borderRadius: 999, background: 'white' }} />}
      </div>
      <span style={{ fontSize: 14, color: selected ? 'var(--navy-800)' : 'var(--ink-700)', fontWeight: selected ? 600 : 400, lineHeight: 1.4 }}>{label}</span>
    </div>
  );
}

// ── Composant Option Checkbox ─────────────────────────────────
function CheckOption({ label, checked, onToggle }) {
  return (
    <div className="cadrage-option" onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
      padding: '12px 16px', borderRadius: 12,
      background: checked ? 'linear-gradient(135deg, var(--navy-50), rgba(27,79,140,0.08))' : 'white',
      border: checked ? '2px solid var(--navy-500)' : '1.5px solid var(--ink-200)',
      transition: 'all 0.2s ease',
      transform: checked ? 'scale(1.01)' : 'scale(1)',
      boxShadow: checked ? '0 2px 8px rgba(27,79,140,0.12)' : 'none',
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
        border: `2.5px solid ${checked ? 'var(--navy-600)' : 'var(--ink-300)'}`,
        background: checked ? 'var(--navy-600)' : 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease',
      }}>
        {checked && <Icon name="check" size={13} color="white" strokeWidth={3} />}
      </div>
      <span style={{ fontSize: 14, color: checked ? 'var(--navy-800)' : 'var(--ink-700)', fontWeight: checked ? 600 : 400, lineHeight: 1.4 }}>{label}</span>
    </div>
  );
}

// ── Question Radio ────────────────────────────────────────────
function RadioQuestion({ question, value, onChange }) {
  const selected = value?.selected || '';
  const other = value?.other || '';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {question.options.map((opt, i) => (
        <RadioOption key={i} label={opt} selected={selected === opt} onSelect={() => onChange({ selected: opt, other })} />
      ))}
      {question.hasOther && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', borderRadius: 12,
          background: selected === '__other__' ? 'linear-gradient(135deg, var(--navy-50), rgba(27,79,140,0.08))' : 'white',
          border: selected === '__other__' ? '2px solid var(--navy-500)' : '1.5px solid var(--ink-200)',
          transition: 'all 0.2s ease',
        }}>
          <div onClick={() => onChange({ selected: '__other__', other })} style={{
            width: 20, height: 20, borderRadius: 999, flexShrink: 0, cursor: 'pointer',
            border: `2.5px solid ${selected === '__other__' ? 'var(--navy-600)' : 'var(--ink-300)'}`,
            background: selected === '__other__' ? 'var(--navy-600)' : 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {selected === '__other__' && <div style={{ width: 8, height: 8, borderRadius: 999, background: 'white' }} />}
          </div>
          <span style={{ fontSize: 14, color: 'var(--ink-600)', whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => onChange({ selected: '__other__', other })}>{question.otherLabel || 'Autre'} :</span>
          <input value={other} onChange={e => onChange({ selected: '__other__', other: e.target.value })} onFocus={() => { if (selected !== '__other__') onChange({ selected: '__other__', other }); }}
            placeholder="Preciser..." style={{ flex: 1, border: 'none', borderBottom: '2px solid var(--ink-200)', outline: 'none', fontSize: 14, color: 'var(--ink-900)', padding: '4px 0', background: 'transparent', fontWeight: 500 }} />
        </div>
      )}
    </div>
  );
}

// ── Question Checkbox ─────────────────────────────────────────
function CheckboxQuestion({ question, value, onChange }) {
  const checked = value?.checked || [];
  const other = value?.other || '';
  const toggle = (opt) => {
    const next = checked.includes(opt) ? checked.filter(c => c !== opt) : [...checked, opt];
    onChange({ checked: next, other });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {question.options.map((opt, i) => (
        <CheckOption key={i} label={opt} checked={checked.includes(opt)} onToggle={() => toggle(opt)} />
      ))}
      {question.hasOther && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', borderRadius: 12,
          border: '1.5px solid var(--ink-200)', background: 'white',
        }}>
          <span style={{ fontSize: 14, color: 'var(--ink-600)', whiteSpace: 'nowrap' }}>{question.otherLabel || 'Autre'} :</span>
          <input value={other} onChange={e => onChange({ checked, other: e.target.value })}
            placeholder="Preciser..." style={{ flex: 1, border: 'none', borderBottom: '2px solid var(--ink-200)', outline: 'none', fontSize: 14, color: 'var(--ink-900)', padding: '4px 0', background: 'transparent', fontWeight: 500 }} />
        </div>
      )}
    </div>
  );
}

// ── Question Textarea ─────────────────────────────────────────
function TextareaQuestion({ value, onChange }) {
  return (
    <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={5}
      placeholder="Votre reponse..."
      style={{ width: '100%', resize: 'vertical', border: '2px solid var(--ink-200)', borderRadius: 14, padding: '14px 18px', fontSize: 14.5, color: 'var(--ink-900)', background: 'white', outline: 'none', fontFamily: 'inherit', lineHeight: 1.7, boxSizing: 'border-box', transition: 'border-color 0.2s' }}
      onFocus={e => e.target.style.borderColor = 'var(--navy-500)'}
      onBlur={e => e.target.style.borderColor = 'var(--ink-200)'} />
  );
}

// ── Helpers ───────────────────────────────────────────────────
function isAnswered(responses, qId) {
  const v = responses[qId];
  if (v === undefined || v === null) return false;
  // textarea
  if (typeof v === 'string') return v.trim().length > 0;
  // radio : { selected: 'xxx', other: '...' }
  if (v.selected && v.selected !== '__other__') return true;
  if (v.selected === '__other__' && v.other && v.other.trim().length > 0) return true;
  // checkbox : { checked: [...], other: '...' }
  if (Array.isArray(v.checked) && v.checked.length > 0) return true;
  return false;
}

// ── Ecran principal ──────────────────────────────────────────
// IDs valides pour nettoyer les anciennes données
const ALL_QUESTION_IDS = new Set(SECTIONS.flatMap(s => s.questions.map(q => q.id)));

function cleanResponses(raw) {
  const cleaned = {};
  for (const key in raw) {
    if (ALL_QUESTION_IDS.has(key)) cleaned[key] = raw[key];
  }
  return cleaned;
}

export function CadrageScreen() {
  const toast = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [responses, setResponses] = useState({});
  const [activeSection, setActiveSection] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const topRef = useRef(null);
  const saveTimer = useRef(null);

  // Charger les reponses depuis le serveur au montage
  useEffect(() => {
    fetchMyCadrageResponses().then(data => {
      if (data && data.responses) {
        setResponses(cleanResponses(data.responses));
      } else {
        // Fallback localStorage
        try {
          const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
          setResponses(cleanResponses(raw));
        } catch {}
      }
    }).catch(() => {
      try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        setResponses(cleanResponses(raw));
      } catch {}
    }).finally(() => setLoaded(true));
  }, []);

  // Sauvegarde automatique debounced (2s apres la derniere modif)
  const saveToServer = useCallback((data, progress) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        await saveCadrageResponses(data, progress);
      } catch {}
      finally { setSaving(false); }
    }, 2000);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const allQ = SECTIONS.flatMap(s => s.questions);
    const answered = allQ.filter(q => isAnswered(responses, q.id)).length;
    const pct = Math.round((answered / totalQuestions) * 100);
    saveToServer(responses, pct);
  }, [responses, loaded, saveToServer]);

  const setAnswer = (qId, value) => setResponses(r => ({ ...r, [qId]: value }));

  const allQuestions = SECTIONS.flatMap(s => s.questions);
  const answeredCount = allQuestions.filter(q => isAnswered(responses, q.id)).length;
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);
  const section = SECTIONS[activeSection];
  const sectionTotal = section.questions.length;
  const sectionAnswered = section.questions.filter(q => isAnswered(responses, q.id)).length;
  const sectionUnanswered = sectionTotal - sectionAnswered;
  const sectionComplete = sectionUnanswered === 0;

  const goToSection = (idx) => {
    setActiveSection(idx);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!loaded) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, fontSize: 14, color: 'var(--ink-500)' }}>
      Chargement du questionnaire...
    </div>
  );

  return (
    <div className="anim-fade screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div ref={topRef} />

      {/* ── Hero header ── */}
      <div className="cadrage-hero" style={{
        position: 'relative', overflow: 'hidden', borderRadius: 20,
        background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-700) 50%, var(--navy-600) 100%)',
        color: 'white', padding: '32px 36px',
      }}>
        <div style={{ position: 'absolute', right: -80, top: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(243,146,0,0.35), transparent 70%)' }} />
        <div style={{ position: 'absolute', left: -40, bottom: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(127,169,217,0.2), transparent 70%)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ padding: '4px 12px', borderRadius: 999, background: 'rgba(243,146,0,0.25)', color: 'var(--orange-300)', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Etape essentielle</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            Questionnaire de cadrage
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginTop: 10 }}>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--navy-200)', maxWidth: 520, lineHeight: 1.6 }}>
              Aidez-nous a concevoir l'application qui correspond <strong style={{ color: 'white' }}>exactement</strong> a votre activite. Chaque reponse compte.
            </p>
            {isAdmin && (
              <button onClick={() => navigate('/admin')} style={{
                height: 36, padding: '0 16px', borderRadius: 999, cursor: 'pointer',
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                color: 'white', fontSize: 12.5, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                <Icon name="users" size={14}/> Voir les reponses
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Barre de progression ── */}
      <div className="cadrage-progress" style={{
        background: 'white', borderRadius: 16, padding: '20px 24px',
        border: '1px solid var(--ink-150)', boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: progressPct === 100 ? 'var(--success-100)' : 'var(--navy-100)', color: progressPct === 100 ? 'var(--success-700)' : 'var(--navy-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {progressPct === 100 ? <Icon name="check" size={22} strokeWidth={2.5} /> : <Icon name="clipboard" size={20} />}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)' }}>{answeredCount} sur {totalQuestions} questions</div>
              <div style={{ fontSize: 12.5, color: saving ? 'var(--orange-600)' : 'var(--ink-500)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                {saving && <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--orange-500)', animation: 'pulseDot 1s infinite' }}/>}
                {saving ? 'Sauvegarde en cours...' : 'Sauvegarde automatique sur le serveur'}
              </div>
            </div>
          </div>
          <div style={{
            fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-mono)',
            color: progressPct === 100 ? 'var(--success-600)' : 'var(--navy-700)',
          }} className="cadrage-progress-pct">{progressPct}%</div>
        </div>
        <div style={{ height: 8, background: 'var(--ink-100)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progressPct}%`, borderRadius: 999, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
            background: progressPct === 100
              ? 'linear-gradient(90deg, var(--success-500), #22c55e)'
              : 'linear-gradient(90deg, var(--navy-700), var(--navy-500))',
          }} />
        </div>
      </div>

      {/* ── Layout principal ── */}
      <div className="grid-detail" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Nav sections */}
        <div className="cadrage-nav" style={{
          background: 'white', borderRadius: 16, padding: 10,
          border: '1px solid var(--ink-150)', boxShadow: 'var(--shadow-sm)',
          position: 'sticky', top: 80,
        }}>
          <div className="cadrage-nav-inner" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SECTIONS.map((sec, idx) => {
              const active = idx === activeSection;
              const secAnswered = sec.questions.filter(q => isAnswered(responses, q.id)).length;
              const secTotal = sec.questions.length;
              const complete = secAnswered === secTotal;
              return (
                <div key={sec.id} className="cadrage-nav-item" onClick={() => goToSection(idx)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderRadius: 12, cursor: 'pointer',
                  background: active ? `${sec.color}10` : 'transparent',
                  border: active ? `1.5px solid ${sec.color}30` : '1.5px solid transparent',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--ink-50)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? `${sec.color}10` : 'transparent'; }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: complete ? 'var(--success-100)' : active ? `${sec.color}18` : 'var(--ink-100)',
                    color: complete ? 'var(--success-700)' : active ? sec.color : 'var(--ink-500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}>
                    {complete ? <Icon name="check" size={16} strokeWidth={2.5} /> : <Icon name={sec.icon} size={15} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="cadrage-nav-label" style={{
                      fontSize: 13, fontWeight: active ? 700 : 500,
                      color: active ? 'var(--ink-900)' : 'var(--ink-700)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{sec.title}</div>
                    <div className="cadrage-nav-count" style={{
                      fontSize: 11, marginTop: 1, fontWeight: 600,
                      color: complete ? 'var(--success-600)' : 'var(--ink-400)',
                    }}>{secAnswered}/{secTotal}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contenu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Section header */}
          <div className="cadrage-section" style={{
            background: 'white', borderRadius: 16, padding: '24px 28px',
            border: '1px solid var(--ink-150)', boxShadow: 'var(--shadow-sm)',
          }}>
            <div className="cadrage-section-header" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              <div className="cadrage-section-icon" style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${section.color}15`, color: section.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1.5px solid ${section.color}25`,
              }}>
                <Icon name={section.icon} size={22} />
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Section {activeSection + 1} sur {SECTIONS.length}
                </div>
                <div className="cadrage-section-title" style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: '-0.02em', marginTop: 2 }}>{section.title}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 3 }}>{section.description}</div>
              </div>
            </div>

            {/* Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
              {section.questions.map((q, qi) => {
                const answered = isAnswered(responses, q.id);
                return (
                  <div key={q.id} style={{ position: 'relative' }}>
                    {qi > 0 && <div style={{ position: 'absolute', top: -18, left: 0, right: 0, height: 1, background: 'var(--ink-100)' }} />}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                      <span style={{
                        width: 28, height: 28, borderRadius: 999, flexShrink: 0, marginTop: 1,
                        background: answered ? 'var(--success-500)' : 'var(--ink-200)',
                        color: answered ? 'white' : 'var(--ink-500)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, transition: 'all 0.3s ease',
                      }}>
                        {answered ? <Icon name="check" size={14} strokeWidth={3} /> : qi + 1}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)', lineHeight: 1.45 }}>{q.label}</div>
                        {q.hint && <div style={{ fontSize: 12.5, color: 'var(--orange-600)', marginTop: 4, fontWeight: 500 }}>{q.hint}</div>}
                      </div>
                    </div>
                    <div className="cadrage-question-indent" style={{ marginLeft: 38 }}>
                      {q.type === 'radio' && <RadioQuestion question={q} value={responses[q.id]} onChange={v => setAnswer(q.id, v)} />}
                      {q.type === 'checkbox' && <CheckboxQuestion question={q} value={responses[q.id]} onChange={v => setAnswer(q.id, v)} />}
                      {q.type === 'textarea' && <TextareaQuestion value={responses[q.id]} onChange={v => setAnswer(q.id, v)} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statut section */}
          <div className="cadrage-alert" style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
            borderRadius: 14,
            background: sectionComplete ? 'var(--success-100)' : 'var(--orange-50)',
            border: `1.5px solid ${sectionComplete ? '#BFEDD2' : 'var(--orange-200)'}`,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: sectionComplete ? 'white' : 'var(--orange-100)',
              color: sectionComplete ? 'var(--success-600)' : 'var(--orange-600)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={sectionComplete ? 'check' : 'alert'} size={18} strokeWidth={sectionComplete ? 2.5 : 2} />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: sectionComplete ? 'var(--success-700)' : 'var(--orange-800)' }}>
                {sectionComplete
                  ? 'Section complete ! Vous pouvez passer a la suivante.'
                  : `${sectionAnswered} repondue${sectionAnswered > 1 ? 's' : ''} sur ${sectionTotal} — il en reste ${sectionUnanswered}`
                }
              </div>
              {!sectionComplete && (
                <div style={{ fontSize: 12, color: 'var(--orange-600)', marginTop: 2 }}>
                  Repondez a toutes les questions pour debloquer la section suivante.
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="cadrage-buttons" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingBottom: 40 }}>
            {activeSection > 0 ? (
              <button onClick={() => goToSection(activeSection - 1)} style={{
                height: 48, borderRadius: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'white', border: '1.5px solid var(--ink-200)',
                color: 'var(--ink-700)', fontSize: 14.5, fontWeight: 600,
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--ink-50)'; e.currentTarget.style.borderColor = 'var(--ink-300)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--ink-200)'; }}>
                <Icon name="chevronLeft" size={18} />
                Section precedente
              </button>
            ) : <div />}

            {activeSection < SECTIONS.length - 1 ? (
              <button onClick={() => {
                if (!sectionComplete) {
                  toast({ tone: 'danger', message: `${sectionAnswered}/${sectionTotal} repondues. Completez les ${sectionUnanswered} question${sectionUnanswered > 1 ? 's' : ''} restante${sectionUnanswered > 1 ? 's' : ''} pour continuer.` });
                  return;
                }
                goToSection(activeSection + 1);
              }} style={{
                height: 48, borderRadius: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'var(--navy-700)', border: 'none',
                color: 'white', fontSize: 14.5, fontWeight: 600,
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-800)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--navy-700)'}>
                Section suivante
                <Icon name="arrowRight" size={18} />
              </button>
            ) : (
              <button onClick={async () => {
                const allUnanswered = SECTIONS.flatMap(s => s.questions).filter(q => !isAnswered(responses, q.id));
                if (allUnanswered.length > 0) {
                  toast({ tone: 'danger', message: allUnanswered.length === 1 ? 'Il reste 1 question sans reponse.' : `Il reste ${allUnanswered.length} questions sans reponse.` });
                  return;
                }
                try {
                  await saveCadrageResponses(responses, 100);
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
                  toast({ tone: 'success', message: 'Questionnaire complet et enregistre ! Merci pour vos reponses.' });
                } catch { toast({ tone: 'danger', message: 'Erreur lors de l\'enregistrement.' }); }
              }} style={{
                height: 48, borderRadius: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'var(--success-500)', border: 'none',
                color: 'white', fontSize: 14.5, fontWeight: 700,
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--success-700)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--success-500)'}>
                <Icon name="check" size={18} strokeWidth={2.5} />
                Enregistrer mes reponses
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
