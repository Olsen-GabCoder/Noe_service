import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Card, Badge, Button } from '../components/Primitives';
import { timeAgo } from '../data';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../api';

const NOTIF_META = {
  rupture:  { icon: 'alert',           color: 'var(--danger-700)',  bg: 'var(--danger-100)',  label: 'Rupture' },
  low:      { icon: 'alert',           color: 'var(--warn-700)',    bg: 'var(--warn-100)',    label: 'Stock faible' },
  task:     { icon: 'flag',            color: 'var(--navy-700)',    bg: 'var(--navy-100)',    label: 'Tâche' },
  movement: { icon: 'arrowsLeftRight', color: 'var(--success-700)', bg: 'var(--success-100)', label: 'Mouvement' },
  login:    { icon: 'users',           color: '#7C3AED',           bg: '#F3F0FF',            label: 'Connexion' },
};
const TONE_MAP = { rupture: 'danger', low: 'warn', task: 'navy', movement: 'success', login: 'neutral' };

export function NotificationsScreen({ onUnreadChange, onNavigate }) {
  const [tab, setTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function handleMarkOne(notif) {
    if (notif.read) return;
    try {
      await markNotificationRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      onUnreadChange?.(notifications.filter(n => !n.read && n.id !== notif.id).length);
    } catch {}
  }

  function handleViewProduct(notif) {
    handleMarkOne(notif);
    if (notif.product?.sku) {
      onNavigate?.('__direct__:/products/' + notif.product.sku);
    }
  }

  async function load() {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
      onUnreadChange?.(data.filter(n => !n.read).length);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const unreadCount  = notifications.filter(n => !n.read).length;
  const ruptureCount = notifications.filter(n => n.type === 'rupture').length;
  const lowCount     = notifications.filter(n => n.type === 'low').length;
  const taskCount    = notifications.filter(n => n.type === 'task').length;

  const tabs = [
    { value: 'all',     label: 'Tout',        count: notifications.length },
    { value: 'unread',  label: 'Non lus',     count: unreadCount },
    { value: 'rupture', label: 'Ruptures',    count: ruptureCount },
    { value: 'low',     label: 'Stock faible', count: lowCount },
    { value: 'task',    label: 'Tâches',       count: taskCount },
  ];

  const filtered = notifications.filter(n => {
    if (tab === 'all') return true;
    if (tab === 'unread') return !n.read;
    return n.type === tab;
  });

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    load();
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, fontSize: 14, color: 'var(--ink-500)' }}>Chargement...</div>;

  return (
    <div className="anim-fade screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink-900)' }}>Notifications</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--ink-500)' }}>
            {unreadCount > 0 ? <>{unreadCount} notification{unreadCount !== 1 ? 's' : ''} non lue{unreadCount !== 1 ? 's' : ''}</> : 'Tout est à jour'}
          </p>
        </div>
        {unreadCount > 0 && <Button variant="secondary" icon="check" size="md" onClick={handleMarkAllRead}>Tout marquer comme lu</Button>}
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--ink-200)' }}>
        {tabs.map(t => {
          const active = tab === t.value;
          return (
            <button key={t.value} onClick={() => setTab(t.value)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', fontSize: 13.5, fontWeight: 600, color: active ? 'var(--navy-700)' : 'var(--ink-500)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: active ? '2px solid var(--navy-700)' : '2px solid transparent', marginBottom: -1 }}>
              {t.label}
              {t.count > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 20, minWidth: 20, padding: '0 6px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, background: active ? (t.value === 'unread' ? 'var(--orange-100)' : 'var(--navy-100)') : 'var(--ink-100)', color: active ? (t.value === 'unread' ? 'var(--orange-700)' : 'var(--navy-800)') : 'var(--ink-500)' }}>{t.count}</span>}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Card padding="none" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-400)' }}><Icon name="bell" size={26}/></div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-800)' }}>Aucune notification</div>
            <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Vous êtes à jour.</div>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((n, idx) => {
              const meta = NOTIF_META[n.type] || NOTIF_META.movement;
              const tone = TONE_MAP[n.type] || 'neutral';
              return (
                <div key={n.id} onClick={() => handleMarkOne(n)} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid var(--ink-100)', background: n.read ? 'transparent' : 'var(--orange-50)', position: 'relative', cursor: !n.read ? 'pointer' : 'default', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = n.read ? 'var(--ink-50)' : 'var(--orange-100)'} onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'var(--orange-50)'}>
                  {!n.read && <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 7, height: 7, borderRadius: 999, background: 'var(--orange-500)' }}/>}
                  <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: !n.read ? 8 : 0 }}>
                    <Icon name={meta.icon} size={18} strokeWidth={2}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-900)' }}>{n.title}</span>
                      <Badge tone={tone} size="xs">{meta.label}</Badge>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-600)', lineHeight: 1.45, marginBottom: 6 }}>{n.detail}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 11.5, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)' }}>{timeAgo(n.date)}</span>
                      {n.product?.sku && <span style={{ fontSize: 11, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)' }}>{n.product.sku}</span>}
                    </div>
                  </div>
                  {n.product?.sku && (
                    <button onClick={(e) => { e.stopPropagation(); handleViewProduct(n); }} style={{
                      flexShrink: 0, height: 32, padding: '0 12px', borderRadius: 8,
                      border: '1px solid var(--ink-200)', background: 'white',
                      fontSize: 12, fontWeight: 600, color: 'var(--navy-700)',
                      display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                      transition: 'all 0.12s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--navy-50)'; e.currentTarget.style.borderColor = 'var(--navy-200)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--ink-200)'; }}>
                      Voir <Icon name="chevronRight" size={12}/>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
