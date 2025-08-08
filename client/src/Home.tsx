import { useState } from 'react';
import './App.css';

function App() {
  const [postcode, setPostcode] = useState('');
  const [mpInfo, setMpInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAIDelayMsg, setShowAIDelayMsg] = useState(false);

  const fetchMPInfo = async (postcode: string): Promise<any> => {
    const response = await fetch(`/postcode/${encodeURIComponent(postcode.replace(' ', ''))}`);
    if (!response.ok) throw new Error('MP not found for that postcode.');
    return await response.json();
  };

  const fetchRandomMP = async (): Promise<any> => {
    const response = await fetch('/parliament/randommp');
    if (!response.ok) throw new Error('Couldn’t fetch a random MP.');
    return await response.json();
  };

  const startLoading = () => {
    setLoading(true);
    setError('');
    setMpInfo(null);
    setShowAIDelayMsg(false);
    const timeoutId = setTimeout(() => setShowAIDelayMsg(true), 4000);
    return timeoutId;
  };

  const finishLoading = (timeoutId: number) => {
    clearTimeout(timeoutId);
    setLoading(false);
    setShowAIDelayMsg(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const timeoutId = startLoading();

    try {
      let data;
      try {
        data = await fetchMPInfo(postcode);
      } catch {
        // Retry silently once if it fails
        data = await fetchMPInfo(postcode);
      }
      setMpInfo(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      finishLoading(timeoutId as unknown as number);
    }
  };

  const handleLucky = async () => {
    const timeoutId = startLoading();

    try {
      let data;
      try {
        data = await fetchRandomMP();
      } catch {
        // Retry silently once if it fails
        data = await fetchRandomMP();
      }
      setMpInfo(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      finishLoading(timeoutId as unknown as number);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h3>Shall we see what your local MP&apos;s driving licence might look like?</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="postcode">Please enter a UK postcode:</label><br />
        <input
          id="postcode"
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="e.g. SW1A 1AA"
          style={{ marginTop: '0.5rem', padding: '0.5rem', width: '250px' }}
          disabled={loading}
        />
        <br /><br />
<button
  type="submit"
  disabled={loading || postcode.trim() === ''}
  style={{ marginRight: '0.5rem' }}
>
  {loading ? 'Finding...' : 'Submit'}
</button>
        <button type="button" onClick={handleLucky} disabled={loading}>
          {loading ? 'Finding...' : "I'm feeling lucky"}
        </button>
      </form>

      {showAIDelayMsg && (
        <p style={{ marginTop: '1rem', fontStyle: 'italic', color: '#444' }}>
          Please hang on – I&apos;m building a new ID for this MP using AI. This might take about a minute.
        </p>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {mpInfo && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Your MP</h2>
          <p><strong>Name:</strong> {mpInfo.name}</p>
          <p><strong>Party:</strong> {mpInfo.partyName}</p>
          <p><strong>Constituency:</strong> {mpInfo.constituencyName}</p>
          {mpInfo.thumbnailUrl && (
            <img src={mpInfo.thumbnailUrl} alt={`${mpInfo.name}`} className="thumbnail" />
          )}
          <img src={mpInfo.mockDriversLicenceLocation} alt={`${mpInfo.name}`} className="drivingLicence" />
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
