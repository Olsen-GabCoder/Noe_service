const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

// GET /api/warehouses
router.get('/', authenticate, async (_req, res) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: { _count: { select: { products: true, users: true } } },
    });
    res.json(warehouses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
