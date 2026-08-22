import { useState, useEffect } from 'react';
import { CATEGORIES } from '../constants/categories';

const STRENGTH_LABELS = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

function AddEntryForm({ entries, onEntriesChange, onOutput, onSuccessClose }) {
  const [site, setSite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);
  const [defaultPasswordLength, setDefaultPasswordLength] = useState(16);
  const [category, setCategory] = useState('');

  useEffect(() => {
    window.pywebview.api.get_settings().then((settings) => {
      setDefaultPasswordLength(settings.default_password_length);
    });
  }, []);

  const isDuplicate = entries.some(
    (entry) =>
      entry.site === site && entry.username === username && site !== '',
  );

  const checkPasswordStrength = async (value) => {
    const result = await window.pywebview.api.check_password_strength(value);

    setPasswordStrength(
      value
        ? `${STRENGTH_LABELS[result.score]}${
            result.feedback ? ' — ' + result.feedback : ''
          }`
        : '',
    );
  };

  const handlePasswordChange = async (e) => {
    const value = e.target.value;
    setPassword(value);
    await checkPasswordStrength(value);
  };

  const handleAddEntry = async () => {
    const result = await window.pywebview.api.add_entry(
      site,
      username,
      password,
      category,
    );

    onOutput(result.message);
    onEntriesChange(result.entries);

    if (result.success) {
      setSite('');
      setUsername('');
      setPassword('');
      setCategory('');
      setPasswordStrength('');
      onSuccessClose?.();
    }
  };

  const handleGeneratePassword = async () => {
    const result = await window.pywebview.api.generate_password(
      defaultPasswordLength,
    );

    setGeneratedPassword(result.password);
    setShowGeneratedPassword(true);
  };

  const handleUseGenerated = async () => {
    setPassword(generatedPassword);
    await checkPasswordStrength(generatedPassword);
    setShowGeneratedPassword(false);
  };

  return (
    <div className="add-entry-form card">
      <h2>Add New Entry</h2>

      <div className="form-field">
        <label htmlFor="entry-site">Site:</label>

        <input
          type="text"
          id="entry-site"
          className="entry-input"
          placeholder="e.g. gmail.com"
          value={site}
          onChange={(e) => setSite(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="entry-username">Username:</label>

        <input
          type="text"
          id="entry-username"
          className="entry-input"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="entry-password">Password:</label>

        <div className="password-field-row">
          <input
            type="password"
            id="entry-password"
            className="entry-input"
            placeholder="password"
            value={password}
            onChange={handlePasswordChange}
          />

          <button
            type="button"
            className="button-secondary button-sm"
            onClick={handleGeneratePassword}
          >
            Generate Password
          </button>
        </div>

        <p id="passwordStrength" className="strength-feedback">
          {passwordStrength}
        </p>
      </div>

      <div className="form-field">
        <label htmlFor="entry-category">Category:</label>

        <select
          id="entry-category"
          className="entry-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select a category</option>

          {CATEGORIES.map((category) => (
            <option key={category.name} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {showGeneratedPassword && (
        <div id="generatedPasswordDisplay" className="generated-password-box">
          <span id="generatedPasswordText">{generatedPassword}</span>

          <button
            type="button"
            className="button-primary button-sm"
            onClick={handleUseGenerated}
          >
            Use This
          </button>
        </div>
      )}

      <button type="button" className="button-primary" onClick={handleAddEntry}>
        Add Entry
      </button>

      <p id="duplicateWarning" className="warning-text">
        {isDuplicate
          ? 'An entry for this site and username already exists'
          : ''}
      </p>
    </div>
  );
}

export default AddEntryForm;
