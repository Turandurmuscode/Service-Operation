import { buildKumesCsv } from './kumesExport';

describe('kumesExport', () => {
  test('buildKumesCsv includes item rows and summary rows', () => {
    const csv = buildKumesCsv({
      items: [
        {
          name: 'Panel',
          formula: 'floor_area',
          quantity: 50,
          unit: 'm²',
          unitPrice: 10,
          lineTotal: 500,
        },
      ],
      subtotal: 500,
      discAmount: 0,
      taxAmount: 100,
      grandTotal: 600,
    });

    expect(csv).toContain('"Malzeme","Formul","Miktar","Birim","Birim Fiyat","Toplam"');
    expect(csv).toContain('"Panel","floor_area","50","m²","10","500"');
    expect(csv).toContain('"Genel Toplam","600"');
  });
});
