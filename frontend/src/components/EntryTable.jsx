import { useState } from 'react';
import { copyToClipboard } from '../utils/clipboard';

function EntryTable({ entries, onEntriesChange }) {
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [revealedPasswordId, setRevealedPasswordId] = useState(null);
  const [editSite, setEditSite] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const startEdit = (entry) => {
    setEditingEntryId(entry.id);
    setEditSite(entry.site);
    setEditUsername(entry.username);
    setEditPassword(entry.password);
  };

  const cancelEdit = () => {
    setEditingEntryId(null);
  };

  const saveEdit = async (entry) => {
    const result = await window.pywebview.api.edit_entry(
      entry.id,
      editSite,
      editUsername,
      editPassword,
    );
    setEditingEntryId(null);
    onEntriesChange(result.entries);
  };

  const deleteEntry = async (entry) => {
    const result = await window.pywebview.api.delete_entry(entry.id);
    onEntriesChange(result.entries);
  };

  const toggleReveal = (entry) => {
    setRevealedPasswordId(revealedPasswordId === entry.id ? null : entry.id);
  };

  return (
    <table>
      <tbody>
        <tr>
          <th>Site</th>
          <th>Username</th>
          <th>Password</th>
          <th>Actions</th>
        </tr>

        {entries.map((entry) => {
          if (editingEntryId === entry.id) {
            return (
              <tr key={entry.id}>
                <td>
                  <input
                    value={editSite}
                    onChange={(e) => setEditSite(e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                  />
                </td>
                <td>
                  <button type="button" onClick={() => saveEdit(entry)}>
                    Save
                  </button>
                  <button type="button" onClick={cancelEdit}>
                    Cancel
                  </button>
                </td>
              </tr>
            );
          }

          const isRevealed = revealedPasswordId === entry.id;

          return (
            <tr key={entry.id}>
              <td>{entry.site}</td>
              <td>
                {entry.username}
                <button
                  type="button"
                  onClick={() => copyToClipboard(entry.username)}
                >
                  📋
                </button>
              </td>
              <td>
                {isRevealed ? entry.password : '••••••••'}
                <button type="button" onClick={() => toggleReveal(entry)}>
                  {isRevealed ? '🙈' : '👁️'}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(entry.password)}
                >
                  📋
                </button>
              </td>
              <td>
                <button type="button" onClick={() => startEdit(entry)}>
                  Edit
                </button>
                <button type="button" onClick={() => deleteEntry(entry)}>
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default EntryTable;
