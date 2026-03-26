export function calcQuantity(formula, interval, multiplier, dims) {
  const { length, width, height } = dims;
  const perimeter = 2 * (length + width);
  const floorArea = length * width;
  const wallArea = 2 * (length * height) + 2 * (width * height);
  const roofArea = length * width;
  const volume = length * width * height;
  const k = multiplier || 1;
  const inv = interval || 1;

  switch (formula) {
    case 'per_length':
      return Math.ceil(length / inv) * k;
    case 'per_width':
      return Math.ceil(width / inv) * k;
    case 'per_perimeter':
      return Math.ceil(perimeter / inv) * k;
    case 'floor_area':
      return Math.ceil(floorArea * k);
    case 'wall_area':
      return Math.ceil(wallArea * k);
    case 'roof_area':
      return Math.ceil(roofArea * k);
    case 'volume':
      return Math.ceil(volume * k);
    case 'fixed':
      return Math.ceil(k);
    default:
      return 0;
  }
}

export function buildCalculationResult({ dims, materials, taxRate, discount, customerName }) {
  const d = {
    length: Number(dims.length),
    width: Number(dims.width),
    height: Number(dims.height),
  };

  const items = materials.map((mat) => {
    const qty = calcQuantity(mat.formula, mat.interval, mat.multiplier, d);
    const total = qty * mat.unitPrice;
    return { ...mat, quantity: qty, lineTotal: total };
  });

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const discAmount = subtotal * (discount / 100);
  const afterDisc = subtotal - discAmount;
  const taxAmount = afterDisc * (taxRate / 100);
  const grandTotal = afterDisc + taxAmount;

  return {
    dims: d,
    floorArea: d.length * d.width,
    wallArea: 2 * (d.length * d.height) + 2 * (d.width * d.height),
    perimeter: 2 * (d.length + d.width),
    volume: d.length * d.width * d.height,
    items,
    subtotal,
    discAmount,
    afterDisc,
    taxAmount,
    grandTotal,
    taxRate,
    discount,
    customerName,
    date: new Date().toISOString(),
  };
}
