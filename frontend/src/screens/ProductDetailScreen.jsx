import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Button, Card, Badge, Input, ProductImage, StockPill, useToast } from '../components/Primitives';
import { formatDateTime } from '../data';
import { fetchProduct, fetchCategories, fetchWarehouses, createProduct, updateProduct, deleteProduct } from '../api';

export function ProductDetailScreen({ sku, onBack, onNavigate }) {
  const isNew = !sku;
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [movements, setMovements] = useState([]);

  const [form, setForm] = useState({
    sku: 'NOE-' + Math.floor(Math.random() * 9000 + 1000),
    name: '', categoryId: '', price: 0, qty: 0, threshold: 10, unit: 'unite', warehouseId: '',
  });

  useEffect(() => {
    Promise.all([fetchCategories(), fetchWarehouses()]).then(([cats, whs]) => {
      setCategories(cats);
      setWarehouses(whs);
      if (isNew && cats.length && whs.length) {
        setForm(f => ({ ...f, categoryId: cats[0].id, warehouseId: whs[0].id }));
      }
    });
  }, []);

  useEffect(() => {
    if (!sku) return;
    setLoading(true);
    fetchProduct(sku).then(p => {
      setForm({ sku: p.sku, name: p.name, categoryId: p.categoryId, price: p.price, qty: p.qty, threshold: p.threshold, unit: p.unit, warehouseId: p.warehouseId });
      setMovements(p.movements || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [sku]);

  function set(field, value) { setForm(f => ({ ...f, [field]: value })); }

  const cat = categories.find(c => c.id === form.categoryId);

  async function handleSave() {
    setSaving(true);
    try {
      if (isNew) {
        await createProduct(form);
        toast({ tone: 'success', message: 'Produit cree avec succes.' });
      } else {
        await updateProduct(sku, form);
        toast({ tone: 'success', message: 'Produit mis a jour.' });
      }
      onBack();
    } catch (err) {
      toast({ tone: 'danger', message: err.message });
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await deleteProduct(sku);
      toast({ tone: 'success', message: 'Produit supprime.' });
      onBack();
    } catch (err) { toast({ tone: 'danger', message: err.message }); }
  }

  const stockGaugePercent = form.threshold > 0 ? Math.min(100, Math.round((form.qty / (form.threshold * 3)) * 100)) : form.qty > 0 ? 100 : 0;
  const gaugeColor = form.qty === 0 ? 'var(--danger-500)' : form.qty <= form.threshold ? 'var(--warn-500)' : 'var(--success-500)';

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, fontSize: 14, color: 'var(--ink-500)' }}>Chargement...</div>;

  return (
    <div className="screen-content">
      <div className="grid-detail" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-500)' }}>
            <button onClick={() => onNavigate ? onNavigate('products') : onBack?.()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-500)', fontSize: 13, fontWeight: 500, padding: 0 }}>Produits</button>
            <Icon name="chevronRight" size={14} color="var(--ink-400)" />
            <span style={{ color: 'var(--ink-800)', fontWeight: 600 }}>{isNew ? 'Nouveau produit' : form.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'white', border: '1px solid var(--ink-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <Icon name="chevronLeft" size={18} color="var(--ink-700)" />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink-900)', margin: 0 }}>{isNew ? 'Nouveau produit' : form.name}</h1>
              {!isNew && <div style={{ marginTop: 3, fontSize: 13, color: 'var(--ink-500)', fontWeight: 500 }}>{form.sku}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {!isNew && <Button variant="danger" size="sm" icon="trash" onClick={handleDelete}>Supprimer</Button>}
              <Button variant="secondary" size="sm" onClick={onBack}>Annuler</Button>
              <Button variant="accent" size="sm" icon={isNew ? 'plus' : 'check'} onClick={handleSave}>{saving ? 'Enregistrement...' : isNew ? 'Créer' : 'Enregistrer'}</Button>
            </div>
          </div>

          <Card padding="md">
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)' }}>Informations générales</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 2 }}>Nom, références et classification</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input label="Nom du produit" value={form.name} onChange={v => set('name', v)} placeholder="Ex. Riz parfumé import — sac 25kg" full />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="SKU" value={form.sku} onChange={v => set('sku', v)} placeholder="NOE-XXXX" icon="barcode" full />
                <Input label="Unité" value={form.unit} onChange={v => set('unit', v)} placeholder="unité, sac, carton…" full />
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 8 }}>Catégorie</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {categories.map(c => {
                    const selected = form.categoryId === c.id;
                    return (
                      <button key={c.id} onClick={() => set('categoryId', c.id)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 999,
                        border: selected ? `2px solid ${c.color}` : '1.5px solid var(--ink-200)',
                        background: selected ? `${c.color}15` : 'white', color: selected ? c.color : 'var(--ink-700)',
                        fontSize: 13, fontWeight: selected ? 700 : 500, cursor: 'pointer',
                      }}>
                        <Icon name={c.icon} size={14} color={selected ? c.color : 'var(--ink-500)'} />{c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)' }}>Stock &amp; prix</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 2 }}>Quantités, seuil, tarification et dépôt</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="Quantité en stock" type="number" value={String(form.qty)} onChange={v => set('qty', Number(v))} placeholder="0" icon="box" full />
                <Input label="Seuil d'alerte" type="number" value={String(form.threshold)} onChange={v => set('threshold', Number(v))} placeholder="10" icon="alert" full />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="Prix unitaire" type="number" value={String(form.price)} onChange={v => set('price', Number(v))} placeholder="0" suffix="FCFA" full />
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-700)', marginBottom: 8 }}>Dépôt</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {warehouses.map(w => {
                    const selected = form.warehouseId === w.id;
                    return (
                      <button key={w.id} onClick={() => set('warehouseId', w.id)} style={{
                        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '10px 8px',
                        border: selected ? '2px solid var(--navy-600)' : '1.5px solid var(--ink-200)', borderRadius: 'var(--r-md)',
                        background: selected ? 'var(--navy-50)' : 'white', cursor: 'pointer',
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: selected ? 'var(--navy-700)' : 'var(--ink-500)', textTransform: 'uppercase' }}>{w.code}</span>
                        <span style={{ fontSize: 11.5, fontWeight: selected ? 600 : 500, color: selected ? 'var(--navy-800)' : 'var(--ink-700)', textAlign: 'center' }}>{w.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {!isNew && movements.length > 0 && (
            <Card padding="md">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)' }}>Historique récent</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 2 }}>Derniers mouvements pour ce produit</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {movements.map((m, i) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < movements.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 'var(--r-md)', flexShrink: 0, background: m.type === 'in' ? 'var(--success-100)' : 'var(--danger-100)', color: m.type === 'in' ? 'var(--success-700)' : 'var(--danger-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={m.type === 'in' ? 'arrowDown' : 'arrowUp'} size={16} strokeWidth={2.2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-900)' }}>{m.note || 'Mouvement'}</div>
                      <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-500)' }}>
                        <span>{m.user?.name}</span><span>·</span><span>{formatDateTime(m.date)}</span><span>·</span><span style={{ fontFamily: 'monospace' }}>{m.ref}</span>
                      </div>
                    </div>
                    <Badge tone={m.type === 'in' ? 'success' : 'danger'} size="sm" icon={m.type === 'in' ? 'arrowDown' : 'arrowUp'}>{m.type === 'in' ? '+' : '-'}{m.qty}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 24 }}>
          <Card padding="md">
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 16 }}>Aperçu</div>
            <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: 'var(--r-md)', background: cat ? `linear-gradient(135deg, ${cat.color}18, ${cat.color}08)` : 'var(--ink-50)', border: cat ? `1.5px dashed ${cat.color}44` : '1.5px dashed var(--ink-200)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
              {form.name && cat ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 72, height: 72, borderRadius: 'var(--r-lg)', background: `linear-gradient(135deg, ${cat.color}28, ${cat.color}14)`, border: `1.5px solid ${cat.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color }}>
                    <Icon name={cat.icon} size={36} color={cat.color} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-700)', textAlign: 'center', maxWidth: 180 }}>{form.name}</div>
                  {!isNew && <StockPill product={form} />}
                </div>
              ) : (
                <>
                  <Icon name="image" size={36} color="var(--ink-300)" />
                  <span style={{ fontSize: 12.5, color: 'var(--ink-400)' }}>Aucune image</span>
                </>
              )}
            </div>
            {!isNew && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-600)' }}>Niveau de stock</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)' }}>{form.qty} <span style={{ fontWeight: 500, color: 'var(--ink-500)' }}>{form.unit}</span></span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'var(--ink-100)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${stockGaugePercent}%`, borderRadius: 999, background: gaugeColor, transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--ink-400)' }}>
                  <span>Seuil : {form.threshold}</span><span>{stockGaugePercent}%</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
