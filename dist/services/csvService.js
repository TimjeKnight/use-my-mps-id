import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { stringify } from 'csv-stringify/sync';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const postcodeMap = new Map();
let isLoaded = false;
const RAW_CSV_FILES = [
    path.join(__dirname, '../postcode_constituency_files/pcd_pcon_uk_lu_may_24-1.csv'),
    path.join(__dirname, '../postcode_constituency_files/pcd_pcon_uk_lu_may_24-2.csv')
];
const DICTIONARY_FILE = path.join(__dirname, '../postcode_constituency_files/postcodeDictionary.csv');
/**
 * STEP 1:
 * Build postcodeDictionary.csv from two large raw CSV files.
 */
export async function buildPostcodeDictionaryFromFiles() {
    const map = new Map();
    const loadFile = (filePath) => {
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (row) => {
                const key = row.pcd?.replace(/\s/g, '').trim().toUpperCase();
                if (key && row.pconnm) {
                    map.set(key, row.pconnm.replace(/^"|"$/g, ''));
                }
            })
                .on('end', resolve)
                .on('error', reject);
        });
    };
    console.log('🔄 Building postcode dictionary from source files...');
    await Promise.all(RAW_CSV_FILES.map(loadFile));
    const data = Array.from(map.entries()).map(([pcd, pconnm]) => ({ pcd, pconnm }));
    const csvOutput = stringify(data, { header: true, columns: ['pcd', 'pconnm'] });
    fs.writeFileSync(DICTIONARY_FILE, csvOutput, 'utf-8');
    console.log(`✅ postcodeDictionary.csv written with ${data.length} entries.`);
}
/**
 * STEP 2:
 * Load postcodeDictionary.csv into memory.
 */
export async function loadPostcodes() {
    if (isLoaded)
        return;
    console.log('📥 Loading postcodeDictionary.csv...');
    await new Promise((resolve, reject) => {
        fs.createReadStream(DICTIONARY_FILE)
            .pipe(csvParser())
            .on('data', (row) => {
            const key = row.pcd?.replace(/\s/g, '').trim().toUpperCase();
            if (key && row.pconnm) {
                postcodeMap.set(key, row.pconnm);
            }
        })
            .on('end', () => {
            console.log(`✅ Loaded ${postcodeMap.size} postcodes into memory.`);
            isLoaded = true;
            resolve();
        })
            .on('error', reject);
    });
}
/**
 * Postcode lookup function.
 */
export async function findConstituencyNameByPostcode(postcode) {
    await loadPostcodes();
    const cleaned = postcode.replace(/\s/g, '').trim().toUpperCase();
    return postcodeMap.get(cleaned) ?? '';
}
