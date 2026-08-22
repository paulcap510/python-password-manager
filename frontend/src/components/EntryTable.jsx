import { getCategoryInfo } from '../constants/categories';

function EntryTable({ entries, onSelectEntry }) {
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
              className="button-secondary button-sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelectEntry(entry);
              }}
            >
              View
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default EntryTable;
