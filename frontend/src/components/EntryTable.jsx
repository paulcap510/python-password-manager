// Row-level actions call the same pywebview APIs RightSideBar.jsx uses for
// editing/deleting, so entries/output stay in sync however the action was
// triggered. Password value/reveal/copy is deliberately NOT here — this row
// is a compact summary; the full detail (including the password) still
// lives in RightSideBar.jsx once an entry is selected.
function EntryTable({ entries, onSelectEntry, onEditEntry, onEntriesChange, onOutput }) {
  const handleDelete = async (e, entry) => {
    e.stopPropagation();
    const result = await window.pywebview.api.delete_entry(entry.id);
    onOutput(result.message);
    onEntriesChange(result.entries);
  };

  return (
    <div className="entry-table">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="entry-row"
          onClick={() => onSelectEntry(entry)}
        >
          <div className="entry-info-cell">
            <div className="entry-icon">
              {entry.site.charAt(0).toUpperCase()}
            </div>
            <div className="entry-info-text">
              <div className="entry-site">{entry.site}</div>
              <div className="entry-username">{entry.username}</div>
            </div>
          </div>
          <div className="entry-actions">
            <button
              type="button"
              className="button-secondary button-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditEntry(entry);
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="button-danger button-sm"
              onClick={(e) => handleDelete(e, entry)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default EntryTable;
