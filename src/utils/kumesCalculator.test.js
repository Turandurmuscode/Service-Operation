import { calcQuantity, buildCalculationResult } from './kumesCalculator';

describe('kumesCalculator utils', () => {
  test('calcQuantity handles linear formulas', () => {
    const dims = { length: 10, width: 4, height: 3 };

    expect(calcQuantity('per_length', 3, 2, dims)).toBe(8);
    expect(calcQuantity('per_width', 2, 1, dims)).toBe(2);
    expect(calcQuantity('per_perimeter', 7, 1, dims)).toBe(4);
  });

  test('calcQuantity handles area, volume and fixed formulas', () => {
    const dims = { length: 5, width: 4, height: 3 };

    expect(calcQuantity('floor_area', 1, 1.2, dims)).toBe(24);
    expect(calcQuantity('wall_area', 1, 1, dims)).toBe(54);
    expect(calcQuantity('roof_area', 1, 1, dims)).toBe(20);
    expect(calcQuantity('volume', 1, 0.5, dims)).toBe(30);
    expect(calcQuantity('fixed', 1, 2.4, dims)).toBe(3);
  });

  test('buildCalculationResult computes totals with discount and tax', () => {
    const result = buildCalculationResult({
      dims: { length: 10, width: 5, height: 3 },
      materials: [
        {
          id: 'm1',
          name: 'Panel',
          formula: 'floor_area',
          interval: 1,
          multiplier: 1,
          unitPrice: 10,
        },
        {
          id: 'm2',
          name: 'Aydinlatma',
          formula: 'fixed',
          interval: 1,
          multiplier: 2,
          unitPrice: 100,
        },
      ],
      taxRate: 20,
      discount: 10,
      customerName: 'Test Co',
    });

    expect(result.floorArea).toBe(50);
    expect(result.items).toHaveLength(2);
    expect(result.items[0].quantity).toBe(50);
    expect(result.items[1].quantity).toBe(2);
    expect(result.subtotal).toBe(700);
    expect(result.discAmount).toBe(70);
    expect(result.afterDisc).toBe(630);
    expect(result.taxAmount).toBe(126);
    expect(result.grandTotal).toBe(756);
    expect(result.customerName).toBe('Test Co');
  });
});
