export function exportCSV(filename, headers, rows) {
  const escape = (val) => {
    if (val == null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const lines = [
    headers.map(escape).join(','),
    ...rows.map(row => row.map(escape).join(',')),
  ];

  const bom = '\uFEFF';
  const blob = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportProductsCSV(products) {
  const headers = ['SKU', 'Nom', 'Catégorie', 'Dépôt', 'Quantité', 'Seuil', 'Unité', 'Prix unitaire (FCFA)', 'Valeur stock (FCFA)'];
  const rows = products.map(p => [
    p.sku,
    p.name,
    p.category?.label || '',
    p.warehouse?.label || p.warehouse?.code || '',
    p.qty,
    p.threshold,
    p.unit,
    p.price,
    p.qty * p.price,
  ]);
  const date = new Date().toISOString().slice(0, 10);
  exportCSV(`produits_${date}.csv`, headers, rows);
}

export function exportMovementsCSV(movements) {
  const headers = ['Référence', 'Type', 'Produit', 'SKU', 'Quantité', 'Dépôt', 'Utilisateur', 'Note', 'Date'];
  const rows = movements.map(m => [
    m.ref,
    m.type === 'in' ? 'Entrée' : 'Sortie',
    m.product?.name || '',
    m.product?.sku || '',
    m.qty,
    m.warehouse?.label || m.warehouse?.code || '',
    m.user?.name || '',
    m.note || '',
    new Date(m.date).toLocaleString('fr-FR'),
  ]);
  const date = new Date().toISOString().slice(0, 10);
  exportCSV(`mouvements_${date}.csv`, headers, rows);
}
