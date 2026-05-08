const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

// GET /api/notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, read } = req.query;
    const where = {};
    if (type) where.type = type;
    if (read !== undefined) where.read = read === 'true';

    const notifications = await prisma.notification.findMany({
      where,
      include: { product: { select: { sku: true, name: true } } },
      orderBy: { date: 'desc' },
    });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json(notification);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Notification introuvable' });
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticate, async (_req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
    res.json({ message: 'Toutes les notifications marquees comme lues' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
