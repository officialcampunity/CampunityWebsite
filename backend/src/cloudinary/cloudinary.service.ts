import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private initialized = false;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.initialized = true;
      this.logger.log('Cloudinary configured successfully');
    } else {
      this.logger.warn('Cloudinary not configured — falling back to local storage');
    }
  }

  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<string> {
    if (!this.initialized) {
      throw new Error('Cloudinary is not configured');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'campunity',
          resource_type: 'auto',
          public_id: `${Date.now()}-${originalName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)}`,
          format: originalName.split('.').pop(),
        },
        (error, result) => {
          if (error || !result) {
            this.logger.error(`Cloudinary upload failed: ${error?.message || 'Unknown error'}`);
            reject(error || new Error('Upload failed'));
          } else {
            this.logger.log(`File uploaded to Cloudinary: ${result.secure_url}`);
            resolve(result.secure_url);
          }
        },
      );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    if (!this.initialized) return;
    try {
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Deleted from Cloudinary: ${publicId}`);
    } catch (err) {
      this.logger.error(`Failed to delete from Cloudinary: ${err}`);
    }
  }
}
