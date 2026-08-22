import { getCategoryInfo } from '../constants/categories';

function EntryTable({ entries, onSelectEntry, onEntriesChange }) {
  return (
    <div className="entry-table">
      {entries.map((entry) => {
        const categoryInfo = getCategoryInfo(entry.category);

        return (
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

            <div className="entry-category-cell">
              {categoryInfo && (
                <span
                  className="category-badge"
                  style={{
                    '--category-bg': `var(${categoryInfo.bgVar})`,
                    '--category-color': `var(${categoryInfo.colorVar})`,
                  }}
                >
                  {entry.category}
                </span>
              )}
            </div>

            <button
              type="button"
              className={`favorite-button${entry.favorite ? ' active' : ''}`}
              onClick={async (e) => {
                e.stopPropagation();

                const result = await window.pywebview.api.toggle_favorite(
                  entry.id,
                );

                if (result.success) {
                  onEntriesChange(result.entries);
                }
              }}
              aria-label={
                entry.favorite ? 'Remove from favorites' : 'Add to favorites'
              }
            >
              {entry.favorite ? '★' : '☆'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default EntryTable;
