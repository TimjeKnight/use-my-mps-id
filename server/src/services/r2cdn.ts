import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const oldBucket = 'use-their-id'; // used in multiple places

const newBucket = 'use-their-id-marked'; // used in multiple places

export const r2 = new S3Client({
  region: 'auto',
  endpoint: 'https://a0c947d8fb9f25e2065e6a644dcc11bb.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  }
});

export async function getAllFilenames(bucketName: string): Promise<string[]> {
  const filenames: string[] = [];
  let ContinuationToken: string | undefined = undefined;

  try {
    do {
      const response = await r2.send(
        new ListObjectsV2Command({
          Bucket: bucketName,
          ContinuationToken
        })
      );

      const keys = response.Contents?.map(obj => obj.Key).filter(Boolean) as string[];
      filenames.push(...keys);
      ContinuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
    } while (ContinuationToken);
  } catch (err) {
    console.error('Failed to list objects in R2:', err);
    throw err;
  }

  return filenames;
}

export async function uploadToR2(buffer: Buffer, key: string, contentType = 'image/png') {
  await r2.send(
    new PutObjectCommand({
      Bucket: newBucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read', // required if using public access via custom domain
    })
  );

  return `https://r2-public-proxy.use-their-id.workers.dev/${key}`;
}

export async function checkR2ObjectExists(key: string): Promise<boolean> {
  try {
    await r2.send(
      new HeadObjectCommand({
        Bucket: newBucket,
        Key: key,
      })
    );
    return true;
  } catch (err: any) {
    if (err.name === 'NotFound') return false;
    console.error('R2 check failed:', err);
    throw err;
  }
}

export async function getFromR2(key: string): Promise<Buffer | null> {
  try {
    const result = await r2.send(
      new GetObjectCommand({
        Bucket: newBucket,
        Key: key,
      })
    );

    if (!result.Body || !(result.Body instanceof Readable)) {
      throw new Error('Unexpected response: Body is not a stream');
    }

    const chunks: Buffer[] = [];
    for await (const chunk of result.Body as Readable) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }

    return Buffer.concat(chunks);
  } catch (err: any) {
    if (err.name === 'NoSuchKey' || err.name === 'NotFound') {
      return null;
    }
    console.error('R2 get failed:', err);
    throw err;
  }
}