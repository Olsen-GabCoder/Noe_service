const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // --- Warehouses (Gabon) ---
  const warehouses = await Promise.all([
    prisma.warehouse.upsert({ where: { code: 'LBV' }, update: { label: 'Libreville — Oloumi' },   create: { code: 'LBV', label: 'Libreville — Oloumi' } }),
    prisma.warehouse.upsert({ where: { code: 'POG' }, update: { label: 'Port-Gentil — Centre' },   create: { code: 'POG', label: 'Port-Gentil — Centre' } }),
    prisma.warehouse.upsert({ where: { code: 'FCV' }, update: { label: 'Franceville' },             create: { code: 'FCV', label: 'Franceville' } }),
  ]);
  const whBySlug = { libreville: warehouses[0], portgentil: warehouses[1], franceville: warehouses[2] };
  console.log(`  ${warehouses.length} warehouses (Gabon)`);

  // --- Categories ---
  const catData = [
    { slug: 'alim', label: 'Alimentation', color: '#E08200', icon: 'package' },
    { slug: 'mat',  label: 'Materiel',     color: '#1B4F8C', icon: 'tool' },
    { slug: 'ent',  label: 'Entretien',    color: '#1F9D6B', icon: 'spray' },
    { slug: 'bur',  label: 'Bureau',       color: '#7C3AED', icon: 'clipboard' },
    { slug: 'emb',  label: 'Emballage',    color: '#DD7B0E', icon: 'box' },
    { slug: 'div',  label: 'Divers',       color: '#64748B', icon: 'tag' },
  ];
  const categories = await Promise.all(
    catData.map(c => prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c }))
  );
  const catBySlug = Object.fromEntries(categories.map(c => [c.slug, c]));
  console.log(`  ${categories.length} categories`);

  // --- Users (Gabon) ---
  const hashedPw = await bcrypt.hash('noeservices2024', 10);
  const userData = [
    { name: 'Admin Noe Services', email: 'admin@noeservices.ga',     role: 'admin',         phone: '+241 077 12 34 56', avatarInitials: 'NS', avatarColor: '#1B4F8C', warehouse: 'all' },
    { name: 'Ornella Mba',       email: 'ornella@noeservices.ga',    role: 'gestionnaire',  phone: '+241 066 88 99 11', avatarInitials: 'OM', avatarColor: '#1F9D6B', warehouse: 'libreville' },
    { name: 'Steeve Ndong',      email: 'steeve@noeservices.ga',     role: 'gestionnaire',  phone: '+241 074 55 44 33', avatarInitials: 'SN', avatarColor: '#7C3AED', warehouse: 'portgentil' },
    { name: 'Junior Obame',      email: 'junior@noeservices.ga',     role: 'collaborateur', phone: '+241 062 22 33 44', avatarInitials: 'JO', avatarColor: '#F39200', warehouse: 'franceville' },
    { name: 'Sandrine Moussavou',email: 'sandrine@noeservices.ga',   role: 'comptable',     phone: '+241 065 11 22 33', avatarInitials: 'SM', avatarColor: '#DD7B0E', warehouse: 'all' },
    { name: 'Patrick Ondo',      email: 'patrick@noeservices.ga',    role: 'collaborateur', phone: '+241 077 88 99 00', avatarInitials: 'PO', avatarColor: '#D8334A', warehouse: 'libreville' },
  ];
  const users = await Promise.all(
    userData.map(u =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          name: u.name, email: u.email, password: hashedPw,
          phone: u.phone, role: u.role,
          avatarInitials: u.avatarInitials, avatarColor: u.avatarColor,
          warehouseId: u.warehouse === 'all' ? null : whBySlug[u.warehouse].id,
        },
      })
    )
  );
  const userByName = {};
  users.forEach(u => {
    const short = u.name.split(' ')[0];
    userByName[short] = u;
  });
  console.log(`  ${users.length} users (password: noeservices2024)`);

  // --- Products ---
  const prodData = [
    { sku: 'NOE-1042', name: 'Riz parfumé import — sac 25kg',     cat: 'alim', price: 18500, qty: 142, threshold: 30, unit: 'sac',     warehouse: 'libreville',  trend: 3 },
    { sku: 'NOE-1043', name: 'Huile végétale 5L',                  cat: 'alim', price: 6800,  qty: 89,  threshold: 40, unit: 'bidon',   warehouse: 'libreville',  trend: -2 },
    { sku: 'NOE-1044', name: 'Sucre en poudre — sac 50kg',         cat: 'alim', price: 32000, qty: 18,  threshold: 25, unit: 'sac',     warehouse: 'portgentil',  trend: -8 },
    { sku: 'NOE-1045', name: 'Farine de blé T55 — sac 50kg',       cat: 'alim', price: 28500, qty: 64,  threshold: 30, unit: 'sac',     warehouse: 'libreville',  trend: 1 },
    { sku: 'NOE-1046', name: 'Lait concentré sucré — carton 48',   cat: 'alim', price: 24000, qty: 7,   threshold: 20, unit: 'carton',  warehouse: 'franceville', trend: -12 },
    { sku: 'NOE-1047', name: 'Tomate concentrée — pack 24',        cat: 'alim', price: 12400, qty: 156, threshold: 50, unit: 'pack',    warehouse: 'libreville',  trend: 5 },
    { sku: 'NOE-1048', name: 'Spaghetti 500g — pack 20',           cat: 'alim', price: 8900,  qty: 0,   threshold: 30, unit: 'pack',    warehouse: 'portgentil',  trend: -100 },
    { sku: 'NOE-2010', name: 'Visseuse sans fil 18V',              cat: 'mat',  price: 45000, qty: 12,  threshold: 5,  unit: 'unité',   warehouse: 'portgentil',  trend: 0 },
    { sku: 'NOE-2011', name: 'Marteau charpentier 600g',           cat: 'mat',  price: 4500,  qty: 38,  threshold: 10, unit: 'unité',   warehouse: 'libreville',  trend: 2 },
    { sku: 'NOE-2012', name: 'Niveau à bulle aluminium 60cm',      cat: 'mat',  price: 8200,  qty: 23,  threshold: 8,  unit: 'unité',   warehouse: 'libreville',  trend: 1 },
    { sku: 'NOE-2013', name: 'Tournevis cruciforme — set 6',       cat: 'mat',  price: 6800,  qty: 4,   threshold: 12, unit: 'set',     warehouse: 'franceville', trend: -6 },
    { sku: 'NOE-2014', name: 'Mètre ruban 5m',                     cat: 'mat',  price: 2200,  qty: 87,  threshold: 20, unit: 'unité',   warehouse: 'portgentil',  trend: 4 },
    { sku: 'NOE-3001', name: 'Détergent multi-surfaces 5L',        cat: 'ent',  price: 5400,  qty: 67,  threshold: 25, unit: 'bidon',   warehouse: 'libreville',  trend: 3 },
    { sku: 'NOE-3002', name: 'Eau de javel 2L — pack 6',           cat: 'ent',  price: 4200,  qty: 11,  threshold: 30, unit: 'pack',    warehouse: 'portgentil',  trend: -9 },
    { sku: 'NOE-3003', name: 'Balai brosse industriel',             cat: 'ent',  price: 3800,  qty: 22,  threshold: 8,  unit: 'unité',   warehouse: 'franceville', trend: 0 },
    { sku: 'NOE-4001', name: 'Ramette papier A4 80g — 500 feuilles',cat: 'bur', price: 3500,  qty: 124, threshold: 30, unit: 'ramette', warehouse: 'libreville',  trend: 2 },
    { sku: 'NOE-4002', name: 'Stylo bille bleu — boîte 50',        cat: 'bur',  price: 4200,  qty: 16,  threshold: 20, unit: 'boîte',   warehouse: 'portgentil',  trend: -3 },
    { sku: 'NOE-4003', name: 'Classeur à levier A4',               cat: 'bur',  price: 1800,  qty: 0,   threshold: 15, unit: 'unité',   warehouse: 'libreville',  trend: -100 },
    { sku: 'NOE-5001', name: 'Carton brun 40×30×30 — pack 50',     cat: 'emb',  price: 12500, qty: 38,  threshold: 15, unit: 'pack',    warehouse: 'libreville',  trend: 1 },
    { sku: 'NOE-5002', name: 'Sac plastique 30L — rouleau 100',    cat: 'emb',  price: 3200,  qty: 92,  threshold: 30, unit: 'rouleau', warehouse: 'franceville', trend: 6 },
    { sku: 'NOE-5003', name: 'Ruban adhésif transparent 50m',      cat: 'emb',  price: 1100,  qty: 5,   threshold: 25, unit: 'rouleau', warehouse: 'portgentil',  trend: -14 },
  ];
  const products = await Promise.all(
    prodData.map(p =>
      prisma.product.upsert({
        where: { sku: p.sku },
        update: {},
        create: {
          sku: p.sku, name: p.name, price: p.price, qty: p.qty,
          threshold: p.threshold, unit: p.unit, trend: p.trend,
          categoryId: catBySlug[p.cat].id,
          warehouseId: whBySlug[p.warehouse].id,
        },
      })
    )
  );
  const prodBySku = Object.fromEntries(products.map(p => [p.sku, p]));
  console.log(`  ${products.length} products`);

  // --- Movements ---
  const nameMap = { 'Ornella M.': 'Ornella', 'Steeve N.': 'Steeve', 'Admin N.': 'Admin', 'Junior O.': 'Junior' };
  const movData = [
    { ref: 'BL-9931', sku: 'NOE-1047', type: 'in',  qty: 60, userName: 'Ornella M.',  date: '2026-04-27T09:42', warehouse: 'libreville',  note: 'Livraison fournisseur CECA Gadis' },
    { ref: 'V-4421',  sku: 'NOE-2014', type: 'out', qty: 12, userName: 'Steeve N.',   date: '2026-04-27T08:15', warehouse: 'portgentil',  note: 'Vente client B2B — chantier Cap Lopez' },
    { ref: 'V-4419',  sku: 'NOE-1048', type: 'out', qty: 30, userName: 'Admin N.',   date: '2026-04-26T17:50', warehouse: 'portgentil',  note: 'Sortie urgence — restaurant Le Méridien' },
    { ref: 'BL-9928', sku: 'NOE-3001', type: 'in',  qty: 24, userName: 'Ornella M.',  date: '2026-04-26T14:20', warehouse: 'libreville',  note: 'Réception bon BL-9928' },
    { ref: 'V-4416',  sku: 'NOE-1044', type: 'out', qty: 7,  userName: 'Junior O.',   date: '2026-04-26T11:08', warehouse: 'portgentil',  note: 'Vente comptoir' },
    { ref: 'BL-9925', sku: 'NOE-2010', type: 'in',  qty: 6,  userName: 'Admin N.',   date: '2026-04-26T09:55', warehouse: 'portgentil',  note: 'Réassort matériel' },
    { ref: 'V-4413',  sku: 'NOE-1042', type: 'out', qty: 18, userName: 'Steeve N.',   date: '2026-04-25T16:42', warehouse: 'libreville',  note: 'Vente B2B — Supermarché Mbolo' },
    { ref: 'V-4412',  sku: 'NOE-1046', type: 'out', qty: 4,  userName: 'Junior O.',   date: '2026-04-25T15:10', warehouse: 'franceville', note: 'Vente comptoir' },
    { ref: 'V-4410',  sku: 'NOE-5003', type: 'out', qty: 8,  userName: 'Ornella M.',  date: '2026-04-25T11:30', warehouse: 'portgentil',  note: 'Préparation expédition' },
    { ref: 'BL-9920', sku: 'NOE-1045', type: 'in',  qty: 30, userName: 'Admin N.',   date: '2026-04-25T08:20', warehouse: 'libreville',  note: 'Réception fournisseur' },
    { ref: 'V-4407',  sku: 'NOE-3002', type: 'out', qty: 16, userName: 'Steeve N.',   date: '2026-04-24T17:00', warehouse: 'portgentil',  note: 'Vente B2B' },
    { ref: 'V-4405',  sku: 'NOE-1043', type: 'out', qty: 22, userName: 'Junior O.',   date: '2026-04-24T14:15', warehouse: 'libreville',  note: 'Vente comptoir' },
    { ref: 'V-4403',  sku: 'NOE-2013', type: 'out', qty: 6,  userName: 'Ornella M.',  date: '2026-04-24T10:48', warehouse: 'franceville', note: 'Vente comptoir' },
  ];

  for (const m of movData) {
    const firstName = nameMap[m.userName] || m.userName.split(' ')[0];
    const user = userByName[firstName];
    if (!user) { console.log(`  SKIP movement ${m.ref}: user "${m.userName}" not found`); continue; }

    await prisma.movement.upsert({
      where: { ref: m.ref },
      update: {},
      create: {
        ref: m.ref, type: m.type, qty: m.qty, note: m.note,
        date: new Date(m.date),
        productId: prodBySku[m.sku].id,
        userId: user.id,
        warehouseId: whBySlug[m.warehouse].id,
      },
    });
  }
  console.log(`  ${movData.length} movements`);

  // --- Notifications ---
  const notifData = [
    { type: 'rupture',  title: 'Spaghetti 500g — pack 20',  detail: 'Stock épuisé à Port-Gentil. Dernière sortie il y a 2h.',       date: '2026-04-26T17:50', read: false, sku: 'NOE-1048' },
    { type: 'rupture',  title: 'Classeur à levier A4',       detail: 'Stock épuisé à Libreville.',                                   date: '2026-04-26T15:12', read: false, sku: 'NOE-4003' },
    { type: 'low',      title: 'Lait concentré sucré',       detail: '7 cartons restants sur seuil de 20 (Franceville).',            date: '2026-04-26T14:30', read: false, sku: 'NOE-1046' },
    { type: 'low',      title: 'Ruban adhésif transparent',  detail: '5 rouleaux restants sur seuil de 25 (Port-Gentil).',           date: '2026-04-26T11:05', read: true,  sku: 'NOE-5003' },
    { type: 'low',      title: 'Tournevis cruciforme — set', detail: '4 sets restants sur seuil de 12 (Franceville).',               date: '2026-04-25T16:40', read: true,  sku: 'NOE-2013' },
    { type: 'task',     title: 'Inventaire mensuel Libreville', detail: 'Assigné à Ornella Mba — échéance 30/04.',                   date: '2026-04-25T09:00', read: true,  sku: null },
    { type: 'movement', title: 'Mouvement important',        detail: 'Sortie de 30 packs Spaghetti — autorisee par Admin Noe Services.',         date: '2026-04-26T17:50', read: true,  sku: 'NOE-1048' },
    { type: 'login',    title: 'Nouvelle connexion',         detail: 'Steeve Ndong s\'est connecté depuis Port-Gentil.',             date: '2026-04-27T08:10', read: true,  sku: null },
  ];

  for (const n of notifData) {
    await prisma.notification.create({
      data: {
        type: n.type, title: n.title, detail: n.detail,
        read: n.read, date: new Date(n.date),
        productId: n.sku ? prodBySku[n.sku]?.id : null,
      },
    });
  }
  console.log(`  ${notifData.length} notifications`);

  console.log('Seed complete! 🇬🇦');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
