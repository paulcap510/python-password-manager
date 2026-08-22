import { CATEGORIES } from '../constants/categories';

function SidebarNav({
  entries = [],
  onLock,
  activeFilter,
  onFilterChange,
  onOpenOverview,
  overviewActive,
  onOpenSettings,
  settingsActive,
}) {
  return (
    <nav className="sidebar-nav card">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" aria-hidden="true">
          🔒
        </div>

        <h1>Password Vault</h1>
      </div>

      <div className="sidebar-nav-list">
        <button
          type="button"
          className={`nav-item${overviewActive ? ' active' : ''}`}
          onClick={onOpenOverview}
          aria-pressed={overviewActive}
        >
          <span aria-hidden="true">🏠</span> Overview
        </button>

        <button
          type="button"
          className={`nav-item${activeFilter === 'all' ? ' active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          <span aria-hidden="true">🗂️</span> All
        </button>

        <button
          type="button"
          className={`nav-item${activeFilter === 'favorites' ? ' active' : ''}`}
          onClick={() => onFilterChange('favorites')}
        >
          <span aria-hidden="true">⭐</span> Favorites
        </button>
      </div>

      <div className="sidebar-categories">
        <div className="sidebar-section-label">Categories</div>

        <div className="sidebar-categories-list">
          {CATEGORIES.map((category) => {
            const count = entries.filter(
              (entry) => entry.category === category.name,
            ).length;

            return (
              <button
                key={category.name}
                type="button"
                className={`category-item${
                  activeFilter === category.name ? ' active' : ''
                }`}
                onClick={() => onFilterChange(category.name)}
              >
                <span className="category-item-label">
                  <span
                    className="category-icon-box"
                    style={{
                      '--category-bg': `var(${category.bgVar})`,
                      '--category-color': `var(${category.colorVar})`,
                    }}
                    aria-hidden="true"
                  >
                    {category.icon}
                  </span>

                  {category.name}
                </span>

                <span className="category-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sidebar-footer">
        <button
          type="button"
          className={`nav-item${settingsActive ? ' active' : ''}`}
          onClick={onOpenSettings}
          aria-pressed={settingsActive}
        >
          <span aria-hidden="true">⚙️</span> Settings
        </button>

        <button type="button" className="nav-item" onClick={onLock}>
          <span aria-hidden="true">🔒</span> Lock Vault
        </button>
      </div>
    </nav>
  );
}

export default SidebarNav;
