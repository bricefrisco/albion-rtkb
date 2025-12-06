import pb from '../lib/pocketbase'

// Transform PocketBase record to our app's kill format
function transformKill(record) {
  return {
    id: record.id,
    eventId: record.event_id,
    killer: {
      name: record.killer_name,
      guild: record.killer_guild || null,
      alliance: record.killer_alliance || null,
      weapon: record.killer_weapon || 'Unknown',
      averageIP: record.killer_ip || 0,
    },
    victim: {
      name: record.victim_name,
      guild: record.victim_guild || null,
      alliance: record.victim_alliance || null,
      weapon: record.victim_weapon || 'Unknown',
      averageIP: record.victim_ip || 0,
    },
    participantCount: record.participant_count || 1,
    fame: record.fame || 0,
    timestamp: new Date(record.timestamp).getTime(),
  }
}

// Build filter string from search params (uses "starts with" for index efficiency)
function buildFilter(searchType, searchQuery) {
  if (!searchQuery || !searchQuery.trim()) return ''
  
  const query = searchQuery.trim()
  
  switch (searchType) {
    case 'player':
      return `killer_name ?~ "${query}%" || victim_name ?~ "${query}%"`
    case 'guild':
      return `killer_guild ?~ "${query}%" || victim_guild ?~ "${query}%"`
    case 'alliance':
      return `killer_alliance ?~ "${query}%" || victim_alliance ?~ "${query}%"`
    default:
      return `killer_guild ?~ "${query}%" || victim_guild ?~ "${query}%"`
  }
}

// Fetch initial kills with optional filters
export async function fetchKills({ searchType, searchQuery, limit = 50 } = {}) {
  const filter = buildFilter(searchType, searchQuery)

  const records = await pb.collection('kills').getList(1, limit, {
    sort: '-timestamp',
    filter: filter || undefined,
    requestKey: null, // Disable auto-cancellation
  })

  return records.items.map(transformKill)
}

// Subscribe to real-time kill updates with optional filter
export async function subscribeToKills(callback, { searchType, searchQuery } = {}) {
  const filter = buildFilter(searchType, searchQuery)
  
  const subscribeOptions = filter ? { filter } : undefined

  // First unsubscribe from any existing subscription
  await pb.collection('kills').unsubscribe('*')

  // Then create new subscription
  await pb.collection('kills').subscribe('*', (e) => {
    if (e.action === 'create') {
      callback({
        action: 'create',
        kill: transformKill(e.record),
      })
    } else if (e.action === 'update') {
      callback({
        action: 'update',
        kill: transformKill(e.record),
      })
    } else if (e.action === 'delete') {
      callback({
        action: 'delete',
        killId: e.record.id,
      })
    }
  }, subscribeOptions)

  // Return unsubscribe function
  return () => {
    pb.collection('kills').unsubscribe('*')
  }
}
