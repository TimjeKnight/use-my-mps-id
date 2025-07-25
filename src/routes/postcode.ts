import express from 'express';
import { findConstituencyNameByPostcode } from '../services/csvService.js';
import { getMpByConstituency } from '../services/parliament.js';
import { generateMockDriversLicense, generateMockPassportPhoto } from '../services/ai.js';

const router = express.Router();

router.get('/:postcode', async (req, res) => {
  try {
    let postcode = formatPostcode(req.params.postcode);
    if(!postcode){
      res.status(404).send('Not a valid postcode');
      return;
    }

    const constituencyName = await findConstituencyNameByPostcode(postcode);

    if (!constituencyName) {
      res.status(404).send('Constituency not found');
      return;      
    }

    const representative = await getMpByConstituency(constituencyName);
    
    if (!representative) {
      res.status(404).send('Representative not found');
      return;      
    }
    //var result = await generateMockPassportPhoto(representative);
    var result = await generateMockDriversLicense(representative);
    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).send('Error somewhere generating the ID');
  }
});

function formatPostcode(input: string): string | null {
  const raw = input.trim().toUpperCase();

  if (raw.length < 5 || raw.length > 7) {
    return null;
  }

  return raw;
}

export default router;