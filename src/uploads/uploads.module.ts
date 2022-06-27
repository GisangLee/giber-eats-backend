import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadController } from './uploads.controller';

@Module({
    controllers: [ UploadController ],
    imports: [ ConfigService ]
})
export class UploadsModule {}
