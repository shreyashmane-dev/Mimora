import { renderHook } from '@testing-library/react';
import { useTranslation } from './useTranslation';

// Mock the translations module so we are completely decoupled from actual dictionary values
jest.mock('@/lib/translations', () => ({
  TRANSLATIONS: {
    testKey: 'Test Translation Value',
    anotherKey: 'Another Value',
  }
}));

describe('useTranslation', () => {
  it('returns translation when key exists in the dictionary', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('testKey' as any)).toBe('Test Translation Value');
    expect(result.current.t('anotherKey' as any)).toBe('Another Value');
  });

  it('returns the key itself when translation does not exist', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('missingKey' as any)).toBe('missingKey');
  });

  it('returns currentLang as en', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.currentLang).toBe('en');
  });
});
