import { CATEGORIES } from '../constants/categories';

function SidebarNav({ onLock, onOpenSettings, settingsActive }) {
  return (
    <nav className="sidebar-nav card">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" aria-hidden="true">
          🔒
        </div>
        <h1>Password Vault</h1>
      </div>

      <div className="sidebar-nav-list">
        <button type="button" className="nav-item">
          <span aria-hidden="true">🏠</span> Overview
        </button>
        <button type="button" className="nav-item active">
          <span aria-hidden="true">🗂️</span> All
        </button>
        <button type="button" className="nav-item">
          <span aria-hidden="true">⭐</span> Favorites
        </button>
      </div>

      <div className="sidebar-categories">
        <div className="sidebar-section-label">Categories</div>
        <div className="sidebar-categories-list">
          {CATEGORIES.map((category) => (
            <div key={category.name} className="category-item">
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
              <span className="category-count">0</span>
            </div>
          ))}
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
