// routes/parliament.ts
import express from 'express';
import { getRandomMember } from '../services/parliament.js';
import { generateMockDriversLicense } from '../services/ai.js';

const router = express.Router();

router.get('/randommp', async (req, res) => {
  try {
    const representative = await getRandomMember();

    if (!representative) {
      res.status(404).send('No random MP found');
      return;      
    }
    //var result = await generateMockPassportPhoto(representative);
    var result = await generateMockDriversLicense(representative);
    //res.json(result);
    representative.mockDriversLicenceLocation = result;

    res.json(representative);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching random MP');
  }
});

export default router;