import { Company } from './types';
import { EXTRA_COMPANIES } from './extraCompanies';

export const BASE_CUTE_COMPANIES: Company[] = [
  {
    id: 'fruit',
    ticker: 'FRUIT',
    name: 'Fruit Electronics',
    summary: 'Sells ultra-premium, paper-thin brushed aluminum rectangles. Users lines up for weeks to buy the exact same gadget with a slightly modified charging slot. Stable, high status.',
    category: 'Tech',
    basePrice: 150,
    volatility: 0.15,
    trend: 0.05,
    icon: '🍎'
  },
  {
    id: 'doge',
    ticker: 'DOGE',
    name: 'Doge Biscuit Corp',
    summary: 'A dog food startup that pivoted into a decentralized bone registry. Its value surges whenever a specific pet billionaire tweets a meme of a Shiba Inu. Highly volatile, pure vibes.',
    category: 'Meme',
    basePrice: 12,
    volatility: 0.75,
    trend: 0.02,
    icon: '🐕'
  },
  {
    id: 'cofe',
    ticker: 'COFE',
    name: 'Caf-Fiend Espresso',
    summary: 'Pioneered custom IV leaks of hyper-caffeinated syrup directly to corporate workspaces. Growth is constant, but risk is high due to decaf regulations and productivity health audits.',
    category: 'Food',
    basePrice: 45,
    volatility: 0.25,
    trend: 0.08,
    icon: '☕'
  },
  {
    id: 'yolo',
    ticker: 'YOLO',
    name: 'You Only Orbit Corp',
    summary: 'Wants to install giant trampolines and water slides on asteroid belts. A crazy space tourism startup with no profits but infinite charisma. Extremely high swing heights.',
    category: 'Space',
    basePrice: 85,
    volatility: 0.65,
    trend: -0.05,
    icon: '🚀'
  },
  {
    id: 'meow',
    ticker: 'MEOW',
    name: 'Purrfect Pillows Inc.',
    summary: 'Sells custom velvet boxes calibrated to be precisely 12% smaller than the cats trying to sleep in them. Bulletproof sales, cats globally refuse to sleep anywhere else.',
    category: 'Food',
    basePrice: 32,
    volatility: 0.18,
    trend: 0.06,
    icon: '🐈'
  },
  {
    id: 'shrm',
    ticker: 'SHRM',
    name: 'Mushy Mind Labs',
    summary: 'Extracting organic focus compounds from bioluminescent deep-forest mushrooms to cure developers from checking social feeds every 20 seconds. Highly speculative but has magical aura.',
    category: 'Green',
    basePrice: 24,
    volatility: 0.45,
    trend: 0.12,
    icon: '🍄'
  },
  {
    id: 'crd',
    ticker: 'CRD',
    name: 'Cardboard Horizons',
    summary: 'A company that manufactures only delivery boxes for other e-commerce companies. Literally cannot fail because humanity is addicted to ordering tiny items in colossal packaging.',
    category: 'Green',
    basePrice: 95,
    volatility: 0.10,
    trend: 0.04,
    icon: '📦'
  },
  {
    id: 'ggl',
    ticker: 'GGL',
    name: 'Giga Search Engine',
    summary: 'A trillion-dollar monopoly comprising solely of blue search links, captcha images of traffic lights, and targeted ads for things you already bought yesterday.',
    category: 'Tech',
    basePrice: 280,
    volatility: 0.12,
    trend: 0.06,
    icon: '🔍'
  },
  {
    id: 'avoc',
    ticker: 'AVOC',
    name: 'Avocado Toast Syndicate',
    summary: 'Controlling 89% of suburban brunch imports. Its value hits record highs despite millenial financial gurus claiming it is the sole reason why no one can afford micro-apartments.',
    category: 'Food',
    basePrice: 60,
    volatility: 0.22,
    trend: 0.03,
    icon: '🥑'
  },
  {
    id: 'btcn',
    ticker: 'BTCN',
    name: 'Mega-Block Crypto Trust',
    summary: 'A complex decentralized chain of cryptographic riddle-solving. Uses the same electrical energy as a small European country to store digital drawings of bored lizards. Insanely volatile.',
    category: 'Crypto',
    basePrice: 500,
    volatility: 0.85,
    trend: 0.10,
    icon: '🪙'
  },
  {
    id: 'bana',
    ticker: 'BANA',
    name: 'Monkey Banana Trade',
    summary: 'A simple, highly profitable agricultural concern managed entirely by a committee of sophisticated chimpanzees in neckties. They never panic-sell.',
    category: 'Food',
    basePrice: 18,
    volatility: 0.30,
    trend: 0.05,
    icon: '🍌'
  },
  {
    id: 'slvr',
    ticker: 'SLVR',
    name: 'Robotic Lawn Trimmers',
    summary: 'Developing smart solar-powered metallic goats that trim grass perfectly while maintaining a polite conversation with your neighbors. Very popular in upscale suburban zones.',
    category: 'Green',
    basePrice: 110,
    volatility: 0.20,
    trend: 0.07,
    icon: '🤖'
  },
  {
    id: 'subw',
    ticker: 'SUBW',
    name: 'Deep Blue Submersibles',
    summary: 'Specializes in mapping deep hydrothermal vents. Highly respected science team, but stock fluctuates wildly depending on if they occasionally make contact with mythical squids.',
    category: 'Space',
    basePrice: 70,
    volatility: 0.40,
    trend: 0.01,
    icon: '🐳'
  },
  {
    id: 'fomo',
    ticker: 'FOMO',
    name: 'Fear of Missing Out LLC',
    summary: 'A literal black box company. It has no physical premises, no products, and no personnel. It is solely traded because the stock charts look so action-packed. Absolute market madness.',
    category: 'Meme',
    basePrice: 99,
    volatility: 0.90,
    trend: -0.02,
    icon: '🔥'
  },
  {
    id: 'boba',
    ticker: 'BOBA',
    name: 'Boba Bubble Kingdom',
    summary: 'Brewing chewy tapioca spheres floating in ultra-sweet liquid gold. Their secret weapon is a limited-edition straw featuring popular digital cartoon rodents. Constant queues, secure growth.',
    category: 'Food',
    basePrice: 38,
    volatility: 0.15,
    trend: 0.05,
    icon: '🧋'
  },
  {
    id: 'slth',
    ticker: 'SLTH',
    name: 'Sloth Speed Deliveries',
    summary: 'A premium courier service that guarantees your parcel will arrive in "about a month, maybe two". Very popular with Zen hobbyists and people seeking to escape rapid modern urgency.',
    category: 'Meme',
    basePrice: 20,
    volatility: 0.12,
    trend: -0.01,
    icon: '🦥'
  }
];

const ADJECTIVES = [
  'Nova', 'Apex', 'Helix', 'Quantum', 'Nebula', 'Pinnacle', 'Vortex', 'Stellar', 'Synergy', 'Aero',
  'Prism', 'Matrix', 'Zenith', 'Summit', 'Giga', 'Nano', 'Echo', 'Frost', 'Pyro', 'Terra',
  'Aura', 'Solar', 'Lunar', 'Cosmic', 'Hyper', 'Cyber', 'Delta', 'Omega', 'Alpha', 'Infinity',
  'Flux', 'Fusion', 'Pulse', 'Vector', 'Zephyr', 'Krypton', 'Neon', 'Titan', 'Astra', 'Sonic',
  'Glitch', 'Chonky', 'Fluffy', 'Vibe', 'Rocket', 'Caffeine', 'Mushroom', 'Velvet', 'Brunch', 'Crypto'
];

const NOUNS = [
  'Dynamics', 'Systems', 'Labs', 'Holdings', 'Ventures', 'Networks', 'Solutions', 'Technologies',
  'Industries', 'Group', 'Energy', 'Capital', 'Global', 'Corp', 'Enterprises', 'Robotics',
  'Bio', 'Space', 'Crypto', 'Foods', 'Greens', 'Software', 'Games', 'Devices', 'Media',
  'Logistics', 'Security', 'Designs', 'Analytics', 'Consulting', 'Pioneers', 'Alliance', 'Syndicate',
  'Hype', 'Plushies', 'Donuts', 'Noodles', 'Socks', 'Tacos', 'Pancakes', 'Waffles', 'Balloons',
  'Tents', 'Plastics', 'Teas', 'Gardens', 'Ocean', 'Whales', 'Sharks', 'Bears', 'Bulls', 'Boba'
];

const CATEGORIES: Company['category'][] = ['Tech', 'Meme', 'Crypto', 'Food', 'Space', 'Green'];

const EMOJIS = [
  '🛸', '🍀', '🍕', '🎡', '💎', '🎳', '🪁', '🍟', '🛹', '👾', '🧩', '🎈', '🔋', '🍿', '💡',
  '🔥', '👑', '🌈', '🎮', '🔋', '🥑', '🌮', '🍣', '🍩', '🦊', '🐨', '🐼', '🦖', '🚀', '🛰️'
];

// Generate exactly 134 procedural companies deterministically to hit at least 150 tickers
const build150Companies = (): Company[] => {
  const existingTickers = new Set<string>();
  const list: Company[] = [...BASE_CUTE_COMPANIES];
  BASE_CUTE_COMPANIES.forEach(c => existingTickers.add(c.ticker));

  for (let i = 0; i < 134; i++) {
    const adj = ADJECTIVES[i % ADJECTIVES.length];
    const noun = NOUNS[(i * 17) % NOUNS.length];
    const name = `${adj} ${noun}`;

    // Base ticker symbol
    let tickerCandidate = (adj.slice(0, 2) + noun.slice(0, 2)).toUpperCase();
    tickerCandidate = tickerCandidate.replace(/[^A-Z]/g, '');
    while (tickerCandidate.length < 3) {
      tickerCandidate += 'X';
    }
    tickerCandidate = tickerCandidate.slice(0, 4);

    // Uniqueness constraint
    let ticker = tickerCandidate;
    let collisionCounter = 1;
    while (existingTickers.has(ticker)) {
      const nextChar = String.fromCharCode(65 + ((i + collisionCounter) % 26));
      ticker = tickerCandidate.slice(0, 3) + nextChar;
      collisionCounter++;
    }
    existingTickers.add(ticker);

    const category = CATEGORIES[(i * 3) % CATEGORIES.length];
    const emoji = EMOJIS[i % EMOJIS.length];

    // Stats
    const basePrice = 10 + ((i * 13) % 290);
    const volatility = Number((0.12 + ((i * 7) % 68) / 100).toFixed(2));
    const trend = Number((-0.08 + ((i * 11) % 30) / 100).toFixed(2));

    const summary = `Leading developer of specialized ${category.toLowerCase()} interfaces, optimizing scalable ${adj.toLowerCase()}-grade infrastructure and ${noun.toLowerCase()} platforms.`;

    list.push({
      id: `generated_${i}`,
      ticker,
      name,
      summary,
      category,
      basePrice,
      volatility,
      trend,
      icon: emoji
    });
  }

  return list;
};

export const CUTE_COMPANIES: Company[] = [...build150Companies(), ...EXTRA_COMPANIES];

export function getRandomCompany(playedIds: string[]): Company {
  const unplayed = CUTE_COMPANIES.filter(c => !playedIds.includes(c.id));
  if (unplayed.length > 0) {
    const pick = unplayed[Math.floor(Math.random() * unplayed.length)];
    return pick;
  }
  // If all played, recycle
  return CUTE_COMPANIES[Math.floor(Math.random() * CUTE_COMPANIES.length)];
}
