import {
  readLocalJSON,
  writeLocalJSON,
  readSessionJSON,
  writeSessionJSON,
} from './storageService';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test('writes and reads local JSON', () => {
    const payload = { a: 1, b: ['x', 'y'] };
    writeLocalJSON('k1', payload);

    expect(readLocalJSON('k1', null)).toEqual(payload);
  });

  test('returns fallback when local key is missing', () => {
    expect(readLocalJSON('missing', { ok: true })).toEqual({ ok: true });
  });

  test('returns fallback when local value is invalid JSON', () => {
    localStorage.setItem('bad', '{invalid json');

    expect(readLocalJSON('bad', ['fallback'])).toEqual(['fallback']);
  });

  test('writes and reads session JSON', () => {
    const payload = [1, 2, 3];
    writeSessionJSON('s1', payload);

    expect(readSessionJSON('s1', [])).toEqual(payload);
  });

  test('returns fallback when session value is invalid JSON', () => {
    sessionStorage.setItem('bad-session', '{broken');

    expect(readSessionJSON('bad-session', { safe: true })).toEqual({ safe: true });
  });
});
