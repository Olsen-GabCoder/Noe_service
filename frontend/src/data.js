// --- Constantes UI categories (couleurs/icones pour les composants) ---
export const CATEGORIES = [
  { id: 'alim',  label: 'Alimentation', color: '#E08200', icon: 'package' },
  { id: 'mat',   label: 'Materiel',     color: '#1B4F8C', icon: 'tool' },
  { id: 'ent',   label: 'Entretien',    color: '#1F9D6B', icon: 'spray' },
  { id: 'bur',   label: 'Bureau',       color: '#7C3AED', icon: 'clipboard' },
  { id: 'emb',   label: 'Emballage',    color: '#DD7B0E', icon: 'box' },
  { id: 'div',   label: 'Divers',       color: '#64748B', icon: 'tag' },
];

export const CAT_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

// --- Utilitaires de formatage (conserves cote client) ---

export const fcfa = (n) => {
  if (n == null) return '—';
  return n.toLocaleString('fr-FR').replace(/,/g, ' ') + ' FCFA';
};

export const num = (n) => n.toLocaleString('fr-FR').replace(/,/g, ' ');

export function stockStatus(p) {
  if (p.qty === 0) return 'rupture';
  if (p.qty <= p.threshold) return 'low';
  return 'ok';
}

export function computeKPIs(products) {
  const total = products.length;
  const totalQty = products.reduce((s, p) => s + p.qty, 0);
  const totalValue = products.reduce((s, p) => s + p.qty * p.price, 0);
  const ruptures = products.filter(p => p.qty === 0).length;
  const low = products.filter(p => p.qty > 0 && p.qty <= p.threshold).length;
  return { total, totalQty, totalValue, ruptures, low };
}

export function timeAgo(iso) {
  const date = new Date(iso);
  const now = new Date();
  const diff = (now - date) / 1000;
  if (diff < 60) return 'à l\’instant';
  if (diff < 3600) return `il y a ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff/3600)} h`;
  if (diff < 2 * 86400) return 'hier';
  return `il y a ${Math.floor(diff/86400)} j`;
}

export function formatDateTime(iso) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2,'0');
  const mois = ['jan','fév','mar','avr','mai','juin','juil','août','sept','oct','nov','déc'][d.getMonth()];
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  return `${dd} ${mois} · ${hh}:${mm}`;
}
