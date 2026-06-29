import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// We need to manipulate env variables before importing the module
const originalEnv = process.env;

beforeEach(() => {
  vi.resetModules();
  process.env = { ...originalEnv };
  // Ensure Firebase is NOT configured
  delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
});

afterEach(() => {
  process.env = originalEnv;
  localStorage.clear();
});

describe('getProject mock fallback logic', () => {
  it('returns the project when it exists in mock storage', async () => {
    const mockProject = { id: 'mock-id-123', name: 'Test Project' };
    localStorage.setItem('memora_mock_projects', JSON.stringify([mockProject]));

    const { getProject } = await import('./firebase');

    const project = await getProject('mock-id-123');
    expect(project).toEqual(mockProject);
  });

  it('returns null when the project does not exist in mock storage', async () => {
    const mockProject = { id: 'mock-id-456', name: 'Other Project' };
    localStorage.setItem('memora_mock_projects', JSON.stringify([mockProject]));

    const { getProject } = await import('./firebase');

    const project = await getProject('mock-id-123');
    expect(project).toBeNull();
  });

  it('returns null when mock storage is empty', async () => {
    const { getProject } = await import('./firebase');

    const project = await getProject('mock-id-123');
    expect(project).toBeNull();
  });
});
