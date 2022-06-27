import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FileInterceptor } from "@nestjs/platform-express";
import * as AWS from "aws-sdk";



@Controller("uploads")
export class UploadController {
    constructor(
        private readonly configService: ConfigService
    ) {}

    @Post("")
    @UseInterceptors(FileInterceptor("file"))
    async uploadFile(@UploadedFile() file) {
        AWS.config.update({
            credentials: {
                accessKeyId: this.configService.get("accessKeyId"),
                secretAccessKey: this.configService.get("secretAccessKey")
            },
        });

        try {
            const objectName = `${ Date.now() + file.originalname }`;
            const bucketName = this.configService.get("bucketName");

            await new AWS.S3()
            .putObject({
                Body: file.buffer,
                Bucket: bucketName,
                Key: objectName,
                ACL: "public-read",
            })
            .promise();

            const url = `https://${ bucketName }.s3.amazonaws.com/${objectName}`;

            return { url };

        } catch (error) {
            return null;
        }
        
    };
};