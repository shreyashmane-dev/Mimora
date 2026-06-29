import { compressImage } from './upload';
import imageCompression from 'browser-image-compression';

jest.mock('browser-image-compression');

describe('compressImage', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Suppress console.error in tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.resetAllMocks();
  });

  it('should return the original file if compression throws an error', async () => {
    const mockFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const mockError = new Error('Compression failed');

    (imageCompression as jest.Mock).mockRejectedValue(mockError);

    const result = await compressImage(mockFile);

    expect(result).toBe(mockFile);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Compression error, using original file:", mockError);
  });

  it('should successfully compress the file when no error occurs', async () => {
    const mockFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const compressedFile = new File(['compressed content'], 'test.png', { type: 'image/png' });

    (imageCompression as jest.Mock).mockResolvedValue(compressedFile);

    const result = await compressImage(mockFile);

    expect(result).toBe(compressedFile);
    expect(imageCompression).toHaveBeenCalledWith(mockFile, {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1080,
      useWebWorker: true,
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
