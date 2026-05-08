import { useState, useRef, useEffect } from 'react';
import { Icon, LogoMark } from './Icon';
import { Avatar, useToast } from './Primitives';

const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Tableau de bord',  icon: 'dashboard',       mobileLabel: 'Accueil' },
  { id: 'products',      label: 'Produits',         icon: 'box',             mobileLabel: 'Produits' },
  { id: 'movements',     label: 'Mouvements',       icon: 'arrowsLeftRight', mobileLabel: 'Mouvements' },
  { id: 'history',       label: 'Historique',       icon: 'history',         mobileLabel: 'Historique' },
  { id: 'reports',       label: 'Rapports',         icon: 'chart',           mobileLabel: 'Rapports' },
  { id: 'users',         label: 'Utilisateurs',     icon: 'users',           mobileLabel: 'Equipe' },
  { id: 'notifications', label: 'Notifications',    icon: 'bell',            mobileLabel: 'Alertes' },
  { id: 'cadrage',       label: 'Questionnaire',    icon: 'clipboard',       mobileLabel: 'Cadrage', highlight: true },
  { id: 'admin',         label: 'Administration',   icon: 'settings',        mobileLabel: 'Admin', adminOnly: true },
];

const MOBILE_NAV = ['dashboard', 'products', 'movements', 'history', 'reports', 'users', 'notifications', 'cadrage', 'admin'];

export function Sidebar({ current, onNavigate, collapsed, unreadCount, currentUser, onLogout }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="ui-chrome desktop-sidebar" style={{
        width: collapsed ? 72 : 248,
        flexShrink: 0,
        background: 'var(--navy-900)',
        color: 'white',
        flexDirection: 'column',
        transition: 'width 0.22s ease',
        borderRight: '1px solid var(--navy-800)',
        position: 'sticky', top: 0, height: '100vh',
        zIndex: 10,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: collapsed ? '20px 16px' : '20px 20px',
          height: 64, borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
        }}>
          <LogoMark size={36}/>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em' }}>NOE Services</div>
              <div style={{ fontSize: 10.5, color: 'var(--navy-300)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Gestion de stock</div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!collapsed && (
            <div style={{ padding: '12px 12px 6px', fontSize: 10.5, fontWeight: 700, color: 'var(--navy-400)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Navigation
            </div>
          )}
          {NAV_ITEMS.filter(item => !item.adminOnly || currentUser.role === 'admin').map(item => {
            const active = current === item.id;
            const showBadge = item.id === 'notifications' && unreadCount > 0;
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: collapsed ? '11px' : '11px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--r-md)',
                  background: active ? 'rgba(243,146,0,0.12)' : 'transparent',
                  color: active ? 'var(--orange-300)' : 'var(--navy-200)',
                  fontSize: 13.5, fontWeight: active ? 600 : 500,
                  position: 'relative',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                {active && (
                  <span style={{
                    position: 'absolute', left: -10, top: 8, bottom: 8, width: 3,
                    background: 'var(--orange-500)', borderRadius: '0 3px 3px 0',
                  }}/>
                )}
                <Icon name={item.icon} size={19} strokeWidth={active ? 2 : 1.75}/>
                {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
                {!collapsed && showBadge && (
                  <span style={{
                    background: 'var(--orange-500)', color: 'white', fontSize: 10.5, fontWeight: 700,
                    height: 18, minWidth: 18, padding: '0 5px', borderRadius: 999,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>{unreadCount}</span>
                )}
                {!collapsed && item.highlight && !active && (
                  <span style={{
                    background: 'var(--orange-500)', color: 'white', fontSize: 9.5, fontWeight: 700,
                    height: 16, padding: '0 6px', borderRadius: 999,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    letterSpacing: '0.02em',
                  }}>IMPORTANT</span>
                )}
                {collapsed && (showBadge || item.highlight) && (
                  <span style={{
                    position: 'absolute', top: 6, right: 6,
                    background: 'var(--orange-500)', width: 8, height: 8, borderRadius: 999,
                    border: '2px solid var(--navy-900)',
                  }}/>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {!collapsed ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: 10, borderRadius: 'var(--r-md)',
              background: 'rgba(255,255,255,0.04)',
            }}>
              <Avatar initials={currentUser.avatar} color={currentUser.color} size={36} online={currentUser.online}/>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.name}</div>
                <div style={{ fontSize: 11, color: 'var(--navy-300)', textTransform: 'capitalize' }}>{currentUser.role}</div>
              </div>
              <button onClick={onLogout} title="Deconnexion" style={{ width: 28, height: 28, color: 'var(--navy-300)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--danger-500)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--navy-300)'}>
                <Icon name="logout" size={16}/>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar initials={currentUser.avatar} color={currentUser.color} size={36} online={currentUser.online}/>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {MOBILE_NAV.filter(id => { const item = NAV_ITEMS.find(n => n.id === id); return !item?.adminOnly || currentUser.role === 'admin'; }).map(id => {
          const item = NAV_ITEMS.find(n => n.id === id);
          const active = current === id;
          const showBadge = id === 'notifications' && unreadCount > 0;
          return (
            <button key={id} onClick={() => onNavigate(id)} className={active ? 'active' : ''}>
              <Icon name={item.icon} size={20} strokeWidth={active ? 2.2 : 1.75}/>
              <span>{item.mobileLabel}</span>
              {showBadge && <span className="nav-badge"/>}
            </button>
          );
        })}
      </nav>
    </>
  );
}

export function Topbar({ title, subtitle, onToggleSidebar, search, setSearch, onLogout, currentUser, unreadCount, onNavigate, onReopenOnboarding }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const ref = useRef(null);
  const searchRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenMenu(null);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // Recherche en temps reel
  useEffect(() => {
    if (!search || search.length < 2) { setSearchResults([]); return; }
    const doSearch = async () => {
      try {
        const token = localStorage.getItem('noe_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        const res = await fetch(`${apiUrl}/products?search=${encodeURIComponent(search)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const products = await res.json();
          setSearchResults(products.slice(0, 6));
        }
      } catch {}
    };
    const timer = setTimeout(doSearch, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const comingSoon = (label) => {
    toast({ tone: 'neutral', message: `${label} sera disponible dans une prochaine version.` });
    setOpenMenu(null);
  };

  return (
    <header className="ui-chrome topbar" style={{
      height: 64, flexShrink: 0,
      background: 'rgba(251,251,248,0.85)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--ink-150)',
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 9,
    }}>
      <button onClick={onToggleSidebar} style={{
        width: 36, height: 36, color: 'var(--ink-600)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 8, transition: 'background 0.15s',
      }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ink-100)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <Icon name="menu" size={20}/>
      </button>

      <div style={{ minWidth: 0 }}>
        <div className="page-title" style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ink-900)' }}>{title}</div>
        {subtitle && <div className="page-subtitle" style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 1 }}>{subtitle}</div>}
      </div>

      {/* Recherche globale */}
      <div ref={searchRef} className="topbar-search" style={{ flex: 1, maxWidth: 480, marginLeft: 'auto', position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          height: 40, padding: '0 14px',
          background: 'white',
          border: `1px solid ${searchFocused ? 'var(--navy-500)' : 'var(--ink-200)'}`, borderRadius: 'var(--r-md)',
          boxShadow: searchFocused ? '0 0 0 3px rgba(27,79,140,0.1)' : 'var(--shadow-xs)',
          transition: 'all 0.15s',
        }}>
          <Icon name="search" size={16} color="var(--ink-500)"/>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Rechercher un produit, une reference..."
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--ink-900)' }}/>
          {search && (
            <button onClick={() => { setSearch(''); setSearchResults([]); }} style={{ color: 'var(--ink-400)', display: 'flex' }}>
              <Icon name="x" size={14}/>
            </button>
          )}
        </div>

        {/* Resultats de recherche */}
        {searchFocused && search.length >= 2 && (
          <div className="anim-fade" style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            background: 'white', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)',
            boxShadow: 'var(--shadow-lg)', padding: 6, zIndex: 30, maxHeight: 360, overflowY: 'auto',
          }}>
            {searchResults.length === 0 ? (
              <div style={{ padding: '16px 12px', textAlign: 'center', fontSize: 13, color: 'var(--ink-500)' }}>
                Aucun produit trouve pour "{search}"
              </div>
            ) : (
              <>
                <div style={{ padding: '6px 10px', fontSize: 11, fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {searchResults.length} resultat{searchResults.length > 1 ? 's' : ''}
                </div>
                {searchResults.map(p => (
                  <button key={p.sku} onClick={() => {
                    setSearch(''); setSearchResults([]); setSearchFocused(false);
                    onNavigate('__direct__:/products/' + p.sku);
                  }} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '10px 10px', borderRadius: 8, textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: 'var(--ink-100)', color: 'var(--ink-500)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name="box" size={16}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 1, fontFamily: 'var(--font-mono)' }}>{p.sku} · {p.qty} {p.unit}</div>
                    </div>
                    <Icon name="chevronRight" size={14} color="var(--ink-400)"/>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
        <button onClick={() => onNavigate('notifications')} style={{
          width: 40, height: 40, color: 'var(--ink-600)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 8, position: 'relative', transition: 'background 0.15s',
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ink-100)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          <Icon name="bell" size={18}/>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 8, right: 8,
              background: 'var(--orange-500)', color: 'white', fontSize: 9.5, fontWeight: 700,
              height: 16, minWidth: 16, padding: '0 4px', borderRadius: 999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--paper)',
            }}>{unreadCount}</span>
          )}
        </button>

        <button onClick={() => setOpenMenu(openMenu === 'user' ? null : 'user')} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '4px 10px 4px 4px', borderRadius: 'var(--r-md)',
          transition: 'background 0.15s',
          background: openMenu === 'user' ? 'var(--ink-100)' : 'transparent',
        }}
          onMouseEnter={(e) => { if (openMenu !== 'user') e.currentTarget.style.background = 'var(--ink-100)'; }}
          onMouseLeave={(e) => { if (openMenu !== 'user') e.currentTarget.style.background = 'transparent'; }}>
          <Avatar initials={currentUser.avatar} color={currentUser.color} size={32}/>
          <div className="topbar-user-details" style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-900)' }}>{currentUser.name.split(' ')[0]}</div>
            <div style={{ fontSize: 10.5, color: 'var(--ink-500)', textTransform: 'capitalize' }}>{currentUser.role}</div>
          </div>
          <span className="topbar-chevron"><Icon name="chevronDown" size={14} color="var(--ink-500)"/></span>
        </button>

        {openMenu === 'user' && (
          <div className="anim-fade" style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0,
            width: 240, background: 'white', borderRadius: 'var(--r-md)',
            boxShadow: 'var(--shadow-lg)', border: '1px solid var(--ink-150)',
            padding: 6, zIndex: 20,
          }}>
            <div style={{ padding: 12, borderBottom: '1px solid var(--ink-150)', marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>{currentUser.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2 }}>{currentUser.email}</div>
            </div>
            {[
              { icon: 'settings', label: 'Preferences', action: () => comingSoon('Preferences') },
              { icon: 'history',  label: 'Mes connexions', action: () => comingSoon('Historique des connexions') },
              { icon: 'info',     label: 'Aide & support', action: () => comingSoon('Aide & support') },
            ].map((m, i) => (
              <button key={i} onClick={m.action} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '8px 10px', borderRadius: 6, fontSize: 13, color: 'var(--ink-700)',
                textAlign: 'left',
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ink-50)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <Icon name={m.icon} size={15} color="var(--ink-500)"/>
                {m.label}
              </button>
            ))}
            <button onClick={() => { setOpenMenu(null); onReopenOnboarding?.(); }} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '8px 10px', borderRadius: 6, fontSize: 13, color: 'var(--orange-700)', fontWeight: 500,
              textAlign: 'left',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--orange-50)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <Icon name="info" size={15} color="var(--orange-600)"/>
              A propos de cette version
            </button>
            <div style={{ height: 1, background: 'var(--ink-150)', margin: '6px 0' }}/>
            <button onClick={() => { setOpenMenu(null); onLogout(); }} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '8px 10px', borderRadius: 6, fontSize: 13, color: 'var(--danger-700)', fontWeight: 500,
              textAlign: 'left',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--danger-100)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <Icon name="logout" size={15}/>
              Deconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
