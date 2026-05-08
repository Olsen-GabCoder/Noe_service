import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Card, Badge, Button, Avatar, useToast } from '../components/Primitives';
import { fetchUsers, fetchProducts, fetchWarehouses, fetchCategories, fetchAllCadrageResponses, exportCadrageResponses, deleteUser } from '../api';
import { timeAgo, num, fcfa } from '../data';
import { QUESTION_LABELS } from '../data/cadrageQuestions';

// ── Onglets admin ─────────────────────────────────────────────
const TABS = [
  { id: 'overview',    label: 'Vue d\'ensemble',    icon: 'dashboard' },
  { id: 'users',       label: 'Utilisateurs',       icon: 'users' },
  { id: 'warehouses',  label: 'Depots',             icon: 'box' },
  { id: 'categories',  label: 'Categories',         icon: 'tag' },
  { id: 'cadrage',     label: 'Reponses cadrage',   icon: 'clipboard' },
];

// ── Formatage reponse cadrage ─────────────────────────────────
const SECTION_LABELS = {
  s1: 'Identite et coeur de metier', s2: 'Structure et organisation',
  s3: 'Logistique et depots', s4: 'Clients et marche',
  s5: 'Vente et processus commercial', s6: 'Approvisionnement',
  s7: 'Catalogue produits', s8: 'Fonctionnalites attendues',
  s9: 'Securite et acces', s10: 'Situation actuelle', s11: 'Informations complementaires',
};

function FormatAnswer({ value }) {
  if (!value) return <span style={{ color: 'var(--ink-400)' }}>—</span>;
  if (typeof value === 'string') return <span>{value}</span>;
  if (value.selected === '__other__') return <span>Autre : <strong>{value.other || '—'}</strong></span>;
  if (value.selected) return <span>{value.selected}</span>;
  if (Array.isArray(value.checked) && value.checked.length > 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {value.checked.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <span style={{ color: 'var(--success-600)', marginTop: 2, flexShrink: 0 }}>&#10003;</span>
            <span>{item}</span>
          </div>
        ))}
        {value.other && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <span style={{ color: 'var(--orange-600)', marginTop: 2, flexShrink: 0 }}>&#9998;</span>
            <span>Autre : <strong>{value.other}</strong></span>
          </div>
        )}
      </div>
    );
  }
  return <span style={{ color: 'var(--ink-400)' }}>—</span>;
}

// ── Composant KPI simple ──────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: '20px 22px',
      border: '1px solid var(--ink-150)', display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${color}15`, color: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${color}25`,
      }}>
        <Icon name={icon} size={20}/>
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>{value}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 500, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

const ROLE_META = {
  admin:        { label: 'Admin',         color: '#1B4F8C', bg: '#E6EDF6' },
  gestionnaire: { label: 'Gestionnaire',  color: '#1F9D6B', bg: '#DCF5E7' },
  collaborateur:{ label: 'Collaborateur', color: '#F39200', bg: '#FFEFD4' },
  comptable:    { label: 'Comptable',     color: '#7C3AED', bg: '#F3F0FF' },
};

// ── Ecran Admin ───────────────────────────────────────────────
export function AdminScreen() {
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cadrageResponses, setCadrageResponses] = useState([]);
  const [expandedCadrage, setExpandedCadrage] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchUsers().catch(() => []),
      fetchProducts().catch(() => []),
      fetchWarehouses().catch(() => []),
      fetchCategories().catch(() => []),
      fetchAllCadrageResponses().catch(() => []),
    ]).then(([u, p, w, c, cr]) => {
      setUsers(u); setProducts(p); setWarehouses(w); setCategories(c); setCadrageResponses(cr);
    }).finally(() => setLoading(false));
  }, []);

  async function handleDeleteUser(u) {
    if (!confirm(`Supprimer ${u.name} ? Cette action est irreversible.`)) return;
    try {
      await deleteUser(u.id);
      toast({ tone: 'success', message: `${u.name} a ete supprime.` });
      setUsers(prev => prev.filter(x => x.id !== u.id));
    } catch (err) { toast({ tone: 'danger', message: err.message }); }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, fontSize: 14, color: 'var(--ink-500)' }}>
      Chargement de l'administration...
    </div>
  );

  const totalStockValue = products.reduce((s, p) => s + p.qty * p.price, 0);
  const ruptures = products.filter(p => p.qty === 0).length;
  const onlineUsers = users.filter(u => u.online).length;
  const cadrageComplete = cadrageResponses.filter(r => r.progress >= 100).length;

  return (
    <div className="anim-fade screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--navy-100)', color: 'var(--navy-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="settings" size={18}/>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink-900)' }}>Administration</h1>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-500)' }}>Gestion de la plateforme Noe Services</p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--ink-200)', overflowX: 'auto' }}>
        {TABS.map(t => {
          const active = tab === t.id;
          const badge = t.id === 'cadrage' && cadrageResponses.length > 0 ? cadrageResponses.length : null;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', whiteSpace: 'nowrap',
              fontSize: 13.5, fontWeight: 600,
              color: active ? 'var(--navy-700)' : 'var(--ink-500)',
              borderBottom: active ? '2px solid var(--navy-700)' : '2px solid transparent',
              marginBottom: -1, transition: 'color 0.15s',
            }}>
              <Icon name={t.icon} size={16} strokeWidth={active ? 2 : 1.75}/>
              {t.label}
              {badge && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 18, minWidth: 18, padding: '0 5px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: active ? 'var(--navy-100)' : 'var(--ink-100)', color: active ? 'var(--navy-700)' : 'var(--ink-500)' }}>{badge}</span>}
            </button>
          );
        })}
      </div>

      {/* ══════ VUE D'ENSEMBLE ══════ */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <StatCard label="Utilisateurs" value={users.length} icon="users" color="#1B4F8C"/>
            <StatCard label="Produits" value={products.length} icon="box" color="#1F9D6B"/>
            <StatCard label="Valeur stock" value={`${(totalStockValue / 1_000_000).toFixed(1)}M`} icon="chart" color="#F39200"/>
            <StatCard label="Ruptures" value={ruptures} icon="alert" color="#D8334A"/>
          </div>

          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Depots */}
            <Card>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Depots</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {warehouses.map(w => {
                  const whProducts = products.filter(p => p.warehouseId === w.id || p.warehouse?.code === w.code);
                  const whValue = whProducts.reduce((s, p) => s + p.qty * p.price, 0);
                  return (
                    <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--ink-50)', borderRadius: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--navy-700)', background: 'var(--navy-50)', border: '1px solid var(--navy-100)', borderRadius: 6, padding: '4px 8px', fontFamily: 'var(--font-mono)' }}>{w.code}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-900)' }}>{w.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{whProducts.length} produits · {fcfa(whValue)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Utilisateurs recents */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Equipe</h3>
                <Badge tone={onlineUsers > 0 ? 'success' : 'neutral'} size="xs" dot>{onlineUsers} en ligne</Badge>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {users.slice(0, 5).map(u => {
                  const rm = ROLE_META[u.role] || ROLE_META.collaborateur;
                  return (
                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                      <Avatar initials={u.avatarInitials} color={u.avatarColor} size={34} online={u.online}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{u.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>{u.email}</div>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 22, padding: '0 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: rm.bg, color: rm.color }}>{rm.label}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Cadrage status */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--orange-100)', color: 'var(--orange-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="clipboard" size={22}/>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)' }}>Questionnaire de cadrage</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 2 }}>
                    {cadrageResponses.length === 0 ? 'Aucune reponse recue' : `${cadrageResponses.length} reponse${cadrageResponses.length > 1 ? 's' : ''} · ${cadrageComplete} complete${cadrageComplete > 1 ? 's' : ''}`}
                  </div>
                </div>
              </div>
              <Button variant="secondary" size="md" onClick={() => setTab('cadrage')}>Voir les reponses</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ══════ UTILISATEURS ══════ */}
      {tab === 'users' && (
        <Card padding="none">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 50px', gap: 0, padding: '10px 18px', borderBottom: '1px solid var(--ink-200)', background: 'var(--ink-50)', borderRadius: 'var(--r-lg) var(--r-lg) 0 0' }}>
            {['Utilisateur', 'Role', 'Depot', 'Derniere activite', ''].map((col, i) => (
              <div key={i} style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 8px' }}>{col}</div>
            ))}
          </div>
          {users.map((u, idx) => {
            const rm = ROLE_META[u.role] || ROLE_META.collaborateur;
            return (
              <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 50px', alignItems: 'center', padding: '14px 18px', borderBottom: idx === users.length - 1 ? 'none' : '1px solid var(--ink-100)', transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
                  <Avatar initials={u.avatarInitials} color={u.avatarColor} size={36} online={u.online}/>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-900)' }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ padding: '0 8px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 22, padding: '0 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: rm.bg, color: rm.color }}>{rm.label}</span>
                </div>
                <div style={{ padding: '0 8px', fontSize: 13, color: 'var(--ink-700)' }}>{u.warehouse?.label || 'Tous'}</div>
                <div style={{ padding: '0 8px', fontSize: 12, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{timeAgo(u.lastSeen)}</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button onClick={() => handleDeleteUser(u)} title="Supprimer" style={{ width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-400)', transition: 'all 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger-600)'; e.currentTarget.style.background = 'var(--danger-100)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-400)'; e.currentTarget.style.background = 'transparent'; }}>
                    <Icon name="trash" size={15}/>
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* ══════ DEPOTS ══════ */}
      {tab === 'warehouses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {warehouses.map(w => {
            const whProducts = products.filter(p => p.warehouseId === w.id || p.warehouse?.code === w.code);
            const whQty = whProducts.reduce((s, p) => s + p.qty, 0);
            const whValue = whProducts.reduce((s, p) => s + p.qty * p.price, 0);
            const whUsers = users.filter(u => u.warehouse?.code === w.code);
            const whRuptures = whProducts.filter(p => p.qty === 0).length;
            return (
              <Card key={w.id} padding="none" style={{ padding: '22px 26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--navy-700)', background: 'var(--navy-50)', border: '1px solid var(--navy-100)', borderRadius: 8, padding: '6px 12px', fontFamily: 'var(--font-mono)' }}>{w.code}</span>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink-900)' }}>{w.label}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 2 }}>Cree {timeAgo(w.createdAt)}</div>
                  </div>
                </div>
                <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  <div style={{ background: 'var(--ink-50)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-900)' }}>{whProducts.length}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 4 }}>Produits</div>
                  </div>
                  <div style={{ background: 'var(--ink-50)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-900)' }}>{num(whQty)}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 4 }}>Unites en stock</div>
                  </div>
                  <div style={{ background: 'var(--ink-50)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-900)' }}>{fcfa(whValue)}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 4 }}>Valeur</div>
                  </div>
                  <div style={{ background: whRuptures > 0 ? 'var(--danger-100)' : 'var(--success-100)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: whRuptures > 0 ? 'var(--danger-700)' : 'var(--success-700)' }}>{whRuptures}</div>
                    <div style={{ fontSize: 11.5, color: whRuptures > 0 ? 'var(--danger-600)' : 'var(--success-600)', marginTop: 4 }}>Ruptures</div>
                  </div>
                </div>
                {whUsers.length > 0 && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--ink-500)', marginRight: 6 }}>Equipe :</span>
                    {whUsers.map(u => (
                      <Avatar key={u.id} initials={u.avatarInitials} color={u.avatarColor} size={28} online={u.online}/>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ══════ CATEGORIES ══════ */}
      {tab === 'categories' && (
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {categories.map(c => {
            const catProducts = products.filter(p => p.categoryId === c.id || p.category?.slug === c.slug);
            const catQty = catProducts.reduce((s, p) => s + p.qty, 0);
            const catValue = catProducts.reduce((s, p) => s + p.qty * p.price, 0);
            return (
              <Card key={c.id} padding="none" style={{ padding: '18px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}18`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${c.color}30` }}>
                    <Icon name={c.icon} size={20}/>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)' }}>{c.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{c.slug}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div><span style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink-900)' }}>{catProducts.length}</span> <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>produits</span></div>
                  <div><span style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink-900)' }}>{num(catQty)}</span> <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>unites</span></div>
                  <div><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-700)' }}>{fcfa(catValue)}</span></div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ══════ REPONSES CADRAGE ══════ */}
      {tab === 'cadrage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="secondary" icon="download" size="md" onClick={() => exportCadrageResponses()}>Exporter CSV</Button>
          </div>

          {cadrageResponses.length === 0 ? (
            <Card padding="none" style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-400)' }}>
                  <Icon name="clipboard" size={26}/>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-800)' }}>Aucune reponse pour le moment</div>
                <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Les reponses apparaitront ici une fois que des utilisateurs auront rempli le questionnaire.</div>
              </div>
            </Card>
          ) : cadrageResponses.map(r => {
            const isExpanded = expandedCadrage === r.id;
            const isComplete = r.progress >= 100;
            return (
              <Card key={r.id} padding="none" style={{ overflow: 'visible' }}>
                <div onClick={() => setExpandedCadrage(isExpanded ? null : r.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', cursor: 'pointer', transition: 'background 0.12s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: isComplete ? 'var(--success-100)' : 'var(--orange-100)', color: isComplete ? 'var(--success-700)' : 'var(--orange-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={isComplete ? 'check' : 'clipboard'} size={22} strokeWidth={isComplete ? 2.5 : 2}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)' }}>{r.respondent}</span>
                      <Badge tone={isComplete ? 'success' : 'warn'} size="xs">{isComplete ? 'Complet' : `${r.progress}%`}</Badge>
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 3 }}>
                      {r.user?.email} · Derniere maj {timeAgo(r.updatedAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 80, height: 6, background: 'var(--ink-100)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${r.progress}%`, borderRadius: 999, background: isComplete ? 'var(--success-500)' : 'var(--orange-500)' }}/>
                    </div>
                    <Icon name={isExpanded ? 'chevronDown' : 'chevronRight'} size={16} color="var(--ink-400)"/>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--ink-150)', padding: '20px 22px' }}>
                    {Object.entries(r.responses).length === 0 ? (
                      <div style={{ fontSize: 13, color: 'var(--ink-500)', textAlign: 'center', padding: 20 }}>Aucune reponse enregistree.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {Object.entries(
                          Object.entries(r.responses).reduce((acc, [qId, val]) => {
                            const sectionId = qId.replace(/_\d+$/, '').replace('q', 's');
                            if (!acc[sectionId]) acc[sectionId] = [];
                            acc[sectionId].push({ qId, val });
                            return acc;
                          }, {})
                        ).map(([sectionId, questions]) => (
                          <div key={sectionId}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy-700)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid var(--navy-100)' }}>
                              {SECTION_LABELS[sectionId] || sectionId}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                              {questions.map(({ qId, val }) => (
                                <div key={qId} style={{ padding: '10px 14px', background: 'var(--ink-50)', borderRadius: 10, borderLeft: '3px solid var(--navy-200)' }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-500)', marginBottom: 6 }}>
                                    {QUESTION_LABELS[qId] || qId}
                                  </div>
                                  <div style={{ fontSize: 13.5, color: 'var(--ink-900)', lineHeight: 1.6, fontWeight: 500 }}>
                                    <FormatAnswer value={val}/>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
