const CATEGORIES = [
  { name: 'Work', colorVar: '--work' },
  { name: 'Personal', colorVar: '--personal' },
  { name: 'Finance', colorVar: '--finance' },
  { name: 'Secure Notes', colorVar: '--notes' },
];

function SidebarNav({ onLock }) {
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
                  className="category-dot"
                  style={{ background: `var(${category.colorVar})` }}
                  aria-hidden="true"
                />
                {category.name}
              </span>
              <span className="category-count">0</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <button type="button" className="nav-item">
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
