import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * reads postcode csv and
 */
export function findConstituencyNameByPostcode(postcode) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, '../../postcode_constituency_files/pcd_pcon_uk_lu_may_24-1.csv');
        console.log(filePath);
        let foundPostcode = null;
        console.log(postcode);
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
            if (row.pcd === postcode) {
                foundPostcode = row;
            }
        })
            .on('end', () => {
            var constituencyName = (foundPostcode?.pconnm ?? null) || "";
            const trimmed = constituencyName.replace(/^"|"$/g, '');
            console.log(trimmed); // Hello World        
            resolve(trimmed);
        })
            .on('error', (err) => {
            reject(err);
        });
    });
}
