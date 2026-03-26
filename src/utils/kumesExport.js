export function buildKumesCsv(calcResult) {
  const headers = [
    'Malzeme',
    'Formul',
    'Miktar',
    'Birim',
    'Birim Fiyat',
    'Toplam',
  ];

  const rows = (calcResult.items || []).map((item) => [
    item.name,
    item.formula,
    item.quantity,
    item.unit,
    item.unitPrice,
    item.lineTotal,
  ]);

  const summaryRows = [
    [],
    ['Ara Toplam', calcResult.subtotal],
    ['Iskonto', calcResult.discAmount],
    ['KDV', calcResult.taxAmount],
    ['Genel Toplam', calcResult.grandTotal],
  ];

  const allRows = [headers, ...rows, ...summaryRows];
  return allRows
    .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function downloadKumesCsv(calcResult) {
  const csv = buildKumesCsv(calcResult);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kumes-hesaplama-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
