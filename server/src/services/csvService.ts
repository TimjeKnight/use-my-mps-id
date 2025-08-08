// services/csvService.ts
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { fileURLToPath } from 'url';
import { Redis } from '@upstash/redis';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const RAW_CSV_FILES = [
  path.join(__dirname, '../../server/postcode_constituency_files/pcd_pcon_uk_lu_may_24-1.csv'),
  path.join(__dirname, '../../server/postcode_constituency_files/pcd_pcon_uk_lu_may_24-2.csv'),
];

export interface Constituency {
  pcd: string;
  pconnm: string;
}

const keyFor = (pc: string) => `pc:${pc}`;

/**
 * Build: write each postcode as its own key using a pipeline.
 * builds redis. only usable on local machine
 */
export async function buildPostcodeDictionaryFromFiles(): Promise<void> {
  console.log('🔄 Building postcode keys in Redis from source files...');

  const BATCH_SIZE = 5000;

  const buildFromCsv = (filePath: string): Promise<number> =>
    new Promise((resolve, reject) => {
      let total = 0;
      let pending = 0;
      let pipe = redis.pipeline();

      const flush = async () => {
        if (pending === 0) return;
        await pipe.exec();
        total += pending;
        pending = 0;
        pipe = redis.pipeline();
      };

      const stream = fs.createReadStream(filePath).pipe(csvParser());

      stream.on('data', async (row: Constituency) => {
        const cleaned = row.pcd?.replace(/\s/g, '').trim().toUpperCase();
        if (cleaned && row.pconnm) {
          const constituency = row.pconnm.replace(/^"|"$/g, '');
          pipe.set(keyFor(cleaned), constituency);
          pending++;

          if (pending >= BATCH_SIZE) {
            stream.pause();
            console.log("total "+total)
            try {
              await flush();
            } catch (e) {
              stream.destroy(e as Error);
              return;
            }
            stream.resume();
          }
        }
      });

      stream.on('end', async () => {
        try {
          await flush();
          resolve(total);
        } catch (e) {
          reject(e);
        }
      });

      stream.on('error', reject);
    });

  const counts = await Promise.all(RAW_CSV_FILES.map(buildFromCsv));
  console.log(`✅ Loaded ${counts.reduce((a, b) => a + b, 0)} keys into Redis.`);
}

/**
 * Lookup: single GET against that postcode key.
 */
export async function findConstituencyNameByPostcode(postcode: string): Promise<string> {
  const cleaned = postcode.replace(/\s/g, '').trim().toUpperCase();
  const value = await redis.get<string>(keyFor(cleaned));
  return value ?? '';
}
