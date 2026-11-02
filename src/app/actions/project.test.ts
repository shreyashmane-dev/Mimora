import { describe, it, expect, vi } from 'vitest';
import { deleteProjectWithAssets } from './project';
import { getProject } from '@/lib/firebase';

// Mock the firebase lib module
vi.mock('@/lib/firebase', () => ({
  getProject: vi.fn(),
  deleteProject: vi.fn(),
}));

// Mock the theme actions
vi.mock('@/app/actions/theme', () => ({
  deleteImagesFromCloudinary: vi.fn(),
}));

describe('deleteProjectWithAssets', () => {
  it('should return an error when project is not found', async () => {
    // Mock getProject to return null
    (getProject as any).mockResolvedValueOnce(null);

    const result = await deleteProjectWithAssets('non-existent-id');

    expect(result).toEqual({ success: false, error: 'Project not found' });
    expect(getProject).toHaveBeenCalledWith('non-existent-id');
  });
});
