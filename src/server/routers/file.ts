import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { z } from 'zod';
import { adminProcedure, createTRPCRouter } from "../trpc";

const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsRegion = process.env.AWS_REGION;

export const fileRouter = createTRPCRouter({
  upload: adminProcedure
    .input(z.object({
      fileContent: z.string(), // base64 encoded file content
      fileName: z.string(),
    }))
    .mutation(async ({ input }) => {
      if (!input.fileContent) throw new TRPCError({
        message: 'No file content provided',
        code: 'BAD_REQUEST'
      });
      if (!input.fileName) throw new TRPCError({
        message: 'No file name provided',
        code: 'BAD_REQUEST'
      });

      if (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion) {
        throw new TRPCError({
          message: 'AWS credentials and region must be defined',
          code: 'INTERNAL_SERVER_ERROR'
        });
      }

      const s3 = new S3Client({
        credentials: {
          accessKeyId: awsAccessKeyId,
          secretAccessKey: awsSecretAccessKey,
        },
        region: awsRegion,
      });

      // Decode the base64 file content
      const fileBuffer = Buffer.from(input.fileContent, 'base64');

      const bucketName = process.env.AWS_S3_BUCKET_NAME!;
      const fileName = input.fileName; // Using the provided file name

      const putObjectParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
      };

      try {
        const command = new PutObjectCommand(putObjectParams);
        await s3.send(command);

        // Construct the file URL after successful upload
        const imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        return {
          status: 'success',
          image_url: imageUrl,
        };
      } catch (error: any) {
        console.error(error);
        return {
          status: 'error',
          image_url: undefined,
          message: error.message,
        };
      }
    }),
});