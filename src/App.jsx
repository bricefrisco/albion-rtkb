import { useState, useEffect, useRef, useCallback } from 'react'
import KillCard from './components/KillCard'
import SearchBar from './components/SearchBar'
import { fetchKills, subscribeToKills } from './services/killsService'

const KILLS_PER_PAGE = 50
const MAX_KILLS = 100

// Helper to deduplicate kills by ID
function dedupeKills(kills) {
  const seen = new Set()
  return kills.filter(kill => {
    if (seen.has(kill.id)) return false
    seen.add(kill.id)
    return true
  })
}

function App() {
  // Input state (what the user is typing)
  const [searchInput, setSearchInput] = useState('')
  const [searchType, setSearchType] = useState('guild')
  
  // Applied filter state (what's actually being filtered)
  const [appliedFilter, setAppliedFilter] = useState({ query: '', type: 'guild' })
  const [refreshKey, setRefreshKey] = useState(0)
  
  const [kills, setKills] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [newKillIds, setNewKillIds] = useState(new Set())
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [secondsAgo, setSecondsAgo] = useState(0)
  const loaderRef = useRef(null)

  const isFiltered = appliedFilter.query.trim() !== ''
  const inputMatchesFilter = isFiltered && 
    searchInput.trim().toLowerCase() === appliedFilter.query.toLowerCase() && 
    searchType === appliedFilter.type

  // Fetch kills based on applied filter
  const loadKills = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const fetchedKills = await fetchKills({
        searchType: appliedFilter.type,
        searchQuery: appliedFilter.query,
        limit: KILLS_PER_PAGE,
      })
      
      setKills(dedupeKills(fetchedKills))
      setLastUpdated(Date.now())
      setSecondsAgo(0)
      setHasMore(fetchedKills.length >= KILLS_PER_PAGE && fetchedKills.length < MAX_KILLS)
    } catch (err) {
      console.error('Failed to fetch kills:', err)
      setError('Failed to load kills.')
    } finally {
      setLoading(false)
    }
  }, [appliedFilter, refreshKey])

  // Load when applied filter changes
  useEffect(() => {
    loadKills()
  }, [loadKills])

  // Real-time subscription - restarts when filter changes (filter applied at PocketBase level)
  useEffect(() => {
    let isMounted = true
    
    const setupSubscription = async () => {
      const unsubscribe = await subscribeToKills(
        (event) => {
          if (!isMounted) return
          
          if (event.action === 'create') {
            const newKill = event.kill
            
            // Add to the top, respecting MAX_KILLS (dedupe to prevent duplicates)
            setKills(prev => {
              // Check if kill already exists
              if (prev.some(k => k.id === newKill.id)) {
                return prev
              }
              
              const updated = dedupeKills([newKill, ...prev]).slice(0, MAX_KILLS)
              
              // Only trigger animation if we actually added it
              if (updated[0]?.id === newKill.id) {
                setNewKillIds(p => new Set([...p, newKill.id]))
                setLastUpdated(Date.now())
                setSecondsAgo(0)
                
                // Remove "new" status after animation
                setTimeout(() => {
                  setNewKillIds(p => {
                    const next = new Set(p)
                    next.delete(newKill.id)
                    return next
                  })
                }, 1000)
              }
              
              return updated
            })
          } else if (event.action === 'update') {
            setKills(prev => prev.map(k => k.id === event.kill.id ? event.kill : k))
          } else if (event.action === 'delete') {
            setKills(prev => prev.filter(k => k.id !== event.killId))
          }
        },
        { searchType: appliedFilter.type, searchQuery: appliedFilter.query }
      )
      
      return unsubscribe
    }
    
    setupSubscription()

    return () => {
      isMounted = false
    }
  }, [appliedFilter])

  // Update "seconds ago" counter
  useEffect(() => {
    if (!lastUpdated) return
    
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [lastUpdated])

  // Load more for infinite scroll
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || error || kills.length >= MAX_KILLS) {
      if (kills.length >= MAX_KILLS) setHasMore(false)
      return
    }
    
    try {
      setLoading(true)
      const remainingSlots = MAX_KILLS - kills.length
      const fetchCount = Math.min(KILLS_PER_PAGE, remainingSlots)
      
      const moreKills = await fetchKills({
        searchType: appliedFilter.type,
        searchQuery: appliedFilter.query,
        limit: kills.length + fetchCount,
      })
      
      // Get only the new kills we don't have yet
      const existingIds = new Set(kills.map(k => k.id))
      const newKills = moreKills.filter(k => !existingIds.has(k.id))
      
      if (newKills.length === 0 || kills.length + newKills.length >= MAX_KILLS) {
        setHasMore(false)
      }
      
      if (newKills.length > 0) {
        setKills(prev => dedupeKills([...prev, ...newKills]).slice(0, MAX_KILLS))
      }
    } catch (err) {
      console.error('Failed to load more kills:', err)
      setError('Failed to load kills.')
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [kills, loading, hasMore, error, appliedFilter])

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !error) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore, hasMore, loading, error])

  // Apply search filter
  const handleSearch = () => {
    if (searchInput.trim()) {
      setAppliedFilter({ query: searchInput.trim(), type: searchType })
      setRefreshKey(k => k + 1)
      setHasMore(true)
    }
  }

  // Clear search filter
  const handleClear = () => {
    setSearchInput('')
    setAppliedFilter({ query: '', type: 'guild' })
    setRefreshKey(k => k + 1)
    setHasMore(true)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 mb-2">
            Albion <span className="text-amber-500">Realtime Killboard</span>
          </h1>
          <p className="text-zinc-500 text-sm">Updates automatically, no need to refresh!</p>
          {lastUpdated && (
            <p className="text-zinc-600 text-xs mt-2">
              Last update: {secondsAgo < 1 ? 'just now' : `${secondsAgo} second${secondsAgo !== 1 ? 's' : ''} ago`}
            </p>
          )}
        </header>

        <SearchBar 
          value={searchInput} 
          onChange={setSearchInput}
          searchType={searchType}
          onSearchTypeChange={setSearchType}
          onSearch={handleSearch}
          onClear={handleClear}
          isFiltered={inputMatchesFilter}
        />

        {isFiltered && (
          <div className="max-w-xl mx-auto mt-4 text-center">
            <span className="text-sm text-zinc-500">
              Filtering by {appliedFilter.type}: <span className="text-amber-500">{appliedFilter.query}</span>
            </span>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto mt-8 p-4 bg-red-900/20 border border-red-800 rounded-lg text-center">
            <p className="text-red-400 mb-3">{error}</p>
            <button
              onClick={() => {
                setError(null)
                setHasMore(true)
                loadKills()
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {kills.map(kill => (
            <KillCard key={kill.id} kill={kill} isNew={newKillIds.has(kill.id)} />
          ))}
        </div>

        {kills.length === 0 && !loading && !error && (
          <p className="text-center text-zinc-600 mt-12">No kills found</p>
        )}

        {/* Infinite scroll loader */}
        <div ref={loaderRef} className="flex justify-center py-8">
          {loading && (
            <div className="flex items-center gap-2 text-zinc-500">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                  fill="none"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading kills...</span>
            </div>
          )}
          {!hasMore && kills.length > 0 && (
            <div className="text-center">
              <p className="text-zinc-600">All available or maximum results shown</p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="mt-2 text-sm text-amber-500 hover:text-amber-400 transition-colors"
              >
                ↑ Back to top
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
