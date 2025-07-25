import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { encode, decode } from '@msgpack/msgpack';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const postcodeMap = new Map();
let isLoaded = false;
const RAW_CSV_FILES = [
    path.join(__dirname, '../postcode_constituency_files/pcd_pcon_uk_lu_may_24-1.csv'),
    path.join(__dirname, '../postcode_constituency_files/pcd_pcon_uk_lu_may_24-2.csv')
];
const DICTIONARY_FILE = path.join(__dirname, '../postcode_constituency_files/postcodeDictionary.msgpack');
/**
 * STEP 1:
 * Build a compact binary postcode dictionary using MessagePack.
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
    const obj = Object.fromEntries(map.entries());
    const buf = encode(obj);
    fs.writeFileSync(DICTIONARY_FILE, buf);
    console.log(`✅ postcodeDictionary.msgpack written with ${map.size} entries.`);
}
/**
 * STEP 2:
 * Load the postcode dictionary from MessagePack binary file into memory.
 */
export async function loadPostcodes() {
    if (isLoaded)
        return;
    console.log('📥 Loading postcodeDictionary.msgpack...');
    try {
        const buf = fs.readFileSync(DICTIONARY_FILE);
        const dictionary = decode(buf);
        for (const [pcd, pconnm] of Object.entries(dictionary)) {
            postcodeMap.set(pcd, pconnm);
        }
        console.log(`✅ Loaded ${postcodeMap.size} postcodes into memory.`);
        isLoaded = true;
    }
    catch (err) {
        console.error('❌ Failed to load postcode dictionary:', err);
        throw err;
    }
}
/**
 * Postcode lookup function.
 */
export async function findConstituencyNameByPostcode(postcode) {
    await loadPostcodes();
    const cleaned = postcode.replace(/\s/g, '').trim().toUpperCase();
    return postcodeMap.get(cleaned) ?? '';
}
