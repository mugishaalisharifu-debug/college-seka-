import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';
import { CLOUDINARY } from './cloudinary.provider';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private readonly cloudinaryConfig: any) {}

  uploadImage(
    file: Express.Multer.File,
    foldername: string = 'admin_uploads',
  ): Promise<UploadApiResponse> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No image file provided for upload.');
    }

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: foldername,
          resource_type: 'image',
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            return reject(
              new BadRequestException(
                `Cloudinary Upload Error: ${error.message || 'Unknown upload error'}`,
              ),
            );
          }
          if (!result) {
            return reject(
              new BadRequestException('Cloudinary upload returned no data.'),
            );
          }
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  deleteImage(publicId: string): Promise<{ result: string }> {
    if (!publicId) {
      throw new BadRequestException(
        'Public ID is required for image deletion.',
      );
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: 'image' },
        (error: UploadApiErrorResponse | undefined, result: any) => {
          if (error) {
            return reject(
              new InternalServerErrorException(
                `Cloudinary Deletion Error: ${error.message || 'Unknown deletion error'}`,
              ),
            );
          }
          resolve(result);
        },
      );
    });
  }
}
