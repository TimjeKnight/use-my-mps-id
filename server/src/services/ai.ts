// ai.ts
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { Representative } from './parliament.js';
import { OpenAI } from 'openai';
import { fileURLToPath } from 'url';
import 'dotenv/config'; // auto-loads .env
import { checkR2ObjectExists, uploadToR2 } from './r2cdn.js';
import { combineWithSatireOverlayFromBuffer } from './pngservice.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inFlightGenerations = new Map<string, Promise<string>>();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Optional: download the thumbnail (but we can't upload to OpenAI at present)
async function downloadThumbnail(url: string, repId: number): Promise<string> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  
    const fileDirectory = path.join(__dirname, `../../output/rep_portraits`);
      console.log("21"+fileDirectory);

  await fs.mkdir(path.dirname(fileDirectory), { recursive: true });

    const filePath = path.join(__dirname, `../../output/rep_portraits/rep_${repId}.jpg`);
  console.log("23"+filePath);
  await fs.writeFile(filePath, <any>response.data);
  return filePath;
}

async function encodeImageAsBase64(filePath: string): Promise<string> {
  const imageBuffer = await fs.readFile(filePath);
  return imageBuffer.toString('base64');
}

export async function generateMockPassportPhoto(rep: Representative): Promise<string> {
  const imagePath = await downloadThumbnail(rep.thumbnailUrl, rep.id);
  const base64Image = await encodeImageAsBase64(imagePath);


  const prompt = `
Create a passport appropriate photo from this image. A passport photo should be face on, only consist of the head and neck.
`;

  return await generateImageFromPrompt(prompt, [base64Image], rep.name+"-passport");
}

export async function generateImageFromPrompt(
  prompt: string,
  base64Images: string[],
  outputFileName: string
): Promise<string> {
  const inputContent = <any>[
    { type: 'input_text', text: prompt },
    ...base64Images.map((img) => ({
      type: 'input_image',
      image_url: `data:image/jpeg;base64,${img}`,
      detail: 'auto'
    }))
  ];

  const response = await openai.responses.create({
    model: 'gpt-4.1',
    input: [{ role: 'user', content: inputContent }],
    tools: [{ type: 'image_generation' }]
  });

  const imageOutput = response.output?.find(o => o.type === 'image_generation_call');

  if (imageOutput?.result && typeof imageOutput.result === 'string') {
  const fileName = `${outputFileName.replace(/\s+/g, '_')}.png`;
  const buffer = Buffer.from(imageOutput.result, 'base64');

  const url = await combineWithSatireOverlayFromBuffer(buffer, fileName);

  console.log(`✅ Image uploaded to R2: ${url}`);
  return url;
  }

  console.log('ℹ️ No image generated');
  console.log('Output text:', response.output_text ?? '[no text]');
  return '';
}

export async function generateMockDriversLicense(rep: Representative): Promise<string> {
  const cacheKey = rep.name.replace(/\s+/g, '_');

  // Check if generation already in progress
  if (inFlightGenerations.has(cacheKey)) {
    console.log(`⏳ Awaiting in-progress generation for ${cacheKey}`);
    return inFlightGenerations.get(cacheKey)!;
  }

  // Check if it already exists in the CDN
  const idCardLocation = await idCardExists(rep);
  if (idCardLocation) {
    console.log(`✅ Existing card found for ${cacheKey}`);
    return idCardLocation;
  }

  // Begin generation and cache the promise
  const generationPromise = (async () => {
    console.log(`🚀 Generating new ID for ${cacheKey}`);

    const address = [rep.address1, rep.address2, rep.address3, rep.address4]
      .filter(Boolean)
      .join(', ');

    const surname = rep.name.trim().split(' ').slice(-1)[0].toUpperCase();
    const shortSurname = surname.slice(0, 5).toUpperCase();

    const prompt = `
Fingers hold up a UK driving licence. 
The left of the licence has a black and white passport-style photo, for a person named ${rep.name}.
The fingers are positioned in a way that clearly displays the licence. 
They are the same skin tone as ${rep.name}.
The background is indoors but heavily blurred.

Top left: UK. Top centre: DRIVING LICENCE. Top right: Union Jack flag.
Use the official UK layout and the following details:

1. ${surname}
2. ${rep.name.toUpperCase()}
3. ${rep.dob} ENGLAND
4a. 20.06.2019  4c. DVLA
4b. 19.06.2029
5. ${shortSurname}801276KB9UT 54
7. (squiggly signature)
8. ${address}
9. AM/B/BE/f/k/q
    `;

    return await generateImageFromPrompt(prompt, [], rep.name);
  })();

  inFlightGenerations.set(cacheKey, generationPromise);

  try {
    const result = await generationPromise;
    return result;
  } finally {
    inFlightGenerations.delete(cacheKey); // Clean up after
  }
}

export async function generateMockDriversLicenseBack(rep: Representative): Promise<string> {

    /*
    if(!(await passportPhotoExists(rep))){
        console.log("passport not found, generating");
        await generateMockPassportPhoto(rep);
    }else {
        console.log("passport found");
    }
*/
    const idCardLocation = await idCardExists(rep);
    if(idCardLocation){
        console.log("id card found, returning "+idCardLocation);
        return idCardLocation;
    } else{
        console.log("id not found, generating...");
    }



  //const imagePath = await downloadThumbnail(rep.thumbnailUrl, rep.id);
  const fileName = `${rep.name.replace(/\s+/g, '_')}-passport.png`;
  const filePath = path.join(__dirname, `../../output/ai/${fileName}`);
  const base64Image = await encodeImageAsBase64(filePath);

  const address = [rep.address1, rep.address2, rep.address3, rep.address4]
    .filter(Boolean)
    .join(', ');

    const surname = rep.name.trim().split(' ').slice(-1)[0].toUpperCase();
  const prompt = `
Fingers hold up the back of a UK driving licence. Background is indoors but heavily blurred.
Use the official UK layout, with a grid of small icons of vehicles in the first column, and dates in the second, third and fourth columns.
`;

return await generateImageFromPrompt(prompt, [], rep.name);
  //return await generateImageFromPrompt(prompt, [base64Image], rep.name);
}

export async function passportPhotoExists(rep: Representative): Promise<boolean> {
  const fileName = `${rep.name.replace(/\s+/g, '_')}-passport.png`;
  const filePath = path.join(__dirname, `../../output/ai/${fileName}`);
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

export async function idCardExists(rep: Representative): Promise<string> {
  const fileName = `${rep.name.replace(/\s+/g, '_')}.png`;
  const exists = await checkR2ObjectExists(fileName);

  if (exists) {
    const url = `https://r2-public-proxy.use-their-id.workers.dev/${fileName}`;
    return url;
  }

  return '';
}