const SearchBar = ({ value, onChange, placeholder = 'Search published posts' }) => (
  <label className="search-bar">
    <span className="search-icon" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="1.75" />
        <path d="M16.5 16.5 20 20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    </span>
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label="Search posts"
    />
  </label>
);

export default SearchBar;
