import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Card, Badge, Input, FilterChip, Avatar, ProductImage, Button } from '../components/Primitives';
import { timeAgo } from '../data';
import { fetchMovements, fetchUsers, fetchWarehouses } from '../api';
import { exportMovementsCSV } from '../utils/csv';

function dayLabel(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Aujourd'hui";
  if (dateStr === yesterday) return 'Hier';
  const [y, m, d] = dateStr.split('-');
  const months = ['jan','fév','mar','avr','mai','juin','juil','août','sept','oct','nov','déc'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

export function HistoryScreen() {
  const [type, setType] = useState('all');
  const [user, setUser] = useState('all');
  const [wh,   setWh]   = useState('all');
  const [search, setSearch] = useState('');
  const [movements, setMovements] = useState([]);
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchMovements({ limit: '100' }), fetchUsers().catch(() => []), fetchWarehouses()])
      .then(([movData, usrs, whs]) => { setMovements(movData.movements || []); setUsers(usrs); setWarehouses(whs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const typeOptions = [{ value: 'all', label: 'Tous' }, { value: 'in', label: 'Entrées' }, { value: 'out', label: 'Sorties' }];
  const userOptions = [{ value: 'all', label: 'Tous' }, ...users.map(u => ({ value: u.name, label: u.name }))];
  const whOptions = [{ value: 'all', label: 'Tous' }, ...warehouses.map(w => ({ value: w.code, label: w.label }))];

  const filtered = movements.filter(m => {
    if (type !== 'all' && m.type !== type) return false;
    if (user !== 'all' && m.user?.name !== user) return false;
    if (wh !== 'all' && m.warehouse?.code !== wh) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.ref.toLowerCase().includes(q) && !(m.user?.name || '').toLowerCase().includes(q) && !(m.product?.name || '').toLowerCase().includes(q) && !(m.product?.sku || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const groups = [];
  const seen = {};
  filtered.forEach(m => {
    const day = m.date.slice(0, 10);
    if (!seen[day]) { seen[day] = true; groups.push({ day, items: [] }); }
    groups[groups.length - 1].items.push(m);
  });

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, fontSize: 14, color: 'var(--ink-500)' }}>Chargement...</div>;

  return (
    <div className="anim-fade screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink-900)' }}>Historique des mouvements</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--ink-500)' }}>{filtered.length} mouvement{filtered.length !== 1 ? 's' : ''} &middot; Journal complet des opérations</p>
        </div>
        <Button variant="secondary" icon="download" size="md" onClick={() => exportMovementsCSV(filtered)}>Exporter CSV</Button>
      </div>

      <Card padding="none" style={{ padding: '14px 16px', position: 'relative', zIndex: 10, overflow: 'visible' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 220px', minWidth: 180, maxWidth: 320 }}>
            <Input value={search} onChange={setSearch} placeholder="Rechercher réf, produit, user…" icon="search" size="sm" full />
          </div>
          <div style={{ width: 1, height: 28, background: 'var(--ink-200)', flexShrink: 0, margin: '0 2px' }} />
          <FilterChip label="Type : " value={type} options={typeOptions} onChange={setType} icon="arrowsLeftRight" />
          <FilterChip label="Dépôt : " value={wh} options={whOptions} onChange={setWh} icon="box" />
          <FilterChip label="User : " value={user} options={userOptions} onChange={setUser} icon="users" />
        </div>
      </Card>

      {groups.length === 0 ? (
        <Card padding="none" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-400)' }}><Icon name="history" size={26}/></div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-800)' }}>Aucun mouvement trouvé</div>
            <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Modifiez vos filtres de recherche.</div>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {groups.map(({ day, items }) => {
            const entries = items.filter(m => m.type === 'in').reduce((s, m) => s + m.qty, 0);
            const exits = items.filter(m => m.type === 'out').reduce((s, m) => s + m.qty, 0);
            return (
              <div key={day}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-700)' }}>{dayLabel(day)}</div>
                  <div style={{ flex: 1, height: 1, background: 'var(--ink-150)' }}/>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {entries > 0 && <Badge tone="success" size="xs" icon="arrowDown">+{entries} entrées</Badge>}
                    {exits > 0 && <Badge tone="orange" size="xs" icon="arrowUp">{exits} sorties</Badge>}
                  </div>
                </div>
                <Card padding="none">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {items.map((m, idx) => {
                      const isIn = m.type === 'in';
                      const userInitials = (m.user?.name || '??').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                      return (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: idx === items.length - 1 ? 'none' : '1px solid var(--ink-100)', transition: 'background 0.12s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: isIn ? 'var(--success-100)' : 'var(--orange-100)', color: isIn ? 'var(--success-700)' : 'var(--orange-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name={isIn ? 'arrowDown' : 'arrowUp'} size={16} strokeWidth={2.5}/>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: isIn ? 'var(--success-700)' : 'var(--orange-700)', fontFamily: 'var(--font-mono)' }}>{isIn ? '+' : '−'}{m.qty}</span>
                              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260 }}>{m.product?.name || m.product?.sku}</span>
                              <Badge tone="neutral" size="xs">{m.ref}</Badge>
                            </div>
                            <div style={{ marginTop: 3, fontSize: 12, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{m.note}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <Avatar initials={userInitials} size={16} color="var(--navy-700)"/>
                            <span style={{ fontSize: 12.5, color: 'var(--ink-600)', fontWeight: 500, whiteSpace: 'nowrap' }}>{m.user?.name}</span>
                          </div>
                          <div style={{ flexShrink: 0 }}>
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--navy-700)', background: 'var(--navy-50)', border: '1px solid var(--navy-100)', borderRadius: 4, padding: '2px 7px' }}>{m.warehouse?.code}</span>
                          </div>
                          <div style={{ flexShrink: 0, fontSize: 11.5, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{timeAgo(m.date)}</div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
