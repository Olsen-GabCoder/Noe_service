const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/products
router.get('/', authenticate, async (req, res) => {
  try {
    const { category, warehouse, search, status } = req.query;
    const where = {};

    if (category) where.category = { slug: category };
    if (warehouse) where.warehouse = { code: warehouse };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ];
    }
    if (status === 'rupture') where.qty = 0;
    if (status === 'low') where.qty = { gt: 0, lte: prisma.$queryRaw`threshold` };

    const products = await prisma.product.findMany({
      where,
      include: { category: true, warehouse: true },
      orderBy: { updatedAt: 'desc' },
    });

    // Filtrage status low cote app (Prisma ne supporte pas la comparaison entre colonnes facilement)
    let result = products;
    if (status === 'low') {
      result = products.filter(p => p.qty > 0 && p.qty <= p.threshold);
    }
    if (status === 'rupture') {
      result = products.filter(p => p.qty === 0);
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/products/:sku
router.get('/:sku', authenticate, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { sku: req.params.sku },
      include: {
        category: true,
        warehouse: true,
        movements: {
          include: { user: { select: { name: true } } },
          orderBy: { date: 'desc' },
          take: 20,
        },
      },
    });
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/products
router.post('/', authenticate, authorize('admin', 'gestionnaire'), async (req, res) => {
  try {
    const { sku, name, price, qty, threshold, unit, categoryId, warehouseId } = req.body;
    const product = await prisma.product.create({
      data: { sku, name, price, qty, threshold, unit, categoryId, warehouseId },
      include: { category: true, warehouse: true },
    });
    res.status(201).json(product);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ce SKU existe deja' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/products/:sku
router.put('/:sku', authenticate, authorize('admin', 'gestionnaire'), async (req, res) => {
  try {
    const { name, price, threshold, unit, categoryId, warehouseId } = req.body;
    const product = await prisma.product.update({
      where: { sku: req.params.sku },
      data: { name, price, threshold, unit, categoryId, warehouseId },
      include: { category: true, warehouse: true },
    });
    res.json(product);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Produit introuvable' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/products/:sku
router.delete('/:sku', authenticate, authorize('admin'), async (req, res) => {
  try {
    await prisma.product.delete({ where: { sku: req.params.sku } });
    res.json({ message: 'Produit supprime' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Produit introuvable' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
