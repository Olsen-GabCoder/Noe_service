import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Card, Badge, KPITile } from '../components/Primitives';
import { FlowChart, TopMoversBars } from '../components/Charts';
import { computeKPIs, num } from '../data';
import { fetchProducts, fetchCategories, fetchWarehouses, fetchFlow, fetchTopMovers } from '../api';

export function ReportsScreen() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [flow, setFlow] = useState([]);
  const [topMovers, setTopMovers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories(), fetchWarehouses(), fetchFlow(), fetchTopMovers()])
      .then(([prods, cats, whs, fl, tm]) => { setProducts(prods); setCategories(cats); setWarehouses(whs); setFlow(fl); setTopMovers(tm); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, fontSize: 14, color: 'var(--ink-500)' }}>Chargement...</div>;

  const kpis = computeKPIs(products);
  const totalValueM = (kpis.totalValue / 1_000_000).toFixed(2);
  const ruptureRate = ((kpis.ruptures / kpis.total) * 100).toFixed(1);
  const totalMovements = flow.reduce((s, d) => s + d.entrees + d.sorties, 0);

  const whStocks = warehouses.map(wh => {
    const items = products.filter(p => p.warehouse?.code === wh.code || p.warehouseId === wh.id);
    const qty   = items.reduce((s, p) => s + p.qty, 0);
    const value = items.reduce((s, p) => s + p.qty * p.price, 0);
    return { ...wh, qty, value, count: items.length };
  });
  const maxWhQty = Math.max(...whStocks.map(w => w.qty)) || 1;

  const catData = categories.map(c => {
    const items = products.filter(p => p.category?.slug === c.slug || p.categoryId === c.id);
    const qty   = items.reduce((s, p) => s + p.qty, 0);
    const value = items.reduce((s, p) => s + p.qty * p.price, 0);
    return { ...c, qty, value };
  }).filter(c => c.qty > 0);

  return (
    <div className="anim-fade screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink-900)' }}>Rapports & Analyses</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--ink-500)' }}>Statistiques sur les 30 derniers jours</p>
        </div>
      </div>

      <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KPITile label="Valeur totale" value={<>{totalValueM}<span style={{ fontSize: 14, color: 'var(--ink-500)', marginLeft: 4, fontWeight: 600 }}>M FCFA</span></>} sublabel={`${num(kpis.totalQty)} unités en stock`} icon="chart" accent="var(--navy-700)" trend={+8} />
        <KPITile label="Rotation moyenne" value="3.2x" sublabel="Taux mensuel tous produits" icon="refresh" accent="var(--success-500)" trend={+5} />
        <KPITile label="Taux rupture" value={`${ruptureRate} %`} sublabel={`${kpis.ruptures} produit${kpis.ruptures !== 1 ? 's' : ''} en rupture`} icon="alert" accent="var(--danger-500)" trend={-2} />
        <KPITile label="Mouvements 30j" value={num(totalMovements)} sublabel={`${num(flow.reduce((s,d)=>s+d.entrees,0))} entrées · ${num(flow.reduce((s,d)=>s+d.sorties,0))} sorties`} icon="arrowsLeftRight" accent="var(--orange-500)" trend={+12} />
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Flux du stock — 30 derniers jours</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--ink-500)' }}>Comparaison entrées vs sorties (unités)</p>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-700)', fontWeight: 500 }}><span style={{ width: 10, height: 3, background: 'var(--navy-700)', borderRadius: 2 }}/> Entrées</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-700)', fontWeight: 500 }}><span style={{ width: 10, height: 3, background: 'var(--orange-500)', borderRadius: 2 }}/> Sorties</span>
          </div>
        </div>
        <FlowChart data={flow} height={240}/>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--ink-150)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total entrées</div><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy-800)', marginTop: 2 }}>{num(flow.reduce((s,d)=>s+d.entrees,0))}</div></div>
          <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total sorties</div><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--orange-700)', marginTop: 2 }}>{num(flow.reduce((s,d)=>s+d.sorties,0))}</div></div>
          <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Solde net</div><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success-700)', marginTop: 2 }}>+{num(flow.reduce((s,d)=>s+d.entrees-d.sorties,0))}</div></div>
        </div>
      </Card>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 16 }}>
        <Card>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Stock par dépôt</h3>
          <p style={{ margin: '0 0 18px', fontSize: 12.5, color: 'var(--ink-500)' }}>Quantités totales en stock</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {whStocks.map(wh => {
              const pct = Math.round((wh.qty / maxWhQty) * 100);
              return (
                <div key={wh.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--navy-700)', background: 'var(--navy-50)', border: '1px solid var(--navy-100)', borderRadius: 4, padding: '2px 6px', fontFamily: 'var(--font-mono)' }}>{wh.code}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-800)' }}>{wh.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ink-900)' }}>{num(wh.qty)}</span>
                      <span style={{ fontSize: 11.5, color: 'var(--ink-400)' }}>{wh.count} réf.</span>
                    </div>
                  </div>
                  <div style={{ height: 8, background: 'var(--ink-100)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, var(--navy-600), var(--navy-700))' }}/>
                  </div>
                  <div style={{ marginTop: 5, fontSize: 11.5, color: 'var(--ink-500)' }}>Valeur : <strong style={{ color: 'var(--ink-700)' }}>{(wh.value / 1_000_000).toFixed(2)} M FCFA</strong></div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--ink-150)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Par catégorie</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {catData.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 3, background: c.color, flexShrink: 0 }}/>
                  <span style={{ flex: 1, color: 'var(--ink-700)', fontWeight: 500 }}>{c.label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--ink-900)', fontFamily: 'var(--font-mono)' }}>{num(c.qty)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Produits les plus mouvementés</h3>
            <Badge tone="navy">30 derniers jours</Badge>
          </div>
          <p style={{ margin: '0 0 18px', fontSize: 12.5, color: 'var(--ink-500)' }}>Classement par volume de sorties</p>
          <TopMoversBars data={topMovers}/>
        </Card>
      </div>
    </div>
  );
}
