import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Button, Card, Badge, Input, ProductImage, useToast } from '../components/Primitives';
import { timeAgo } from '../data';
import { fetchProducts, fetchWarehouses, fetchMovements as fetchMovementsApi, createMovement } from '../api';

export function MovementsScreen({ onNavigate }) {
  const [type, setType] = useState('in');
  const [sku, setSku] = useState('');
  const [qty, setQty] = useState(1);
  const [warehouse, setWarehouse] = useState('');
  const [note, setNote] = useState('');
  const [ref, setRef] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchWarehouses(), fetchMovementsApi({ limit: '4' })])
      .then(([prods, whs, movData]) => {
        setProducts(prods);
        setWarehouses(whs);
        setRecentMovements(movData.movements || []);
        if (whs.length) setWarehouse(whs[0].code);
      }).catch(console.error);
  }, []);

  const product = sku ? products.find(p => p.sku === sku) : null;
  const filteredProducts = search.length >= 1
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
    : [];

  const currentStock = product ? product.qty : 0;
  const newStock = type === 'in' ? currentStock + qty : Math.max(0, currentStock - qty);

  function handleSelectProduct(p) { setSku(p.sku); setSearch(''); setShowSearch(false); }
  function handleClear() { setSku(''); setSearch(''); setShowSearch(false); }

  async function handleSubmit() {
    if (!product) { toast({ tone: 'danger', message: 'Veuillez selectionner un produit.' }); return; }
    if (!ref) { toast({ tone: 'danger', message: 'Veuillez saisir une reference.' }); return; }
    setSubmitting(true);
    try {
      await createMovement({ ref, type, qty, note, productSku: sku, warehouseCode: warehouse });
      const label = type === 'in' ? 'Entree enregistree' : 'Sortie enregistree';
      toast({ tone: 'success', message: `${label} — ${qty} ${product.unit}(s) de ${product.name}.` });
      // Refresh
      const [prods, movData] = await Promise.all([fetchProducts(), fetchMovementsApi({ limit: '4' })]);
      setProducts(prods);
      setRecentMovements(movData.movements || []);
      setSku(''); setQty(1); setNote(''); setRef(''); setShowSearch(false); setSearch('');
    } catch (err) { toast({ tone: 'danger', message: err.message }); }
    finally { setSubmitting(false); }
  }

  function handleReset() { setSku(''); setQty(1); setNote(''); setRef(''); setSearch(''); setShowSearch(false); }

  return (
    <div className="anim-fade screen-content" style={{  maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Inventaire</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink-900)' }}>Mouvements de stock</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--ink-500)' }}>Enregistrez une entree ou une sortie de marchandise.</p>
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card padding="none" style={{ padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {/* Type toggle */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Type de mouvement</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'var(--ink-100)', borderRadius: 'var(--r-md)', padding: 4 }}>
                  <button onClick={() => setType('in')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: type === 'in' ? 'white' : 'transparent', border: type === 'in' ? '1px solid var(--success-200)' : '1px solid transparent', borderRadius: 'var(--r-sm)', cursor: 'pointer', boxShadow: type === 'in' ? 'var(--shadow-xs)' : 'none', textAlign: 'left' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, background: type === 'in' ? 'var(--success-100)' : 'var(--ink-200)', color: type === 'in' ? 'var(--success-700)' : 'var(--ink-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowDown" size={18} strokeWidth={2.2}/></div>
                    <div><div style={{ fontSize: 13.5, fontWeight: 700, color: type === 'in' ? 'var(--success-800)' : 'var(--ink-700)' }}>Entree de stock</div><div style={{ fontSize: 11.5, color: type === 'in' ? 'var(--success-600)' : 'var(--ink-400)', marginTop: 2 }}>Reception, retour</div></div>
                  </button>
                  <button onClick={() => setType('out')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: type === 'out' ? 'white' : 'transparent', border: type === 'out' ? '1px solid var(--orange-200)' : '1px solid transparent', borderRadius: 'var(--r-sm)', cursor: 'pointer', boxShadow: type === 'out' ? 'var(--shadow-xs)' : 'none', textAlign: 'left' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, background: type === 'out' ? 'var(--orange-100)' : 'var(--ink-200)', color: type === 'out' ? 'var(--orange-600)' : 'var(--ink-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowUp" size={18} strokeWidth={2.2}/></div>
                    <div><div style={{ fontSize: 13.5, fontWeight: 700, color: type === 'out' ? 'var(--orange-700)' : 'var(--ink-700)' }}>Sortie de stock</div><div style={{ fontSize: 11.5, color: type === 'out' ? 'var(--orange-500)' : 'var(--ink-400)', marginTop: 2 }}>Vente, transfert</div></div>
                  </button>
                </div>
              </div>

              {/* Product picker */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Produit</div>
                {product ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--navy-900)', borderRadius: 'var(--r-md)', padding: '14px 16px', position: 'relative' }}>
                    <ProductImage product={{ ...product, cat: product.category?.slug }} size={44}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                      <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--navy-300)', fontWeight: 600 }}>{product.sku}</span>
                        <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--navy-500)' }}/>
                        <span style={{ fontSize: 12, color: 'var(--navy-300)' }}>{currentStock} {product.unit}(s) en stock</span>
                      </div>
                    </div>
                    <button onClick={handleClear} style={{ width: 28, height: 28, borderRadius: 999, background: 'rgba(255,255,255,0.12)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                      <Icon name="x" size={14} strokeWidth={2.5}/>
                    </button>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <Input placeholder="Rechercher un produit par nom ou SKU…" value={search} onChange={(v) => { setSearch(v); setShowSearch(true); }} icon="search" full />
                    {showSearch && filteredProducts.length > 0 && (
                      <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50, background: 'white', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-md)', padding: 4, maxHeight: 280, overflowY: 'auto' }}>
                        {filteredProducts.map(p => (
                          <button key={p.sku} onClick={() => handleSelectProduct(p)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <ProductImage product={{ ...p, cat: p.category?.slug }} size={36}/>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                              <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{p.sku}</div>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: p.qty === 0 ? 'var(--danger-600)' : p.qty <= p.threshold ? 'var(--warn-600)' : 'var(--success-700)', flexShrink: 0 }}>{p.qty} {p.unit}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Quantite</div>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', height: 50, overflow: 'hidden' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 50, height: 50, border: 'none', borderRight: '1px solid var(--ink-200)', background: 'var(--ink-50)', color: 'var(--ink-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="minus" size={18} strokeWidth={2.2}/></button>
                  <input type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', textAlign: 'center', fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-900)' }} />
                  <button onClick={() => setQty(q => q + 1)} style={{ width: 50, height: 50, border: 'none', borderLeft: '1px solid var(--ink-200)', background: 'var(--ink-50)', color: 'var(--ink-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="plus" size={18} strokeWidth={2.2}/></button>
                </div>
              </div>

              {/* Warehouse */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Entrepot</div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${warehouses.length}, 1fr)`, gap: 6, background: 'var(--ink-100)', borderRadius: 'var(--r-md)', padding: 4 }}>
                  {warehouses.map(wh => (
                    <button key={wh.code} onClick={() => setWarehouse(wh.code)} style={{ padding: '9px 12px', background: warehouse === wh.code ? 'white' : 'transparent', border: warehouse === wh.code ? '1px solid var(--ink-200)' : '1px solid transparent', borderRadius: 'var(--r-sm)', cursor: 'pointer', boxShadow: warehouse === wh.code ? 'var(--shadow-xs)' : 'none', fontSize: 13, fontWeight: 700, color: warehouse === wh.code ? 'var(--navy-800)' : 'var(--ink-500)' }}>{wh.code}</button>
                  ))}
                </div>
              </div>

              {/* Reference */}
              <Input label="Reference" placeholder="BL-0000, V-0000…" value={ref} onChange={setRef} icon="tag" full />

              {/* Note */}
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)' }}>Note</span>
                  <textarea placeholder="Informations complementaires…" value={note} onChange={e => setNote(e.target.value)} rows={3} style={{ resize: 'vertical', width: '100%', boxSizing: 'border-box', border: '1px solid var(--ink-200)', borderRadius: 'var(--r-md)', padding: '10px 12px', fontSize: 14, color: 'var(--ink-900)', background: 'white', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5 }} />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                <Button variant="secondary" onClick={handleReset}>Annuler</Button>
                <Button variant={type === 'in' ? 'primary' : 'accent'} icon={type === 'in' ? 'arrowDown' : 'arrowUp'} onClick={handleSubmit}>
                  {submitting ? 'Envoi...' : 'Valider'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {product && (
            <Card padding="none" style={{ padding: 20 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Apercu apres validation</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, background: 'var(--ink-50)', borderRadius: 'var(--r-md)', padding: '14px 16px', textAlign: 'center', border: '1px solid var(--ink-200)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Stock actuel</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink-800)', letterSpacing: '-0.02em', lineHeight: 1 }}>{currentStock}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-400)', marginTop: 4 }}>{product.unit}(s)</div>
                </div>
                <div style={{ flexShrink: 0, color: type === 'in' ? 'var(--success-600)' : 'var(--orange-500)' }}><Icon name="arrowRight" size={22} strokeWidth={2}/></div>
                <div style={{ flex: 1, background: type === 'in' ? 'var(--success-100)' : 'var(--orange-100)', border: `1px solid ${type === 'in' ? 'var(--success-200)' : 'var(--orange-200)'}`, borderRadius: 'var(--r-md)', padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: type === 'in' ? 'var(--success-600)' : 'var(--orange-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Nouveau stock</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: type === 'in' ? 'var(--success-800)' : 'var(--orange-700)', letterSpacing: '-0.02em', lineHeight: 1 }}>{newStock}</div>
                  <div style={{ fontSize: 11.5, color: type === 'in' ? 'var(--success-600)' : 'var(--orange-600)', marginTop: 4 }}>{product.unit}(s)</div>
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
                <Badge tone={type === 'in' ? 'success' : 'orange'} size="sm" icon={type === 'in' ? 'arrowDown' : 'arrowUp'}>{type === 'in' ? '+' : '-'}{qty} {product.unit}(s)</Badge>
              </div>
              {type === 'out' && newStock === 0 && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--danger-100)', border: '1px solid var(--danger-200)', borderRadius: 'var(--r-sm)' }}>
                  <Icon name="alert" size={15} color="var(--danger-600)"/><span style={{ fontSize: 12.5, color: 'var(--danger-700)', fontWeight: 600 }}>Cette sortie entrainera une rupture de stock.</span>
                </div>
              )}
            </Card>
          )}

          <Card padding="none" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Derniers mouvements</div>
              <button onClick={() => onNavigate && onNavigate('history')} style={{ fontSize: 12, color: 'var(--navy-600)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Voir tout</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentMovements.map(mv => (
                <div key={mv.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 'var(--r-sm)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 28, height: 28, borderRadius: 999, flexShrink: 0, background: mv.type === 'in' ? 'var(--success-100)' : 'var(--orange-100)', color: mv.type === 'in' ? 'var(--success-700)' : 'var(--orange-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={mv.type === 'in' ? 'arrowDown' : 'arrowUp'} size={13} strokeWidth={2.5}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mv.product?.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-400)', marginTop: 1 }}>{timeAgo(mv.date)} · {mv.user?.name}</div>
                  </div>
                  <Badge tone={mv.type === 'in' ? 'success' : 'orange'} size="xs">{mv.type === 'in' ? '+' : '-'}{mv.qty}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
