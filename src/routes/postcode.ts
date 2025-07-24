import express from 'express';
import { findConstituencyNameByPostcode } from '../services/csvService.js';
import { getMpByConstituency } from '../services/parliament.js';

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

    const mpId = await getMpByConstituency(constituencyName);
    res.json(mpId);

  } catch (err) {
    res.status(500).send('Error reading CSV file');
  }
});

function formatPostcode(input: string): string | null {
  const raw = input.trim().toUpperCase();

  if (raw.length < 5 || raw.length > 7) {
    return null;
  }

  // Split into outward and inward codes (rightmost 3 are always inward)
  const inward = raw.slice(-3);
  const outward = raw.slice(0, raw.length - 3);

  // Now insert spaces between outward and inward
  const padded = outward.padEnd(4, ' ') + inward;

  return padded;
}

export default router;