import { useState } from 'react';
import './App.css';

function App() {
  const [postcode, setPostcode] = useState('');
  const [mpInfo, setMpInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMpInfo(null);

    try {
      const response = await fetch(`/postcode/${encodeURIComponent(postcode.replace(" ", ""))}`);
      if (!response.ok) throw new Error('MP not found for that postcode.');

      const data = await response.json();
      setMpInfo(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h3>Shall we see what your local MP's driving licence might look like?</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="postcode">Please enter your UK postcode:</label><br />
        <input
          id="postcode"
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="e.g. SW1A 1AA"
          style={{ marginTop: '0.5rem', padding: '0.5rem', width: '250px' }}
        />
        <br /><br />
        <button type="submit" disabled={loading}>
          {loading ? 'Finding...' : 'Submit'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {mpInfo && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Your MP</h2>
          <p><strong>Name:</strong> {mpInfo.name}</p>
          <p><strong>Party:</strong> {mpInfo.partyName}</p>
          <p><strong>Constituency:</strong> {mpInfo.constituencyName}</p>
          {mpInfo.thumbnailUrl && (
            <img src={mpInfo.thumbnailUrl} alt={`${mpInfo.name}`} width="150" />
          )}
          <img src={mpInfo.mockDriversLicenceLocation} alt={`${mpInfo.name}`} width="600" />
        </div>
      )}

      <a href="https://www.buymeacoffee.com/timje" target="_blank" className="buy-me-a-coffee" rel="noopener noreferrer">
        <img
          src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
          alt="Buy Me A Coffee"
          style={{ height: '60px', width: '217px' }}
        />
      </a>
    </div>
  );
}

export default App;