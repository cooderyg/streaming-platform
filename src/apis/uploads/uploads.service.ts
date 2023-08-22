import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class UploadsService {
  uploadFile(file: Express.MulterS3.File) {
    if (!file) {
      throw new BadRequestException('파일이 존재하지 않습니다.');
    }
    return { url: file.location };
  }
}
