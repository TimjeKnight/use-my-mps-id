import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: 'https://a0c947d8fb9f25e2065e6a644dcc11bb.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  }
});



export async function uploadToR2(buffer: Buffer, key: string, contentType = 'image/png') {
  const bucket = 'use-their-id'; // match what you created with wrangler

  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read', // required if using public access via custom domain
    })
  );

  return `https://r2-public-proxy.use-their-id.workers.dev/${key}`;
}

export async function checkR2ObjectExists(key: string): Promise<boolean> {
  const bucket = 'use-their-id';

  try {
    await r2.send(
      new HeadObjectCommand({
        Bucket: bucket,
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