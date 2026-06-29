import { describe, it, expect, vi } from 'vitest';
import { getCloudinaryPublicId } from './theme';

describe('getCloudinaryPublicId', () => {
  it('should extract the public ID with a version segment', () => {
    expect(getCloudinaryPublicId('http://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg')).toBe('sample');
  });

  it('should extract the public ID without a version segment', () => {
    expect(getCloudinaryPublicId('http://res.cloudinary.com/demo/image/upload/sample.jpg')).toBe('sample');
  });

  it('should extract the public ID with a folder', () => {
    expect(getCloudinaryPublicId('http://res.cloudinary.com/demo/image/upload/v1312461204/folder/sample.jpg')).toBe('folder/sample');
    expect(getCloudinaryPublicId('http://res.cloudinary.com/demo/image/upload/folder/sample.jpg')).toBe('folder/sample');
  });

  it('should return null for null or empty input', () => {
    expect(getCloudinaryPublicId(null as any)).toBeNull();
    expect(getCloudinaryPublicId('')).toBeNull();
  });

  it('should return null if "res.cloudinary.com" is missing', () => {
    expect(getCloudinaryPublicId('http://example.com/demo/image/upload/sample.jpg')).toBeNull();
  });

  it('should return null if "/upload/" is missing', () => {
    expect(getCloudinaryPublicId('http://res.cloudinary.com/demo/image/sample.jpg')).toBeNull();
  });

  it('should handle strings where version does not match pattern', () => {
    // Starts with v but not followed by only digits
    expect(getCloudinaryPublicId('http://res.cloudinary.com/demo/image/upload/v123a/sample.jpg')).toBe('v123a/sample');
    // Folder starting with v and numbers
    expect(getCloudinaryPublicId('http://res.cloudinary.com/demo/image/upload/v1234/v1234/sample.jpg')).toBe('v1234/sample');
  });

  it('should catch errors when splitting malformed objects', () => {
    // Simulate a malformed input that passes initial checks but throws an error when trying to call .split()
    // or when some methods are missing
    const malformedInput = {
      includes: () => true,
      split: () => {
        throw new Error('Test error');
      }
    };

    // Silence console.error for this test as the function logs the error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(getCloudinaryPublicId(malformedInput as any)).toBeNull();

    // Ensure the console.error was actually called as proof the catch block executed
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
