const MAX_DIMENSION = 10000;

export function validateDimensions(dims) {
  const errors = [];
  const length = Number(dims.length);
  const width = Number(dims.width);
  const height = Number(dims.height);

  if (!length || !width || !height) {
    errors.push('Uzunluk, en ve yukseklik alanlari zorunludur.');
  }

  if (Number.isFinite(length) && (length <= 0 || length > MAX_DIMENSION)) {
    errors.push('Uzunluk 0dan buyuk ve makul bir deger olmali.');
  }
  if (Number.isFinite(width) && (width <= 0 || width > MAX_DIMENSION)) {
    errors.push('En 0dan buyuk ve makul bir deger olmali.');
  }
  if (Number.isFinite(height) && (height <= 0 || height > MAX_DIMENSION)) {
    errors.push('Yukseklik 0dan buyuk ve makul bir deger olmali.');
  }

  return {
    valid: errors.length === 0,
    errors,
    parsed: { length, width, height },
  };
}

export function validateRates({ taxRate, discount }) {
  const errors = [];

  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
    errors.push('KDV orani 0 ile 100 arasinda olmali.');
  }

  if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
    errors.push('Iskonto orani 0 ile 100 arasinda olmali.');
  }

  return { valid: errors.length === 0, errors };
}

export function validateCalculationInput({ dims, taxRate, discount, materialsCount }) {
  const dimValidation = validateDimensions(dims);
  const rateValidation = validateRates({ taxRate, discount });
  const errors = [...dimValidation.errors, ...rateValidation.errors];

  if (materialsCount === 0) {
    errors.push('Hesaplama icin en az bir malzeme tanimlanmali.');
  }

  return {
    valid: errors.length === 0,
    errors,
    parsedDims: dimValidation.parsed,
  };
}
