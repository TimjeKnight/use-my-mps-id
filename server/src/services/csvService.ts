import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Constituency {
  pcd: string;
  oseast1m: string;
  osnrth1m: string;
  pconcd: string;
  pconnm: string;
  pconnmw: string;
}

// In-memory lookup map
const postcodeMap = new Map<string, string>();
let isLoaded = false;

// Load CSVs once, async
async function loadPostcodes(): Promise<void> {
  if (isLoaded) return;

  const files = [
    path.join(__dirname, '../postcode_constituency_files/pcd_pcon_uk_lu_may_24-1.csv'),
    path.join(__dirname, '../postcode_constituency_files/pcd_pcon_uk_lu_may_24-2.csv')
  ];

  console.log('📂 Loading postcode data from:');
  files.forEach(f => console.log(' -', f));

  const loadFile = (filePath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row: Constituency) => {
          const key = row.pcd?.replace(/\s/g, '').trim().toUpperCase(); // remove all spaces
          if(!key){
            console.log(row);
          }
          //console.log(key);
          if (key && row.pconnm) {            
            postcodeMap.set(key, row.pconnm.replace(/^"|"$/g, '')); // strip surrounding quotes
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
  };

  try {
    await Promise.all(files.map(loadFile));
    isLoaded = true;
    console.log(`✅ Loaded ${postcodeMap.size} postcodes into memory.`);
  } catch (err) {
    console.error('❌ Failed to load postcode files:', err);
    throw err;
  }
}

export async function findConstituencyNameByPostcode(postcode: string): Promise<string> {
  await loadPostcodes();

  const cleanedPostcode = postcode.trim().toUpperCase();
  const result = postcodeMap.get(cleanedPostcode);

  return result ?? '';
}