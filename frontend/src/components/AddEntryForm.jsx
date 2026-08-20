import { useState } from 'react';

const STRENGTH_LABELS = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

function AddEntryForm({ entries, onEntriesChange, onOutput }) {
  const [site, setSite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);

  const isDuplicate = entries.some(
    (entry) => entry.site === site && entry.username === username && site !== '',
  );

  const checkPasswordStrength = async (value) => {
    const result = await window.pywebview.api.check_password_strength(value);
    setPasswordStrength(
      value
        ? `${STRENGTH_LABELS[result.score]}${result.feedback ? ' — ' + result.feedback : ''}`
        : '',
    );
  };

  const handlePasswordChange = async (e) => {
    const value = e.target.value;
    setPassword(value);
    await checkPasswordStrength(value);
  };

  const handleAddEntry = async () => {
    const result = await window.pywebview.api.add_entry(site, username, password);
    onOutput(result.message);
    onEntriesChange(result.entries);
  };

  const handleGeneratePassword = async () => {
    const result = await window.pywebview.api.generate_password();
    setGeneratedPassword(result.password);
    setShowGeneratedPassword(true);
  };

  const handleUseGenerated = async () => {
    setPassword(generatedPassword);
    await checkPasswordStrength(generatedPassword);
    setShowGeneratedPassword(false);
  };

  return (
    <>
      <h2>Add New Entry</h2>
      <div>
        <label htmlFor="entry-site">Site:</label>
        <input
          type="text"
          id="entry-site"
          placeholder="e.g. gmail.com"
          value={site}
          onChange={(e) => setSite(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="entry-username">Username:</label>
        <input
          type="text"
          id="entry-username"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="entry-password">Password:</label>
        <input
          type="password"
          id="entry-password"
          placeholder="password"
          value={password}
          onChange={handlePasswordChange}
        />
        <button type="button" onClick={handleGeneratePassword}>
          Generate Password
        </button>
        <p id="passwordStrength">{passwordStrength}</p>
      </div>

      {showGeneratedPassword && (
        <div id="generatedPasswordDisplay">
          <span id="generatedPasswordText">{generatedPassword}</span>
          <button type="button" onClick={handleUseGenerated}>
            Use This
          </button>
        </div>
      )}

      <button type="button" onClick={handleAddEntry}>
        Add Entry
      </button>
      <p id="duplicateWarning" style={{ color: 'red' }}>
        {isDuplicate ? 'An entry for this site and username already exists' : ''}
      </p>
    </>
  );
}

export default AddEntryForm;
