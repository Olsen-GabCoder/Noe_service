const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/movements
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, warehouse, productSku, limit = '50', offset = '0' } = req.query;
    const where = {};

    if (type) where.type = type;
    if (warehouse) where.warehouse = { code: warehouse };
    if (productSku) where.product = { sku: productSku };

    const [movements, total] = await Promise.all([
      prisma.movement.findMany({
        where,
        include: {
          product: { select: { sku: true, name: true } },
          user: { select: { name: true } },
          warehouse: { select: { code: true, label: true } },
        },
        orderBy: { date: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.movement.count({ where }),
    ]);

    res.json({ movements, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/movements
router.post('/', authenticate, authorize('admin', 'gestionnaire', 'collaborateur'), async (req, res) => {
  try {
    const { ref, type, qty, note, productSku, warehouseCode } = req.body;

    if (!ref || !type || !qty || !productSku || !warehouseCode) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const product = await prisma.product.findUnique({ where: { sku: productSku } });
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });

    const warehouse = await prisma.warehouse.findUnique({ where: { code: warehouseCode } });
    if (!warehouse) return res.status(404).json({ error: 'Entrepot introuvable' });

    // Verifier stock suffisant pour une sortie
    if (type === 'out' && product.qty < qty) {
      return res.status(400).json({ error: `Stock insuffisant (${product.qty} disponibles)` });
    }

    // Transaction : creer mouvement + mettre a jour stock + notif si seuil
    const result = await prisma.$transaction(async (tx) => {
      const movement = await tx.movement.create({
        data: {
          ref,
          type,
          qty,
          note,
          productId: product.id,
          userId: req.user.id,
          warehouseId: warehouse.id,
        },
        include: {
          product: { select: { sku: true, name: true } },
          user: { select: { name: true } },
          warehouse: { select: { code: true, label: true } },
        },
      });

      const newQty = type === 'in' ? product.qty + qty : product.qty - qty;
      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: { qty: newQty },
      });

      // Generer notification si stock critique
      if (updatedProduct.qty === 0) {
        await tx.notification.create({
          data: {
            type: 'rupture',
            title: updatedProduct.name,
            detail: `Stock epuise a ${warehouse.label}.`,
            productId: product.id,
          },
        });
      } else if (updatedProduct.qty <= updatedProduct.threshold) {
        await tx.notification.create({
          data: {
            type: 'low',
            title: updatedProduct.name,
            detail: `${updatedProduct.qty} ${product.unit}(s) restant(s) sur seuil de ${updatedProduct.threshold} (${warehouse.label}).`,
            productId: product.id,
          },
        });
      }

      return movement;
    });

    res.status(201).json(result);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Cette reference de mouvement existe deja' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
