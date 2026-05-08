import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../components/Icon';
import { Button, Card, Badge, Input, FilterChip, ProductImage, StockPill, useToast } from '../components/Primitives';
import { stockStatus, fcfa, num } from '../data';
import { fetchProducts, fetchCategories, fetchWarehouses } from '../api';
import { exportProductsCSV } from '../utils/csv';

function ProductTable({ products, onOpenProduct }) {
  const [hovered, setHovered] = useState(null);

  const cols = [
    { label: 'Produit',       width: '260px' },
    { label: 'SKU',           width: '110px' },
    { label: 'Catégorie',     width: '130px' },
    { label: 'Dépôt',         width: '90px'  },
    { label: 'Stock',         width: '80px'  },
    { label: 'Seuil',         width: '70px'  },
    { label: 'Prix unitaire', width: '130px' },
    { label: 'Valeur',        width: '140px' },
    { label: 'Statut',        width: '120px' },
    { label: '',              width: '40px'  },
  ];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--ink-200)' }}>
            {cols.map((col, i) => (
              <th key={i} style={{
                width: col.width, padding: '10px 14px', textAlign: 'left',
                fontSize: 11.5, fontWeight: 700, color: 'var(--ink-500)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                whiteSpace: 'nowrap', background: 'var(--ink-50)',
              }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const cat = p.category || {};
            const wh = p.warehouse || {};
            const status = stockStatus(p);
            const stockColor = status === 'rupture' ? 'var(--danger-700)' : status === 'low' ? 'var(--warn-700)' : 'var(--ink-900)';
            const isHov = hovered === p.sku;
            return (
              <tr key={p.sku}
                onMouseEnter={() => setHovered(p.sku)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onOpenProduct && onOpenProduct(p)}
                style={{
                  borderBottom: '1px solid var(--ink-100)',
                  background: isHov ? 'var(--navy-50)' : 'white',
                  cursor: 'pointer', transition: 'background 0.12s ease',
                }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ProductImage product={{ ...p, cat: cat.slug }} size={40} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 190 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{p.unit}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--ink-600)', background: 'var(--ink-100)', padding: '2px 6px', borderRadius: 4 }}>{p.sku}</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <Badge tone="neutral" size="sm"><span style={{ color: cat.color, marginRight: 4 }}>●</span>{cat.label}</Badge>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--navy-700)', background: 'var(--navy-50)', border: '1px solid var(--navy-100)', borderRadius: 4, padding: '2px 6px' }}>{wh.code}</span>
                </td>
                <td style={{ padding: '12px 14px' }}><span style={{ fontWeight: 700, fontSize: 14, color: stockColor }}>{num(p.qty)}</span></td>
                <td style={{ padding: '12px 14px', color: 'var(--ink-500)', fontSize: 13 }}>{p.threshold}</td>
                <td style={{ padding: '12px 14px', color: 'var(--ink-700)', fontWeight: 500, whiteSpace: 'nowrap' }}>{fcfa(p.price)}</td>
                <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--ink-900)', whiteSpace: 'nowrap' }}>{fcfa(p.qty * p.price)}</td>
                <td style={{ padding: '12px 14px' }}><StockPill product={p} size="sm" /></td>
                <td style={{ padding: '12px 14px', textAlign: 'center' }}><Icon name="chevronRight" size={16} color="var(--ink-400)" /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProductGrid({ products, onOpenProduct }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, padding: '4px 0' }}>
      {products.map((p) => {
        const status = stockStatus(p);
        const stockColor = status === 'rupture' ? 'var(--danger-700)' : status === 'low' ? 'var(--warn-700)' : 'var(--success-700)';
        return (
          <Card key={p.sku} padding="none" hover onClick={() => onOpenProduct && onOpenProduct(p)} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <ProductImage product={{ ...p, cat: p.category?.slug }} size={52} />
              <StockPill product={p} size="xs" />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-500)', letterSpacing: '0.03em' }}>{p.sku}</div>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink-900)', lineHeight: 1.35, minHeight: 36 }}>{p.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: stockColor, letterSpacing: '-0.02em' }}>{num(p.qty)}</span>
              <span style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 500 }}>{p.unit}</span>
            </div>
            <div style={{ paddingTop: 10, borderTop: '1px solid var(--ink-100)', fontSize: 12.5, color: 'var(--ink-600)', fontWeight: 500 }}>
              Valeur&nbsp;<span style={{ color: 'var(--ink-900)', fontWeight: 700 }}>{fcfa(p.qty * p.price)}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export function ProductsScreen({ onOpenProduct, onNew, onNavigate }) {
  const toast = useToast();
  const [view,   setView]   = useState('table');
  const [search, setSearch] = useState('');
  const [cat,    setCat]    = useState('all');
  const [wh,     setWh]     = useState('all');
  const [status, setStatus] = useState('all');
  const [sort,   setSort]   = useState('qty-asc');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories(), fetchWarehouses()])
      .then(([prods, cats, whs]) => { setProducts(prods); setCategories(cats); setWarehouses(whs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let r = products.filter(p => {
      if (search && !(p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))) return false;
      if (cat !== 'all' && p.category?.slug !== cat) return false;
      if (wh  !== 'all' && p.warehouse?.code !== wh) return false;
      if (status !== 'all' && stockStatus(p) !== status) return false;
      return true;
    });
    if (sort === 'qty-asc')  r.sort((a, b) => a.qty - b.qty);
    if (sort === 'qty-desc') r.sort((a, b) => b.qty - a.qty);
    if (sort === 'name')     r.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'value')    r.sort((a, b) => b.qty * b.price - a.qty * a.price);
    return r;
  }, [products, search, cat, wh, status, sort]);

  const totalValue = filtered.reduce((s, p) => s + p.qty * p.price, 0);

  const catOptions = [{ value: 'all', label: 'Toutes' }, ...categories.map(c => ({ value: c.slug, label: c.label }))];
  const whOptions = [{ value: 'all', label: 'Tous' }, ...warehouses.map(w => ({ value: w.code, label: w.label }))];
  const statusOptions = [{ value: 'all', label: 'Tous' }, { value: 'ok', label: 'En stock' }, { value: 'low', label: 'Stock faible' }, { value: 'rupture', label: 'Rupture' }];
  const sortOptions = [{ value: 'qty-asc', label: 'Stock ↑' }, { value: 'qty-desc', label: 'Stock ↓' }, { value: 'name', label: 'Nom A→Z' }, { value: 'value', label: 'Valeur ↓' }];

  const activeFilters = [];
  if (cat !== 'all') activeFilters.push({ key: 'cat', label: categories.find(c => c.slug === cat)?.label, clear: () => setCat('all') });
  if (wh  !== 'all') activeFilters.push({ key: 'wh', label: warehouses.find(w => w.code === wh)?.label, clear: () => setWh('all') });
  if (status !== 'all') activeFilters.push({ key: 'status', label: statusOptions.find(o => o.value === status)?.label, clear: () => setStatus('all') });
  if (search) activeFilters.push({ key: 'search', label: `« ${search} »`, clear: () => setSearch('') });

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <div style={{ fontSize: 14, color: 'var(--ink-500)' }}>Chargement des produits...</div>
    </div>;
  }

  return (
    <div className="anim-fade screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink-900)' }}>Catalogue produits</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--ink-500)' }}>
            {filtered.length} produit{filtered.length !== 1 ? 's' : ''}
            {filtered.length !== products.length ? ` sur ${products.length}` : ''}
            &nbsp;&middot;&nbsp;Valeur totale&nbsp;<strong style={{ color: 'var(--ink-800)' }}>{fcfa(totalValue)}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" icon="upload" size="md" onClick={() => toast({ tone: 'neutral', message: 'Import CSV sera disponible dans une prochaine version.' })}>Importer</Button>
          <Button variant="secondary" icon="download" size="md" onClick={() => exportProductsCSV(filtered)}>Exporter</Button>
          <Button variant="accent" icon="plus" size="md" onClick={onNew}>Nouveau produit</Button>
        </div>
      </div>

      <Card padding="none" style={{ padding: '14px 16px', position: 'relative', zIndex: 10, overflow: 'visible' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 220px', minWidth: 180, maxWidth: 320 }}>
            <Input value={search} onChange={setSearch} placeholder="Rechercher nom, SKU…" icon="search" size="sm" full />
          </div>
          <div style={{ width: 1, height: 28, background: 'var(--ink-200)', flexShrink: 0, margin: '0 2px' }} />
          <FilterChip label="Catégorie : " value={cat} options={catOptions} onChange={setCat} icon="tag" />
          <FilterChip label="Dépôt : " value={wh} options={whOptions} onChange={setWh} icon="warehouse" />
          <FilterChip label="Statut : " value={status} options={statusOptions} onChange={setStatus} icon="alert" />
          <FilterChip label="Trier : " value={sort} options={sortOptions} onChange={setSort} icon="sort" />
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 4, background: 'var(--ink-100)', borderRadius: 'var(--r-md)', padding: 3, flexShrink: 0 }}>
            <button onClick={() => setView('table')} title="Vue liste" style={{ display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 10px', borderRadius: 'calc(var(--r-md) - 2px)', fontSize: 12.5, fontWeight: 600, background: view === 'table' ? 'white' : 'transparent', color: view === 'table' ? 'var(--ink-900)' : 'var(--ink-500)', boxShadow: view === 'table' ? 'var(--shadow-xs)' : 'none', transition: 'all 0.15s', border: 'none', cursor: 'pointer' }}>
              <Icon name="list" size={15} />Liste
            </button>
            <button onClick={() => setView('grid')} title="Vue cartes" style={{ display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 10px', borderRadius: 'calc(var(--r-md) - 2px)', fontSize: 12.5, fontWeight: 600, background: view === 'grid' ? 'white' : 'transparent', color: view === 'grid' ? 'var(--ink-900)' : 'var(--ink-500)', boxShadow: view === 'grid' ? 'var(--shadow-xs)' : 'none', transition: 'all 0.15s', border: 'none', cursor: 'pointer' }}>
              <Icon name="grid" size={15} />Cartes
            </button>
          </div>
        </div>
      </Card>

      {activeFilters.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, color: 'var(--ink-500)', fontWeight: 500 }}>Filtres actifs :</span>
          {activeFilters.map(f => (
            <button key={f.key} onClick={f.clear} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 26, padding: '0 10px', background: 'var(--navy-50)', color: 'var(--navy-800)', border: '1px solid var(--navy-200)', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {f.label}<Icon name="x" size={12} strokeWidth={2.5} />
            </button>
          ))}
          <button onClick={() => { setCat('all'); setWh('all'); setStatus('all'); setSearch(''); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 26, padding: '0 10px', background: 'transparent', color: 'var(--ink-500)', border: '1px solid var(--ink-200)', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Réinitialiser tout
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <Card padding="none" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-400)' }}>
              <Icon name="search" size={26} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-800)' }}>Aucun produit trouvé</div>
            <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Modifiez vos critères de recherche ou de filtrage.</div>
          </div>
        </Card>
      ) : view === 'table' ? (
        <Card padding="none"><ProductTable products={filtered} onOpenProduct={onOpenProduct} /></Card>
      ) : (
        <ProductGrid products={filtered} onOpenProduct={onOpenProduct} />
      )}
    </div>
  );
}
