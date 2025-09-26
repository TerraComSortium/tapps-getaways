function SearchIcon({ sizes }) {
  return (
    <svg width={sizes} height={sizes} viewBox="0 0 24 24">
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <circle cx="10" cy="10" r="7" />
        <path d="m15 15l6 6" />
      </g>
    </svg>
  );
}

export default SearchIcon;
