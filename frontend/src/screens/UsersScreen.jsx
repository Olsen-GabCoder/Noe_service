import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Card, Badge, Avatar, Button, Modal, Input, useToast } from '../components/Primitives';
import { fetchUsers, fetchWarehouses, createUser, deleteUser } from '../api';
import { timeAgo } from '../data';

const ROLE_META = {
  admin:         { label: 'Administrateur', color: '#1B4F8C', bg: '#E6EDF6', desc: 'Accès complet' },
  gestionnaire:  { label: 'Gestionnaire',   color: '#1F9D6B', bg: '#DCF5E7', desc: 'Gestion du stock' },
  collaborateur: { label: 'Collaborateur',  color: '#F39200', bg: '#FFEFD4', desc: 'Saisie' },
  comptable:     { label: 'Comptable',      color: '#7C3AED', bg: '#F3F0FF', desc: 'Consultation' },
};

const PERMISSIONS = [
  { label: 'Voir les produits',          admin: true, gestionnaire: true, collaborateur: true, comptable: true },
  { label: 'Créer / modifier produits',  admin: true, gestionnaire: true, collaborateur: false, comptable: false },
  { label: 'Saisir mouvements',          admin: true, gestionnaire: true, collaborateur: true, comptable: false },
  { label: 'Valider mouvements',         admin: true, gestionnaire: true, collaborateur: false, comptable: false },
  { label: 'Voir les rapports',          admin: true, gestionnaire: true, collaborateur: false, comptable: true },
  { label: 'Exporter données',           admin: true, gestionnaire: true, collaborateur: false, comptable: true },
  { label: 'Gérer les utilisateurs',     admin: true, gestionnaire: false, collaborateur: false, comptable: false },
  { label: 'Configurer les dépôts',      admin: true, gestionnaire: false, collaborateur: false, comptable: false },
  { label: 'Accès toutes zones',         admin: true, gestionnaire: false, collaborateur: false, comptable: false },
];

const ROLES_ORDER = ['admin', 'gestionnaire', 'collaborateur', 'comptable'];

export function UsersScreen() {
  const [filter, setFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userMenu, setUserMenu] = useState(null);

  async function handleDeleteUser(u) {
    if (!confirm(`Supprimer ${u.name} ? Cette action est irreversible.`)) return;
    try {
      await deleteUser(u.id);
      toast({ tone: 'success', message: `${u.name} a ete supprime.` });
      const updated = await fetchUsers();
      setUsers(updated);
    } catch (err) { toast({ tone: 'danger', message: err.message }); }
  }
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', password: '', phone: '', role: 'collaborateur', warehouseId: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([fetchUsers(), fetchWarehouses()])
      .then(([u, w]) => { setUsers(u); setWarehouses(w); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleInvite() {
    if (!inviteForm.name || !inviteForm.email || !inviteForm.password) {
      toast({ tone: 'danger', message: 'Nom, email et mot de passe requis.' });
      return;
    }
    setSaving(true);
    try {
      await createUser({
        ...inviteForm,
        warehouseId: inviteForm.warehouseId || undefined,
      });
      toast({ tone: 'success', message: `${inviteForm.name} a été invité avec succès.` });
      setShowInvite(false);
      setInviteForm({ name: '', email: '', password: '', phone: '', role: 'collaborateur', warehouseId: '' });
      const updated = await fetchUsers();
      setUsers(updated);
    } catch (err) {
      toast({ tone: 'danger', message: err.message });
    } finally { setSaving(false); }
  }

  const roleCounts = ROLES_ORDER.reduce((acc, r) => { acc[r] = users.filter(u => u.role === r).length; return acc; }, {});
  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);
  const tabs = [{ value: 'all', label: 'Tous', count: users.length }, ...ROLES_ORDER.map(r => ({ value: r, label: ROLE_META[r].label, count: roleCounts[r] }))];

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, fontSize: 14, color: 'var(--ink-500)' }}>Chargement...</div>;

  return (
    <div className="anim-fade screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink-900)' }}>Utilisateurs</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--ink-500)' }}>{users.length} membres &middot; {users.filter(u => u.online).length} en ligne</p>
        </div>
        <Button variant="accent" icon="plus" size="md" onClick={() => setShowInvite(true)}>Inviter un utilisateur</Button>
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--ink-200)', paddingBottom: 0 }}>
        {tabs.map(t => {
          const active = filter === t.value;
          return (
            <button key={t.value} onClick={() => setFilter(t.value)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', fontSize: 13.5, fontWeight: 600, color: active ? 'var(--navy-700)' : 'var(--ink-500)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: active ? '2px solid var(--navy-700)' : '2px solid transparent', marginBottom: -1 }}>
              {t.label}
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 20, minWidth: 20, padding: '0 6px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, background: active ? 'var(--navy-100)' : 'var(--ink-100)', color: active ? 'var(--navy-800)' : 'var(--ink-500)' }}>{t.count}</span>
            </button>
          );
        })}
      </div>

      <Card padding="none">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1fr 0.8fr 40px', gap: 0, padding: '10px 18px', borderBottom: '1px solid var(--ink-200)', background: 'var(--ink-50)', borderRadius: 'var(--r-lg) var(--r-lg) 0 0' }}>
          {['Utilisateur', 'Rôle', 'Dépôt', 'Dernière connexion', 'Statut', ''].map((col, i) => (
            <div key={i} style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 8px' }}>{col}</div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map((u, idx) => {
            const rm = ROLE_META[u.role] || ROLE_META.collaborateur;
            const whLabel = u.warehouse ? u.warehouse.label : 'Tous dépôts';
            return (
              <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1fr 0.8fr 40px', alignItems: 'center', padding: '14px 18px', borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid var(--ink-100)', transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px' }}>
                  <Avatar initials={u.avatarInitials} color={u.avatarColor} size={40} online={u.online}/>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)' }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 1 }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ padding: '0 8px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 24, padding: '0 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: rm.bg, color: rm.color, border: `1px solid ${rm.color}33` }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: rm.color, flexShrink: 0 }}/>{rm.label}
                  </span>
                </div>
                <div style={{ padding: '0 8px', fontSize: 13, color: 'var(--ink-700)', fontWeight: 500 }}>{whLabel}</div>
                <div style={{ padding: '0 8px', fontSize: 12.5, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{timeAgo(u.lastSeen)}</div>
                <div style={{ padding: '0 8px' }}><Badge tone={u.online ? 'success' : 'neutral'} size="xs" dot>{u.online ? 'En ligne' : 'Hors ligne'}</Badge></div>
                <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                  <button onClick={(e) => { e.stopPropagation(); setUserMenu(userMenu === u.id ? null : u.id); }} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-400)', border: 'none', background: userMenu === u.id ? 'var(--ink-100)' : 'transparent', cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={e => { if (userMenu !== u.id) e.currentTarget.style.background = 'var(--ink-100)'; }}
                    onMouseLeave={e => { if (userMenu !== u.id) e.currentTarget.style.background = 'transparent'; }}>
                    <Icon name="moreH" size={16}/>
                  </button>
                  {userMenu === u.id && (
                    <div className="anim-fade" style={{ position: 'absolute', top: '100%', right: 0, width: 160, background: 'white', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--ink-150)', padding: 4, zIndex: 20 }}>
                      <button onClick={() => { setUserMenu(null); toast({ tone: 'neutral', message: 'Modification utilisateur bientot disponible.' }); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 6, fontSize: 12.5, color: 'var(--ink-700)', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Icon name="edit" size={14} color="var(--ink-500)"/> Modifier
                      </button>
                      <button onClick={() => { setUserMenu(null); handleDeleteUser(u); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 6, fontSize: 12.5, color: 'var(--danger-700)', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-100)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Icon name="trash" size={14}/> Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Matrice des permissions</h3>
          <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--ink-500)' }}>Droits d'accès par rôle</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ink-200)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.06em', width: '36%', background: 'var(--ink-50)' }}>Permission</th>
                {ROLES_ORDER.map(r => {
                  const rm = ROLE_META[r];
                  return <th key={r} style={{ padding: '10px 14px', textAlign: 'center', background: 'var(--ink-50)', width: '16%' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 22, padding: '0 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, background: rm.bg, color: rm.color }}>
                      <span style={{ width: 5, height: 5, borderRadius: 999, background: rm.color }}/>{rm.label}
                    </span>
                  </th>;
                })}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((perm, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--ink-100)', background: idx % 2 === 0 ? 'white' : 'var(--ink-50)' }}>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 500, color: 'var(--ink-800)' }}>{perm.label}</td>
                  {ROLES_ORDER.map(r => (
                    <td key={r} style={{ padding: '11px 14px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 999, background: perm[r] ? 'var(--success-100)' : 'var(--ink-100)', color: perm[r] ? 'var(--success-700)' : 'var(--ink-400)' }}>
                        <Icon name={perm[r] ? 'check' : 'x'} size={12} strokeWidth={2.5}/>
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal invitation */}
      <Modal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        title="Inviter un utilisateur"
        subtitle="Le nouvel utilisateur recevra ses identifiants de connexion."
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowInvite(false)}>Annuler</Button>
            <Button variant="accent" icon="plus" onClick={handleInvite}>
              {saving ? 'Envoi...' : 'Inviter'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Nom complet" value={inviteForm.name} onChange={v => setInviteForm(f => ({ ...f, name: v }))} placeholder="Ex. Jean Dupont" icon="users" full />
          <Input label="Adresse e-mail" value={inviteForm.email} onChange={v => setInviteForm(f => ({ ...f, email: v }))} placeholder="jean@noeservices.ga" type="email" icon="users" full />
          <Input label="Mot de passe" value={inviteForm.password} onChange={v => setInviteForm(f => ({ ...f, password: v }))} placeholder="Mot de passe initial" type="password" full />
          <Input label="Téléphone" value={inviteForm.phone} onChange={v => setInviteForm(f => ({ ...f, phone: v }))} placeholder="+241 0X XX XX XX" full />

          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 8 }}>Rôle</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ROLES_ORDER.map(r => {
                const rm = ROLE_META[r];
                const selected = inviteForm.role === r;
                return (
                  <button key={r} onClick={() => setInviteForm(f => ({ ...f, role: r }))} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 32, padding: '0 12px', borderRadius: 999,
                    border: selected ? `2px solid ${rm.color}` : '1.5px solid var(--ink-200)',
                    background: selected ? rm.bg : 'white',
                    color: selected ? rm.color : 'var(--ink-700)',
                    fontSize: 12.5, fontWeight: selected ? 700 : 500, cursor: 'pointer',
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: selected ? rm.color : 'var(--ink-300)' }}/>
                    {rm.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 8 }}>Dépôt assigné</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => setInviteForm(f => ({ ...f, warehouseId: '' }))} style={{
                height: 32, padding: '0 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                border: !inviteForm.warehouseId ? '2px solid var(--navy-600)' : '1.5px solid var(--ink-200)',
                background: !inviteForm.warehouseId ? 'var(--navy-50)' : 'white',
                color: !inviteForm.warehouseId ? 'var(--navy-700)' : 'var(--ink-600)',
              }}>Tous</button>
              {warehouses.map(w => {
                const selected = inviteForm.warehouseId === w.id;
                return (
                  <button key={w.id} onClick={() => setInviteForm(f => ({ ...f, warehouseId: w.id }))} style={{
                    height: 32, padding: '0 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                    border: selected ? '2px solid var(--navy-600)' : '1.5px solid var(--ink-200)',
                    background: selected ? 'var(--navy-50)' : 'white',
                    color: selected ? 'var(--navy-700)' : 'var(--ink-600)',
                  }}>{w.code} — {w.label}</button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
