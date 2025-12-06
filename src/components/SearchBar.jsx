function SearchBar({ 
  value, 
  onChange, 
  searchType, 
  onSearchTypeChange, 
  onSearch, 
  onClear,
  hasActiveFilter,
  inputMatchesFilter
}) {
  const placeholders = {
    guild: "Search guild...",
    alliance: "Search alliance...",
    player: "Search player..."
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      onSearch()
    }
  }

  // Show Clear when: there's an active filter AND (input is empty OR matches the filter)
  // Show Search when: input has content that differs from the applied filter
  const showClear = hasActiveFilter && (!value.trim() || inputMatchesFilter)

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex gap-2">
        <select
          value={searchType}
          onChange={(e) => onSearchTypeChange(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-3 text-zinc-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23a1a1aa%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-8"
        >
          <option value="guild">Guild</option>
          <option value="alliance">Alliance</option>
          <option value="player">Player</option>
        </select>

        <div className="relative flex-1">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[searchType]}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
          />
        </div>

        {showClear ? (
          <button
            onClick={onClear}
            className="px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        ) : (
          <button
            onClick={onSearch}
            disabled={!value.trim()}
            className="px-4 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchBar
