import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { UploadFileResDto } from './dto/res.dto';

@Controller('api/uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('profile-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadProfileImage(
    @UploadedFile() file: Express.MulterS3.File,
  ): UploadFileResDto {
    return this.uploadsService.uploadFile(file);
  }

  /**
   * 배너 길이 업로드 시 백엔드에서 편집 또는 제한 설정이 필요한지? 가능한지 확인 필요
   */
  @Post('channel-top-banner-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadChannelTopBanner(
    @UploadedFile() file: Express.MulterS3.File,
  ): UploadFileResDto {
    return this.uploadsService.uploadFile(file);
  }

  @Post('channel-profile-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadChannelProfile(
    @UploadedFile() file: Express.MulterS3.File,
  ): UploadFileResDto {
    return this.uploadsService.uploadFile(file);
  }

  /**
   * 스트리밍 영상 업로드 시 압축방식 선정을 s3에서 할 수 있는지 확인 필요
   * 혹은 압축 파일이 mimetype 분류가 vedio로 설정 되는지, 아니라면 그에 따른 대처가 필요
   */
  @Post('stream-video')
  @UseInterceptors(FileInterceptor('file'))
  uploadStreamVideo(
    @UploadedFile() file: Express.MulterS3.File,
  ): UploadFileResDto {
    return this.uploadsService.uploadFile(file);
  }

  @Post('channel-notice-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadChannelNotice(
    @UploadedFile() file: Express.MulterS3.File,
  ): UploadFileResDto {
    return this.uploadsService.uploadFile(file);
  }
}
