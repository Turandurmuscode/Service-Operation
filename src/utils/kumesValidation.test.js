import { validateCalculationInput, validateDimensions, validateRates } from './kumesValidation';

describe('kumesValidation', () => {
  test('validates correct dimensions', () => {
    const result = validateDimensions({ length: 10, width: 5, height: 3 });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('rejects missing and invalid dimensions', () => {
    const result = validateDimensions({ length: 0, width: -1, height: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('validates tax and discount ranges', () => {
    expect(validateRates({ taxRate: 20, discount: 5 }).valid).toBe(true);
    expect(validateRates({ taxRate: -1, discount: 5 }).valid).toBe(false);
    expect(validateRates({ taxRate: 20, discount: 120 }).valid).toBe(false);
  });

  test('validates full calculation input including materials', () => {
    const ok = validateCalculationInput({
      dims: { length: 50, width: 12, height: 3.5 },
      taxRate: 20,
      discount: 10,
      materialsCount: 3,
    });
    expect(ok.valid).toBe(true);

    const bad = validateCalculationInput({
      dims: { length: 0, width: 0, height: 0 },
      taxRate: 150,
      discount: -5,
      materialsCount: 0,
    });
    expect(bad.valid).toBe(false);
    expect(bad.errors.length).toBeGreaterThan(2);
  });
});
