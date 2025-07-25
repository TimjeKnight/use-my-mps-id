import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// In-memory lookup map
const postcodeMap = new Map();
let isLoaded = false;
// Load CSVs once, async
async function loadPostcodes() {
    if (isLoaded)
        return;
    const files = [
        path.join(__dirname, '../postcode_constituency_files/pcd_pcon_uk_lu_may_24-1.csv'),
        path.join(__dirname, '../postcode_constituency_files/pcd_pcon_uk_lu_may_24-2.csv')
    ];
    console.log('📂 Loading postcode data from:');
    files.forEach(f => console.log(' -', f));
    const loadFile = (filePath) => {
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (row) => {
                const key = row.pcd?.replace(/\s/g, '').trim().toUpperCase(); // remove all spaces
                if (!key) {
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
    }
    catch (err) {
        console.error('❌ Failed to load postcode files:', err);
        throw err;
    }
}
export async function findConstituencyNameByPostcode(postcode) {
    await loadPostcodes();
    const cleanedPostcode = postcode.trim().toUpperCase();
    const result = postcodeMap.get(cleanedPostcode);
    return result ?? '';
}
