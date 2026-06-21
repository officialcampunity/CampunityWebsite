import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

const mockCloudinary = jest.requireMock('cloudinary').v2;

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {
    jest.clearAllMocks();
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
  });

  it('should configure cloudinary when env vars are set', () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'mycloud';
    process.env.CLOUDINARY_API_KEY = 'key';
    process.env.CLOUDINARY_API_SECRET = 'secret';

    service = new CloudinaryService();

    expect(mockCloudinary.config).toHaveBeenCalledWith({
      cloud_name: 'mycloud',
      api_key: 'key',
      api_secret: 'secret',
    });
  });

  it('should not configure cloudinary when env vars missing', () => {
    service = new CloudinaryService();

    expect(mockCloudinary.config).not.toHaveBeenCalled();
  });

  describe('uploadFile', () => {
    beforeEach(() => {
      process.env.CLOUDINARY_CLOUD_NAME = 'mycloud';
      process.env.CLOUDINARY_API_KEY = 'key';
      process.env.CLOUDINARY_API_SECRET = 'secret';
      service = new CloudinaryService();
    });

    it('should upload file and return secure_url', async () => {
      const buffer = Buffer.from('test');
      mockCloudinary.uploader.upload_stream.mockImplementation((_opts: any, cb: any) => {
        cb(null, { secure_url: 'https://res.cloudinary.com/test.jpg' });
        return { pipe: jest.fn() };
      });

      const result = await service.uploadFile(buffer, 'test.jpg', 'image/jpeg');

      expect(result).toBe('https://res.cloudinary.com/test.jpg');
    });

    it('should reject when upload fails', async () => {
      const buffer = Buffer.from('test');
      mockCloudinary.uploader.upload_stream.mockImplementation((_opts: any, cb: any) => {
        cb(new Error('Upload failed'), null);
        return { pipe: jest.fn() };
      });

      await expect(service.uploadFile(buffer, 'test.jpg', 'image/jpeg')).rejects.toThrow('Upload failed');
    });

    it('should throw when not initialized', async () => {
      delete process.env.CLOUDINARY_CLOUD_NAME;
      delete process.env.CLOUDINARY_API_KEY;
      delete process.env.CLOUDINARY_API_SECRET;
      mockCloudinary.uploader.upload_stream.mockReset();

      const uninitialized = new CloudinaryService();

      await expect(uninitialized.uploadFile(Buffer.from('test'), 'test.jpg', 'image/jpeg')).rejects.toThrow(
        'Cloudinary is not configured',
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file when initialized', async () => {
      process.env.CLOUDINARY_CLOUD_NAME = 'mycloud';
      process.env.CLOUDINARY_API_KEY = 'key';
      process.env.CLOUDINARY_API_SECRET = 'secret';
      service = new CloudinaryService();
      mockCloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });

      await service.deleteFile('public_id');

      expect(mockCloudinary.uploader.destroy).toHaveBeenCalledWith('public_id');
    });

    it('should not call destroy when not initialized', async () => {
      service = new CloudinaryService();
      await service.deleteFile('public_id');

      expect(mockCloudinary.uploader.destroy).not.toHaveBeenCalled();
    });
  });
});
