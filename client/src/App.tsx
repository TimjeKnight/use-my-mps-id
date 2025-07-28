// App.tsx
import { Routes, Route, useNavigate } from 'react-router-dom';
import Faq from './Faq';
import Home from './Home'; // rename your current main content to Home.tsx

function App() {
  const navigate = useNavigate();

  return (
    <>
          <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          padding: '0.5rem 1rem',
          zIndex: 1000,
        }}
      >HOME
      </button>
      <button
        onClick={() => navigate('/faq')}
        style={{
          position: 'fixed',
          top: '3rem',
          left: '1rem',
          padding: '0.5rem 1rem',
          zIndex: 1000,
        }}
      >
        FAQ
      </button>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/faq" element={<Faq />} />
      </Routes>
    </>
  );
}

export default App;
