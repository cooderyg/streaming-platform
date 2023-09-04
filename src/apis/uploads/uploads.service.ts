import { BadRequestException, Injectable } from '@nestjs/common';
import { IUploadsServiceUploadFileReturn } from './interfaces/uploads-service.interface';

@Injectable()
export class UploadsService {
  uploadFile(file: Express.MulterS3.File): IUploadsServiceUploadFileReturn {
    if (!file) {
      throw new BadRequestException('파일이 존재하지 않습니다.');
    }
    return { url: file.location };
  }
}
