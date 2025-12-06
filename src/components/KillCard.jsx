function KillCard({ kill, isNew }) {
  const { killer, victim, fame, timestamp } = kill

  return (
    <div className={`bg-zinc-900 border rounded-lg p-4 transition-all duration-500 ${
      isNew 
        ? 'border-amber-500/50 shadow-lg shadow-amber-500/10 animate-slide-in' 
        : 'border-zinc-800 hover:border-zinc-700'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-zinc-500">{formatTime(timestamp)}</span>
        <span className="text-xs font-medium text-amber-500">+{fame.toLocaleString()} Fame</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Killer */}
        <div className="flex-1 text-center">
          <div className="w-16 h-16 mx-auto mb-2 rounded overflow-hidden">
            <img 
              src={`https://render.albiononline.com/v1/item/${killer.weapon}.png`}
              alt={killer.weapon}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm font-medium text-zinc-100 truncate">{killer.name}</p>
          <p className="text-xs text-zinc-500 truncate h-4">
            <GuildDisplay alliance={killer.alliance} guild={killer.guild} />
          </p>
          <p className="text-xs text-zinc-500 mt-1">{Math.round(killer.averageIP)} IP</p>
          <p className="text-xs text-emerald-500 font-medium mt-1">Killer</p>
        </div>

        {/* VS Divider */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-6 bg-zinc-800"></div>
          <span className="text-xs text-zinc-600 font-bold">VS</span>
          <div className="w-px h-6 bg-zinc-800"></div>
        </div>

        {/* Victim */}
        <div className="flex-1 text-center">
          <div className="w-16 h-16 mx-auto mb-2 rounded overflow-hidden">
            <img 
              src={`https://render.albiononline.com/v1/item/${victim.weapon}.png`}
              alt={victim.weapon}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm font-medium text-zinc-100 truncate">{victim.name}</p>
          <p className="text-xs text-zinc-500 truncate h-4">
            <GuildDisplay alliance={victim.alliance} guild={victim.guild} />
          </p>
          <p className="text-xs text-zinc-500 mt-1">{Math.round(victim.averageIP)} IP</p>
          <p className="text-xs text-red-500 font-medium mt-1">Victim</p>
        </div>
      </div>
    </div>
  )
}

function GuildDisplay({ alliance, guild }) {
  if (!guild && !alliance) return null
  
  return (
    <>
      {alliance && <span className="text-zinc-400">[{alliance}]</span>}
      {alliance && guild && ' '}
      {guild && <span>{guild}</span>}
    </>
  )
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return date.toLocaleDateString()
}

export default KillCard
