import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { getFromR2, uploadToR2 } from './r2cdn.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const satirePath = path.join(__dirname, '../client/assets/this-is-satire.png');

/**
 * Combines the satire overlay with an image from R2.
 * Downloads from R2, then delegates to buffer method.
 */
export async function combineWithSatireOverlayFromR2(
  r2Filename: string,
  outputFileName: string
): Promise<string> {
  const r2Buffer = await getFromR2(r2Filename);

  if (!r2Buffer) {
    throw new Error(`Image for ${r2Filename} not found in R2`);
  }

  return combineWithSatireOverlayFromBuffer(r2Buffer, outputFileName);
}

/**
 * Combines the satire overlay with a given image buffer and uploads result to R2.
 */
export async function combineWithSatireOverlayFromBuffer(
  imageBuffer: Buffer,
  outputFileName: string
): Promise<string> {
  const satireBuffer = await fs.readFile(satirePath);

  const baseImage = sharp(imageBuffer);
  const overlay = sharp(satireBuffer);

  const baseMeta = await baseImage.metadata();

  const overlayResized = await overlay
    //.resize(Math.round((baseMeta.width || 512) * 0.5)) // Optional resize
    .png()
    .toBuffer();

  const combined = await baseImage
    .composite([
      {
        input: overlayResized,
        gravity: 'centre',
      },
    ])
    .png()
    .toBuffer();

  return await uploadToR2(combined, outputFileName);
}
