import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Button, Card, Badge, ProductImage, Placeholder } from '../components/Primitives';
import { FlowChart, DonutChart, TopMoversBars, Sparkline } from '../components/Charts';
import { num, stockStatus, computeKPIs, timeAgo } from '../data';
import { fetchProducts, fetchFlow, fetchTopMovers, fetchRecentActivity, fetchCategories } from '../api';
import { useAuth } from '../context/AuthContext';
import { exportProductsCSV } from '../utils/csv';

export function DashboardScreen({ onNavigate }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [flow, setFlow] = useState([]);
  const [topMovers, setTopMovers] = useState([]);
  const [recent, setRecent] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchProducts(),
      fetchFlow(),
      fetchTopMovers(),
      fetchRecentActivity(),
      fetchCategories(),
    ]).then(([prods, fl, tm, rec, cats]) => {
      setProducts(prods);
      setFlow(fl);
      setTopMovers(tm);
      setRecent(rec);
      setCategories(cats);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ fontSize: 14, color: 'var(--ink-500)' }}>Chargement du tableau de bord...</div>
      </div>
    );
  }

  const kpis = computeKPIs(products);

  const catData = categories.map(c => {
    const items = products.filter(p => p.category?.slug === c.slug || p.categoryId === c.id);
    const value = items.reduce((s, p) => s + p.qty, 0);
    return { label: c.label, value, color: c.color };
  }).filter(d => d.value > 0);

  const lowStock = products.filter(p => p.qty > 0 && p.qty <= p.threshold).slice(0, 4);
  const ruptures = products.filter(p => p.qty === 0).slice(0, 4);

  const sparkA = [120, 124, 128, 130, 134, 138, 142];
  const sparkD = [4.2, 4.4, 4.5, 4.6, 4.8, 4.9, 5.1];

  const firstName = user?.name?.split(' ')[0] || 'Utilisateur';
  const now = new Date();
  const jours = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const mois = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const dateStr = `${jours[now.getDay()]} ${now.getDate()} ${mois[now.getMonth()]} ${now.getFullYear()} · ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  return (
    <div className="anim-fade screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* HERO BANNER */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 'var(--r-xl)',
        background: 'linear-gradient(120deg, var(--navy-900) 0%, var(--navy-700) 100%)',
        color: 'white', padding: '28px 32px',
      }}>
        <div style={{
          position: 'absolute', right: -60, top: -60, width: 280, height: 280,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(243,146,0,0.4), transparent 70%)',
        }}/>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--orange-300)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
              {dateStr}
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Bonjour {firstName}, voici votre stock du jour
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--navy-200)', maxWidth: 540 }}>
              Vous avez <strong style={{ color: 'var(--orange-300)' }}>{kpis.ruptures} rupture{kpis.ruptures !== 1 ? 's' : ''}</strong> et <strong style={{ color: 'var(--orange-300)' }}>{kpis.low} produit{kpis.low !== 1 ? 's' : ''} en alerte</strong> à traiter.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="accent" icon="plus" onClick={() => onNavigate('movements')}>Nouveau mouvement</Button>
            <Button variant="secondary" icon="download" onClick={() => exportProductsCSV(products)}>Exporter</Button>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <Card padding="none" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Produits actifs</div>
              <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>{num(kpis.total)}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--navy-100)', color: 'var(--navy-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="box" size={20}/>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Badge tone="success" size="xs" icon="arrowUp">+3 cette semaine</Badge>
            <Sparkline data={sparkA} color="var(--navy-700)"/>
          </div>
        </Card>

        <Card padding="none" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Valeur stock</div>
              <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>{(kpis.totalValue / 1_000_000).toFixed(1)}<span style={{ fontSize: 16, color: 'var(--ink-500)', marginLeft: 4 }}>M FCFA</span></div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--success-100)', color: 'var(--success-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="chart" size={20}/>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Badge tone="success" size="xs" icon="arrowUp">+8,4 % vs 30j</Badge>
            <Sparkline data={sparkD} color="var(--success-500)"/>
          </div>
        </Card>

        <Card padding="none" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'var(--warn-100)', opacity: 0.6 }}/>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Stock faible</div>
              <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--warn-700)' }}>{kpis.low}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--warn-100)', color: 'var(--warn-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="alert" size={20}/>
            </div>
          </div>
          <button onClick={() => onNavigate('products')} style={{ position: 'relative', marginTop: 12, fontSize: 12, fontWeight: 600, color: 'var(--warn-700)', display: 'flex', alignItems: 'center', gap: 4 }}>
            Voir les produits <Icon name="arrowRight" size={12}/>
          </button>
        </Card>

        <Card padding="none" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'var(--danger-100)', opacity: 0.6 }}/>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Ruptures</div>
              <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--danger-700)' }}>{kpis.ruptures}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--danger-100)', color: 'var(--danger-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="alert" size={20}/>
            </div>
          </div>
          <button onClick={() => onNavigate('products')} style={{ position: 'relative', marginTop: 12, fontSize: 12, fontWeight: 600, color: 'var(--danger-700)', display: 'flex', alignItems: 'center', gap: 4 }}>
            Action requise <Icon name="arrowRight" size={12}/>
          </button>
        </Card>
      </div>

      {/* Main grid */}
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Flux du stock &mdash; 30 derniers jours</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--ink-500)' }}>Comparaison entrées vs sorties (en unités)</p>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-700)', fontWeight: 500 }}>
                <span style={{ width: 10, height: 3, background: 'var(--navy-700)', borderRadius: 2 }}/> Entrées
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-700)', fontWeight: 500 }}>
                <span style={{ width: 10, height: 3, background: 'var(--orange-500)', borderRadius: 2 }}/> Sorties
              </span>
            </div>
          </div>
          <FlowChart data={flow} height={240}/>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--ink-150)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total entrées</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy-800)', marginTop: 2 }}>{num(flow.reduce((s,d)=>s+d.entrees,0))}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total sorties</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--orange-700)', marginTop: 2 }}>{num(flow.reduce((s,d)=>s+d.sorties,0))}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Solde net</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success-700)', marginTop: 2 }}>+{num(flow.reduce((s,d)=>s+d.entrees-d.sorties,0))}</div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Répartition par catégorie</h3>
          <p style={{ margin: '4px 0 16px', fontSize: 12.5, color: 'var(--ink-500)' }}>Quantités en stock</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <DonutChart data={catData} size={180}/>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {catData.map(c => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color }}/>
                <span style={{ flex: 1, color: 'var(--ink-700)', fontWeight: 500 }}>{c.label}</span>
                <span style={{ fontWeight: 700, color: 'var(--ink-900)', fontFamily: 'var(--font-mono)' }}>{num(c.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Alerts row */}
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--danger-100)', color: 'var(--danger-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="alert" size={16}/>
              </span>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Ruptures à traiter</h3>
            </div>
            <button onClick={() => onNavigate('products')} style={{ fontSize: 12, color: 'var(--navy-700)', fontWeight: 600 }}>Tout voir &rarr;</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ruptures.map(p => (
              <div key={p.sku} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 10, borderRadius: 'var(--r-md)',
                background: 'var(--danger-100)', border: '1px solid #FAC4CB',
              }}>
                <ProductImage product={{ ...p, cat: p.category?.slug }} size={40}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{p.sku} &middot; {p.warehouse?.label}</div>
                </div>
                <Button size="sm" variant="primary" icon="plus" onClick={() => onNavigate('movements')}>Réassort</Button>
              </div>
            ))}
            {ruptures.length === 0 && <Placeholder title="Aucune rupture" subtitle="Tout est bien approvisionné."/>}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--warn-100)', color: 'var(--warn-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="alert" size={16}/>
              </span>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Stock faible</h3>
            </div>
            <button onClick={() => onNavigate('products')} style={{ fontSize: 12, color: 'var(--navy-700)', fontWeight: 600 }}>Tout voir &rarr;</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lowStock.map(p => {
              const ratio = (p.qty / p.threshold) * 100;
              return (
                <div key={p.sku} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 10, borderRadius: 'var(--r-md)',
                  background: 'var(--ink-50)', border: '1px solid var(--ink-150)',
                }}>
                  <ProductImage product={{ ...p, cat: p.category?.slug }} size={40}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--warn-700)', fontFamily: 'var(--font-mono)' }}>{p.qty}/{p.threshold}</div>
                    </div>
                    <div style={{ marginTop: 6, height: 4, background: 'var(--ink-200)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, ratio)}%`, height: '100%', background: 'var(--warn-500)', borderRadius: 2 }}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Produits les plus mouvementés</h3>
            <Badge tone="navy">30 derniers jours</Badge>
          </div>
          <TopMoversBars data={topMovers}/>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Activité en direct</h3>
            <button onClick={() => onNavigate('history')} style={{ fontSize: 12, color: 'var(--navy-700)', fontWeight: 600 }}>Historique complet &rarr;</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recent.map((m, idx) => {
              const isIn = m.type === 'in';
              return (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0',
                  borderBottom: idx === recent.length - 1 ? 'none' : '1px solid var(--ink-150)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: isIn ? 'var(--success-100)' : 'var(--orange-100)',
                    color: isIn ? 'var(--success-700)' : 'var(--orange-700)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon name={isIn ? 'arrowDown' : 'arrowUp'} size={15} strokeWidth={2.5}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong>{m.user?.name}</strong> a {isIn ? 'reçu' : 'sorti'} <strong>{m.qty} {m.product?.name?.split('—')[0]?.trim()}</strong>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                      {m.warehouse?.label} &middot; {timeAgo(m.date)} &middot; {m.ref}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
