const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

// GET /api/dashboard/kpis
router.get('/kpis', authenticate, async (_req, res) => {
  try {
    const products = await prisma.product.findMany();
    const total = products.length;
    const totalQty = products.reduce((s, p) => s + p.qty, 0);
    const totalValue = products.reduce((s, p) => s + p.qty * p.price, 0);
    const ruptures = products.filter(p => p.qty === 0).length;
    const low = products.filter(p => p.qty > 0 && p.qty <= p.threshold).length;

    res.json({ total, totalQty, totalValue, ruptures, low });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/dashboard/flow
router.get('/flow', authenticate, async (_req, res) => {
  try {
    // Mouvements des 30 derniers jours, groupes par jour
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const movements = await prisma.movement.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      select: { type: true, qty: true, date: true },
      orderBy: { date: 'asc' },
    });

    // Grouper par jour
    const flowMap = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - 29 + i);
      const key = d.toISOString().slice(0, 10);
      flowMap[key] = { day: i + 1, date: key, entrees: 0, sorties: 0 };
    }

    movements.forEach(m => {
      const key = m.date.toISOString().slice(0, 10);
      if (flowMap[key]) {
        if (m.type === 'in') flowMap[key].entrees += m.qty;
        else flowMap[key].sorties += m.qty;
      }
    });

    res.json(Object.values(flowMap));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/dashboard/top-movers
router.get('/top-movers', authenticate, async (_req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const movements = await prisma.movement.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      include: { product: { select: { sku: true, name: true } } },
    });

    const skuMap = {};
    movements.forEach(m => {
      if (!skuMap[m.product.sku]) {
        skuMap[m.product.sku] = { sku: m.product.sku, name: m.product.name, in: 0, out: 0 };
      }
      if (m.type === 'in') skuMap[m.product.sku].in += m.qty;
      else skuMap[m.product.sku].out += m.qty;
    });

    const sorted = Object.values(skuMap)
      .sort((a, b) => (b.in + b.out) - (a.in + a.out))
      .slice(0, 5);

    res.json(sorted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/dashboard/recent-activity
router.get('/recent-activity', authenticate, async (_req, res) => {
  try {
    const movements = await prisma.movement.findMany({
      include: {
        product: { select: { sku: true, name: true } },
        user: { select: { name: true } },
        warehouse: { select: { code: true, label: true } },
      },
      orderBy: { date: 'desc' },
      take: 10,
    });
    res.json(movements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
