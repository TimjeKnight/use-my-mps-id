import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { getFromR2, uploadToR2 } from './r2cdn.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/**
 * Combines the satire overlay with an image from R2 and saves locally.
 * @param r2ImageUrl URL of the image in the R2 bucket
 * @param outputFileName Name for the output file (e.g., 'combined.png')
 * @returns The local path to the saved image
 */
export async function combineWithSatireOverlay(repName: string, outputFileName: string): Promise<string> {
  // Path to the satire overlay in the client assets
  const satirePath = path.join(__dirname, '../client/assets/this-is-satire.png');
  const satireBuffer = await fs.readFile(satirePath);

  // Download the R2 image
  const r2Buffer = await getFromR2(repName);

  if(!r2Buffer) {
    throw new Error(`Image for ${repName} not found in R2`);
  }
  // Load both images with sharp
  const r2Image = sharp(r2Buffer);
  const satireImage = sharp(satireBuffer);

  // Get R2 image metadata to size the overlay
  const r2Meta = await r2Image.metadata();
  const satireResized = await satireImage
    //.resize(Math.round((r2Meta.width || 512) * 0.5)) // scale overlay to 50% width of base
    .png()
    .toBuffer();

  // Composite overlay in the bottom right
  const combined = await r2Image
    .composite([
      {
        input: satireResized,
        gravity: 'centre',
      },
    ])
    .png()
    .toBuffer();


  // Ensure output directory exists
  await uploadToR2(combined, outputFileName);

  return outputFileName;
}
