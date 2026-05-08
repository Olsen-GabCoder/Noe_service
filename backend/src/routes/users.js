const router = require('express').Router();
const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/users
router.get('/', authenticate, authorize('admin', 'gestionnaire'), async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        avatarInitials: true, avatarColor: true, online: true,
        lastSeen: true, createdAt: true,
        warehouse: { select: { id: true, code: true, label: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/users (invitation)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, phone, role, warehouseId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['#1B4F8C', '#1F9D6B', '#7C3AED', '#F39200', '#DD7B0E', '#D8334A'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const user = await prisma.user.create({
      data: {
        name, email, password: hashed, phone,
        role: role || 'collaborateur',
        avatarInitials: initials,
        avatarColor: color,
        warehouseId,
      },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        avatarInitials: true, avatarColor: true, createdAt: true,
        warehouse: { select: { id: true, code: true, label: true } },
      },
    });

    res.status(201).json(user);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Cet email est deja utilise' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/users/:id
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, phone, role, warehouseId } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, phone, role, warehouseId },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        avatarInitials: true, avatarColor: true, createdAt: true,
        warehouse: { select: { id: true, code: true, label: true } },
      },
    });
    res.json(user);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Utilisateur introuvable' });
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Impossible de supprimer votre propre compte' });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'Utilisateur supprime' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Utilisateur introuvable' });
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
