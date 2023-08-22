import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multerS3 from 'multer-s3';
import { basename, extname } from 'path';

export const multerOptionsFactory = (
  configService: ConfigService,
): MulterOptions => {
  return {
    storage: multerS3({
      s3: new S3Client({
        region: configService.get('AWS_S3_REGION'),
        credentials: {
          accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
          secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
        },
      }),
      bucket: configService.get('AWS_S3_BUCKET'),
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      // file에 메타데이터를 지정합니다.
      // metadata(_req, _file, callback) {
      //   callback(null, { owner: 'it' });
      // },
      key(_req, file, callback) {
        const fileType = file.mimetype.split('/')[0];
        const ext = extname(file.originalname); // 확장자
        const baseName = basename(file.originalname, ext); // 확장자 제외
        const fileName =
          fileType === 'video'
            ? `videos/${baseName}-${Date.now()}${ext}`
            : `images/${baseName}-${Date.now()}${ext}`;
        callback(null, fileName);
      },
    }),
    // 파일 크기 제한
    /**
     * @note 이미지 파일과 동영상 파일 업로드 시 용량 제한을 분리하도록 하는 로직 필요
     */
    limits: {
      fileSize: 5 * 1024 * 1024, // 5mb
    },
  };
};
