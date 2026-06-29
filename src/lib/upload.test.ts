import { fileToBase64 } from './upload';

describe('fileToBase64', () => {
  it('should convert a File to a base64 string', async () => {
    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    const result = await fileToBase64(file);
    expect(result).toBe('data:text/plain;base64,ZHVtbXkgY29udGVudA==');
  });

  it('should handle different file types properly', async () => {
    const file = new File(['image data'], 'test.png', { type: 'image/png' });
    const result = await fileToBase64(file);
    expect(result).toBe('data:image/png;base64,aW1hZ2UgZGF0YQ==');
  });

  it('should reject on error', async () => {
    const originalFileReader = global.FileReader;

    // Create a mock FileReader that immediately triggers an error
    class MockFileReader {
      onerror: ((error: any) => void) | null = null;
      readAsDataURL() {
        setTimeout(() => {
          if (this.onerror) {
            this.onerror(new Error('Simulated error'));
          }
        }, 10);
      }
    }
    global.FileReader = MockFileReader as any;

    const file = new File([''], 'test.txt');
    await expect(fileToBase64(file)).rejects.toThrow('Simulated error');

    global.FileReader = originalFileReader;
  });
});
