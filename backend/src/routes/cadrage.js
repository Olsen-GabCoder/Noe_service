const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/cadrage — Sauvegarder ou mettre a jour les reponses
router.post('/', authenticate, async (req, res) => {
  try {
    const { responses, progress } = req.body;

    // Chercher si l'utilisateur a deja une soumission
    const existing = await prisma.cadrageResponse.findFirst({
      where: { userId: req.user.id },
    });

    if (existing) {
      const updated = await prisma.cadrageResponse.update({
        where: { id: existing.id },
        data: {
          responses: JSON.stringify(responses),
          progress: progress || 0,
          respondent: req.user.name,
          submittedAt: progress === 100 ? new Date() : existing.submittedAt,
        },
      });
      return res.json(updated);
    }

    const created = await prisma.cadrageResponse.create({
      data: {
        respondent: req.user.name,
        responses: JSON.stringify(responses),
        progress: progress || 0,
        userId: req.user.id,
        submittedAt: progress === 100 ? new Date() : null,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/cadrage/me — Recuperer mes reponses
router.get('/me', authenticate, async (req, res) => {
  try {
    const response = await prisma.cadrageResponse.findFirst({
      where: { userId: req.user.id },
    });
    if (!response) return res.json(null);
    res.json({
      ...response,
      responses: JSON.parse(response.responses),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/cadrage — Voir toutes les reponses (admin uniquement)
router.get('/', authenticate, authorize('admin'), async (_req, res) => {
  try {
    const all = await prisma.cadrageResponse.findMany({
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(all.map(r => ({
      ...r,
      responses: JSON.parse(r.responses),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/cadrage/export — Exporter en CSV (admin)
router.get('/export', authenticate, authorize('admin'), async (_req, res) => {
  try {
    const all = await prisma.cadrageResponse.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    // Labels des questions
    const QUESTION_LABELS = {
      q1_1: 'Statut juridique', q1_2: 'Annee d\'activite', q1_3: 'Coeur de metier',
      q1_4: 'Types de produits', q1_5: 'Services proposes',
      q2_1: 'Nombre de personnes', q2_2: 'Postes existants', q2_3: 'Utilisateurs app', q2_4: 'Utilisateurs simultanes',
      q3_1: 'Nombre de depots', q3_2: 'Type de local', q3_3: 'Projets ouverture',
      q3_4: 'Gestion stock actuelle', q3_5: 'Frequence inventaires', q3_6: 'Livraison clients',
      q4_1: 'Clients principaux', q4_2: 'Repartition clientele', q4_3: 'Clients actifs',
      q4_4: 'Clients reguliers', q4_5: 'Zone geographique',
      q5_1: 'Mode de commande', q5_2: 'Tarification', q5_3: 'Documents commerciaux',
      q5_4: 'Modes de paiement', q5_5: 'Credit paiement differe', q5_6: 'Montant moyen vente', q5_7: 'Volume mensuel',
      q6_1: 'Approvisionnement', q6_2: 'Nombre fournisseurs', q6_3: 'Delai reappro',
      q6_4: 'Commandes fournisseurs', q6_5: 'Produits sur commande',
      q7_1: 'Nombre references', q7_2: 'Organisation produits', q7_3: 'Codes internes',
      q7_4: 'Dates peremption', q7_5: 'Variantes produits', q7_6: 'Infos par produit',
      q8_1: 'Fonctionnalites indispensables', q8_2: 'Fonctionnalites bonus',
      q8_3: 'Utilisation telephone', q8_4: 'Generation PDF',
      q9_1: 'Niveaux acces', q9_2: 'Restrictions',
      q10_1: 'Outils actuels', q10_2: 'Problemes actuels', q10_3: 'Budget',
      q10_4: 'Delai mise en service', q10_5: 'Donnees a importer',
      q11_1: 'Connexion internet', q11_2: 'Appareils', q11_3: 'Remarques libres',
    };

    // Collecter toutes les question IDs presentes
    const allQIds = new Set();
    all.forEach(r => {
      const data = JSON.parse(r.responses);
      Object.keys(data).forEach(k => allQIds.add(k));
    });
    const sortedQIds = [...allQIds].sort((a, b) => {
      const [, sa, qa] = a.match(/q(\d+)_(\d+)/);
      const [, sb, qb] = b.match(/q(\d+)_(\d+)/);
      return (parseInt(sa) * 100 + parseInt(qa)) - (parseInt(sb) * 100 + parseInt(qb));
    });

    // Formater une valeur pour CSV
    function formatVal(val) {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (val.selected === '__other__') return 'Autre : ' + (val.other || '');
      if (val.selected) return val.selected;
      if (Array.isArray(val.checked)) {
        let text = val.checked.join(' | ');
        if (val.other) text += ' | Autre : ' + val.other;
        return text;
      }
      return '';
    }

    function csvEscape(str) {
      if (!str) return '';
      const s = String(str);
      if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('|')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }

    // Construire le CSV
    const headers = ['Repondant', 'Email', 'Progression', 'Date soumission', 'Derniere MAJ',
      ...sortedQIds.map(qId => QUESTION_LABELS[qId] || qId)];

    const rows = all.map(r => {
      const data = JSON.parse(r.responses);
      return [
        r.respondent,
        r.user?.email || '',
        r.progress + '%',
        r.submittedAt ? new Date(r.submittedAt).toLocaleString('fr-FR') : '',
        new Date(r.updatedAt).toLocaleString('fr-FR'),
        ...sortedQIds.map(qId => formatVal(data[qId])),
      ];
    });

    const bom = '\uFEFF';
    const csv = bom + [headers.map(csvEscape).join(','), ...rows.map(row => row.map(csvEscape).join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=cadrage_noe_services.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
