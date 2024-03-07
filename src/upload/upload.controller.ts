import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as uuid from 'uuid';
import { UploadService } from './upload.service';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          let folderName = './public/images/';
          callback(null, folderName);
        },

        filename: (req, file, callback) => {
          const randomUUID = uuid.v4();
          const uniqueFileName = `${randomUUID}.${file.originalname
            .split('.')
            .pop()}`;
          callback(null, uniqueFileName);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedTypes = ['image/jpeg']; // List of allowed MIME types
        if (allowedTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Only JPEG files are allowed!'), false);
        }
      },
    }),
  )

  @UseGuards(AccessTokenGuard)
  @Post()
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    let result = await this.uploadService.create({
      fileName: file.filename,
      url: '/public/images/' + file.filename,
    });

    return { message: 'File uploaded successfully', result };
  }
}
