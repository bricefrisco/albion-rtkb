const killerNames = [
  "ShadowBlade", "TankMaster", "FrostMage", "DeathKnight", "ArcherPro",
  "NatureLord", "DaggerMaster", "AxeWarrior", "CrossbowKing", "HolyPaladin",
  "FireWizard", "IceQueen", "DarkAssassin", "SteelGuard", "SwiftArrow",
  "ThunderStrike", "VenomBlade", "IronFist", "SilentKiller", "BladeDancer"
]

const victimNames = [
  "GatherBoi", "Noobslayer99", "RunningMan", "HolyHealer", "SlowPoke",
  "FireStarter", "TransportGuy", "Fisherman42", "NewPlayer123", "LostSoul",
  "EasyTarget", "AFKPlayer", "CraftMaster", "ResourceKing", "TravellerX",
  "FarmingDude", "SoloGatherer", "UnluckyOne", "WrongPlace", "Dismounted"
]

const weapons = [
  "Bloodletter", "Grovekeeper", "Icicle Staff", "Cursed Staff", "Wailing Bow",
  "Rampant Staff", "Deathgivers", "Bear Paws", "Siegebow", "Great Holy Staff",
  "Blazing Staff", "Claymore", "Great Hammer", "Carving Sword", "Dagger Pair",
  "Longbow", "Crossbow", "Quarterstaff", "Black Hands", "Kingmaker"
]

const gatheringTools = [
  "Harvesting Sickle", "Skinning Knife", "Pickaxe", "Wood Axe", "Fishing Rod",
  "Stone Hammer", "Ox", "Transport Mammoth", "Gathering Bag", "Fiber Cape"
]

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomIP(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

function randomFame() {
  return Math.floor(Math.random() * 250000) + 10000
}

export function generateMockKills(offset, count) {
  // Simulate end of data after 50 kills
  if (offset >= 50) return []
  
  const actualCount = Math.min(count, 50 - offset)
  const kills = []

  for (let i = 0; i < actualCount; i++) {
    const id = offset + i + 1
    const minutesAgo = offset + i * 3 + Math.floor(Math.random() * 5)
    
    kills.push({
      id,
      killer: {
        name: randomFrom(killerNames),
        weapon: randomFrom(weapons),
        averageIP: randomIP(1200, 1600),
      },
      victim: {
        name: randomFrom(victimNames),
        weapon: Math.random() > 0.3 ? randomFrom(weapons) : randomFrom(gatheringTools),
        averageIP: randomIP(800, 1400),
      },
      fame: randomFame(),
      timestamp: Date.now() - 1000 * 60 * minutesAgo,
    })
  }

  return kills
}

// Generate a single new kill (for real-time updates)
export function generateNewKill(id) {
  return {
    id,
    killer: {
      name: randomFrom(killerNames),
      weapon: randomFrom(weapons),
      averageIP: randomIP(1200, 1600),
    },
    victim: {
      name: randomFrom(victimNames),
      weapon: Math.random() > 0.3 ? randomFrom(weapons) : randomFrom(gatheringTools),
      averageIP: randomIP(800, 1400),
    },
    fame: randomFame(),
    timestamp: Date.now(), // Just happened!
  }
}

// Keep the static export for backwards compatibility
export const mockKills = generateMockKills(0, 9)
