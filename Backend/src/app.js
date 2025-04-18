import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [server, setServer] = useState('s1.sfgame.pl');
  const [character, setCharacter] = useState(null);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:3000/api/login', {
        username,
        password,
        server,
      });
      setCharacter(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Nie udało się zalogować 😢');
      setCharacter(null);
    }
  };
  
  const ssoRoute = require('./routes/sso');
app.use('/api/sso', ssoRoute);


  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>SFGame Bot</h1>

      <div style={{ marginBottom: '1rem' }}>
        <input
          placeholder="Login"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <input
          placeholder="Hasło"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <input
          placeholder="Serwer"
          value={server}
          onChange={(e) => setServer(e.target.value)}
        />
      </div>

      <button onClick={handleLogin}>Zaloguj</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {character && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Postać:</h2>
          <pre>{JSON.stringify(character, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
