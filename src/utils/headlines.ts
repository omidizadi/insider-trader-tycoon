import { Company } from '../types';
import { EXTRA_HEADLINE_TEMPLATES } from '../extraHeadlines';

export interface NewsHeadline {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impactPercent: number; // multiplier for stock change
  source: string;
}

// Deterministic hashing helper
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getDeterministicItem<T>(arr: T[], seed: string, offset = 0): T {
  const hash = hashString(seed) + offset;
  return arr[hash % arr.length];
}

// Category Specific Custom Keywords
const PRODUCTS_BY_CATEGORY: Record<string, string[]> = {
  Tech: [
    "quantum computing cores",
    "augmented-reality vision contacts",
    "generative AI coding copilots",
    "brain-computer wireless headsets",
    "foldable holographic pads",
    "ultra-thin brushed titanium routers",
    "holographic glass smartboards",
    "self-learning micro-servers"
  ],
  Meme: [
    "dancing kitten holographic filters",
    "pixelated frog avatar collectibles",
    "limited-edition giant fuzzy slippers",
    "hyper-viral acoustic noise loops",
    "meme-infused squeaky plushies",
    "custom Shiba Inu trading stamps",
    "synthetic internet clout tokens",
    "collectible golden brick keychains"
  ],
  Crypto: [
    "liquid stake yield registries",
    "algorithmic gold-backed stablecoins",
    "zero-knowledge privacy ledgers",
    "decentralized liquidity reward pools",
    "doge-themed proof-of-stake node grids",
    "multi-chain gas token bridges",
    "fractional NFT registry keys",
    "smart contract automatic arbiters"
  ],
  Food: [
    "super-caffeinated syrup infusions",
    "organic pre-smashed avocado paste",
    "chewy gold tapioca bubble sets",
    "glowing neon mushroom tea brews",
    "hyper-sweet liquid hydration shots",
    "freeze-dried protein crunch bits",
    "zero-sugar vitamin-infused nectar",
    "automated instant espresso pods"
  ],
  Space: [
    "asteroid trampoline landing pads",
    "helium rocket valve thrusters",
    "orbital satellite stream antennas",
    "luxury microgravity sleeping pods",
    "magnetic asteroid mineral drills",
    "solar wind ion-propulsion sails",
    "low-gravity inflatable domes",
    "reusable comet catcher nets"
  ],
  Green: [
    "solar-powered robotic lawnmowers",
    "eco-friendly carbon-neutral packaging",
    "biodegradable seed-infused plant pots",
    "ocean-plastic smart walking shoes",
    "wind-powered automatic coffee roasters",
    "reclaimed-wood kinetic smart-desks",
    "biomass-fueled backyard generators",
    "rainwater filtration filter grids"
  ]
};

const ACTIONS_BY_CATEGORY: Record<string, string[]> = {
  Tech: [
    "force-update system firmware globally",
    "launch a multi-tier premium subscription service",
    "completely refactor the core cloud codebase",
    "optimize their central data servers"
  ],
  Meme: [
    "post a highly amusing internet video",
    "initiate a coordinated buying campaign",
    "host a chaotic 24-hour influencer livestream",
    "sell out exclusive merchandise drops"
  ],
  Crypto: [
    "hard fork the main blockchain ledger",
    "mint a limited run of diamond-encrusted tokens",
    "delegate primary validation node voting rights",
    "stake 10 million native tokens in the pool"
  ],
  Food: [
    "brew an ultra-sweet limited recipe batch",
    "deliver active orders via autonomous quadcopter drone",
    "launch an underground secret pop-up kitchen",
    "sponsor a world-record dessert-eating contest"
  ],
  Space: [
    "launch a commercial orbital tourist rocket",
    "excavate a newly discovered minor asteroid belt",
    "establish a pressurized research lunar colony outpost",
    "map a mysterious deep-space radio emission anomaly"
  ],
  Green: [
    "harvest solar energy via orbital mirrors",
    "implant bioluminescent forest spores in state parks",
    "recycle ocean-bound plastic garbage into high-fashion wear",
    "purify deep groundwater reservoirs with clean tech"
  ]
};

const BAD_OUTCOMES_BY_CATEGORY: Record<string, string[]> = {
  Tech: [
    "suffers a security breach leaking embarrassing internal employee selfies",
    "crashes cloud servers globally during an active key presentation",
    "experiences a severe battery overheating glitch causing tiny pocket pops"
  ],
  Meme: [
    "suffers a public backlash when a key influencer deletes their sponsor post",
    "gets server domain revoked due to an incredibly silly trademark dispute",
    "faces a massive retail sell-off after moderators lock the leading chat room"
  ],
  Crypto: [
    "is hit by a smart-contract exploit draining 20% of investor funds",
    "discovers its founder accidentally forgot the password to the cold wallet",
    "gets flagged by financial regulators for operating an unlicensed asset registry"
  ],
  Food: [
    "is hit by an unexpected federal health audit over highly addictive ingredients",
    "faces critical inventory shortages as severe weather slows shipping fleets",
    "sees drop in engagement after a fitness blogger claims its products are toxic"
  ],
  Space: [
    "is delayed for six months due to a surprise deep space dust shower",
    "experiences a thruster valve malfunction making the probe float backwards",
    "loses power as solar dust shields fail to open in orbit"
  ],
  Green: [
    "sees solar output cut in half due to an unprecedented three-week cloudy weather pattern",
    "encounters a heavy factory breakdown that mixes plastic debris into bio-compost",
    "faces a greenwashing audit on its advertised carbon offset metrics"
  ]
};

const GOOD_OUTCOMES_BY_CATEGORY: Record<string, string[]> = {
  Tech: [
    "shatters industry benchmark scores by a whopping 450%",
    "signs a multi-billion dollar enterprise licensing contract with a rival monopoly",
    "unveils a working paper-thin prototype that stuns tech journalists"
  ],
  Meme: [
    "soars to the top spot of internet trends with 100 million organic views",
    "is tweeted by a dog-loving pet billionaire in a funny late-night meme",
    "is swept up in a massive retail trading frenzy that triggers market circuit breakers"
  ],
  Crypto: [
    "is officially recognized as legal tender by a sovereign island nation",
    "scales transaction validation speeds to an unprecedented 2 million actions per second",
    "triggers a historic short-squeeze rally that climbs 300% in an afternoon"
  ],
  Food: [
    "has urban weekend lines wrapping around five city blocks",
    "receives a prestigious organic premium certification from health unions",
    "signs a long-term contract to supply 10,000 corporate offices worldwide"
  ],
  Space: [
    "makes history by capturing high-definition pictures of a deep cosmic anomaly",
    "successfully lands its reusable heavy thrusters on floating target pads",
    "secures a massive defense aerospace exploration contract worth billions"
  ],
  Green: [
    "wins the coveted Green Global Innovation award for outstanding design",
    "secures a carbon-neutral certification that offsets all corporate emissions",
    "gains viral acclaim for saving a school of endangered coastal marine life"
  ]
};

const RIVALS_BY_CATEGORY: Record<string, string[]> = {
  Tech: ["Pear Micro", "Banana Tech", "Giga Soft", "Apex Chipsets"],
  Meme: ["Hype Corp", "Shiba Syndicate", "Trend Masters", "Vibe Kings"],
  Crypto: ["Token Trust", "Block Giants", "Coin Kings", "Gas Wizards"],
  Food: ["Chimp Diners", "Boba World", "Sip Empire", "Nectar Trade"],
  Space: ["Star Galactic", "Aero Dynamic", "Cosmic Corp", "Gravity Labs"],
  Green: ["Eco Earth", "Bio Future", "Terra Clean", "Sun Systems"]
};

const NEWS_SOURCES = [
  "Bloomberg",
  "WSJ",
  "Reuters",
  "TechCrunch",
  "MemeRadar",
  "Wired",
  "Forbes",
  "FinancialTimes",
  "MarketWatch",
  "CNBC"
];

const BASE_COMPANY_KEYWORDS: Record<string, CompanyKeywords> = {
  fruit: {
    product: "paper-thin brushed aluminum rectangles",
    action: "launch the super-premium Apple-core device suite",
    badOutcome: "suffers a manufacturing delay due to a micro-scratched bezel crisis",
    goodOutcome: "wins universal acclaim for its beautiful charging port placement",
    rival: "Pear Computing"
  },
  doge: {
    product: "decentralized bone biscuit registries",
    action: "publish a funny Shiba Inu picture on cosmic forums",
    badOutcome: "crashes under a massive stampede of physical dog walks",
    goodOutcome: "receives a friendly nod from a notorious rocket-engineering billionaire",
    rival: "Cate Coin Inc"
  },
  cofe: {
    product: "hyper-caffeinated corporate IV drip tubes",
    action: "install double-shot automatic workspaces",
    badOutcome: "spills 5,000 gallons of dark roast coffee directly onto corporate servers",
    goodOutcome: "secures patent for decaf-regulated hyper-alert productivity serums",
    rival: "De-Caf Cartel"
  },
  yolo: {
    product: "asteroid trampoline landing modules",
    action: "launch water-slides on heavy asteroid belts",
    badOutcome: "loses target tracking after a visitor jumps 500 meters into deep gravity",
    goodOutcome: "successfully lands a trampoline ship on the Ceres minor planet",
    rival: "Boring Orbit Co"
  },
  meow: {
    product: "velvet boxes calibrated smaller than the cats using them",
    action: "mass produce orthopedic claw-friendly cushions",
    badOutcome: "faces critical fabric shortages after factory kittens nap on the primary loom",
    goodOutcome: "gains global endorsements from three famous internet celebrity felines",
    rival: "Scratch & Paw Ltd"
  },
  shrm: {
    product: "bioluminescent focus mushroom teas",
    action: "cultivate organic forest focus spores in central parks",
    badOutcome: "uncovers a rare mushroom variant that makes developers talk in clean code rhymes",
    goodOutcome: "secures clinical validation for curing short-attention screen scrolling habits",
    rival: "Synthetic Focus Labs"
  },
  crd: {
    product: "recycled cardboard double-walled delivery parcel packaging",
    action: "optimize cardboard folding machinery to triple folding velocities",
    badOutcome: "loses active stock inventory after a minor backyard garden hose leak",
    goodOutcome: "dominates the global shipping supply chain during the holiday season",
    rival: "Plastic Wrapped Inc"
  },
  ggl: {
    product: "blue search engine result placements",
    action: "re-scramble their core machine search algorithms",
    badOutcome: "leaks internal employee emails claiming the AI was just copy-pasting search results",
    goodOutcome: "successfully registers patents on the standard traffic-light captcha image block",
    rival: "Altavista Retro"
  },
  avoc: {
    product: "pre-smashed suburb avocado toast paste",
    action: "monopolize regional brunch grain shipping yards",
    badOutcome: "gets blamed by financial advisors for a major suburb real estate downturn",
    goodOutcome: "secures high-premium contract with 5,000 corporate breakfast cafes",
    rival: "Sourdough Syndicate"
  },
  btcn: {
    product: "cryptographic ledger verification key puzzles",
    action: "power cryptographic node grids via green solar arrays",
    badOutcome: "loses access after a major database admin cleans out the hard disk",
    goodOutcome: "triggers a massive buy-side squeeze that climbs 400% in a single day",
    rival: "Fiator Holdings"
  },
  bana: {
    product: "tie-wearing organic banana stock baskets",
    action: "expand premium agricultural fruit trade paths",
    badOutcome: "faces minor labor disputes as chimp operators demand higher fruit break ratios",
    goodOutcome: "gains high-status praise for maintaining a calm, chimp-run balance sheet",
    rival: "Citrus Cartel"
  },
  slvr: {
    product: "solar-powered polite robot lawn trimmers",
    action: "integrate friendly conversational logic in lawn mower chips",
    badOutcome: "sees automated mowers join backyard neighborhood gossip groups instead of working",
    goodOutcome: "signs long-term contract to trim grass for the presidential palace",
    rival: "Manual Shears Co"
  },
  subw: {
    product: "hydrothermal deep vent mapper probes",
    action: "broadcast deep ocean acoustic sonar frequencies",
    badOutcome: "accidentally wakes a highly energetic deep sea squid that tags their tracer",
    goodOutcome: "films the first crystal-clear video of the legendary golden hydrothermal dome",
    rival: "Shallow Waters Co"
  },
  fomo: {
    product: "action-packed shadow investment graphs",
    action: "post completely empty charts with flashing green arrows",
    badOutcome: "faces mass liquidation when investors discover the company office is a simple cardboard box",
    goodOutcome: "enters a state of pure speculative hype, skyrocketing 500% on zero news",
    rival: "Common Sense LLC"
  },
  boba: {
    product: "limited-edition giant straws and chewy bubble boba teas",
    action: "launch limited edition bubble tea cups featuring popular digital cartoon rodents",
    badOutcome: "suffers tapioca pearl shortages as supply ships are blocked by standard customs",
    goodOutcome: "reports urban weekend queues stretching for six blocks across major cities",
    rival: "Tea Drops Co"
  },
  slth: {
    product: "peaceful slow-speed delivery parcel vouchers",
    action: "guarantee slow delivery times within sixty to ninety business days",
    badOutcome: "accidentally delivers a package three weeks early, upsetting slow-lifestyle enthusiasts",
    goodOutcome: "secures absolute loyalty from customers wanting to escape modern digital stress",
    rival: "Insta-Flash Couriers"
  }
};

// Structure of Company Keywords
export interface CompanyKeywords {
  product: string;
  action: string;
  badOutcome: string;
  goodOutcome: string;
  rival: string;
}

export function getCompanyKeywords(company: Company): CompanyKeywords {
  // If we have custom hand-crafted keywords for this base company, prioritize them
  if (BASE_COMPANY_KEYWORDS[company.id]) {
    return BASE_COMPANY_KEYWORDS[company.id];
  }

  // Otherwise, procedurally generate keywords customized to their name and category
  const nameParts = company.name.split(" ");
  const adj = nameParts[0] || "Custom";
  const noun = nameParts[1] || "Systems";

  // Category fallbacks
  const cat = company.category;
  const products = PRODUCTS_BY_CATEGORY[cat] || PRODUCTS_BY_CATEGORY["Tech"];
  const actions = ACTIONS_BY_CATEGORY[cat] || ACTIONS_BY_CATEGORY["Tech"];
  const badOutcomes = BAD_OUTCOMES_BY_CATEGORY[cat] || BAD_OUTCOMES_BY_CATEGORY["Tech"];
  const goodOutcomes = GOOD_OUTCOMES_BY_CATEGORY[cat] || GOOD_OUTCOMES_BY_CATEGORY["Tech"];
  const rivals = RIVALS_BY_CATEGORY[cat] || RIVALS_BY_CATEGORY["Tech"];

  const defaultProduct = getDeterministicItem(products, company.ticker, 0);
  const defaultAction = getDeterministicItem(actions, company.ticker, 1);
  const defaultBad = getDeterministicItem(badOutcomes, company.ticker, 2);
  const defaultGood = getDeterministicItem(goodOutcomes, company.ticker, 3);
  const defaultRival = getDeterministicItem(rivals, company.ticker, 4);

  return {
    product: `${adj.toLowerCase()}-grade ${defaultProduct}`,
    action: `${defaultAction} using next-gen ${adj.toLowerCase()} logic`,
    badOutcome: `${defaultBad} during a critical launch of its ${noun} series`,
    goodOutcome: `successfully ${defaultGood}, establishing a new standard for ${noun} dynamics`,
    rival: `${adj} ${defaultRival}`
  };
}

// 50 unique headlines templates (20 positive, 20 negative, 10 neutral)
const BASE_HEADLINE_TEMPLATES: { text: string; sentiment: 'positive' | 'negative' | 'neutral'; impactPercent: number; sourceOffset: number }[] = [
  // ...existing code...
  { text: "{NAME} unveils revolutionary new {PRODUCT}, driving retail interest to historical highs!", sentiment: 'positive', impactPercent: 0.38, sourceOffset: 0 },
  { text: "{NAME} secures exclusive multi-million dollar contract to distribute their premium {PRODUCT}.", sentiment: 'positive', impactPercent: 0.28, sourceOffset: 1 },
  { text: "{NAME} reports record-shattering quarterly earnings, fueled by massive sales of {PRODUCT}.", sentiment: 'positive', impactPercent: 0.35, sourceOffset: 2 },
  { text: "{NAME} {GOOD_OUTCOME} - stock surges in pre-market trading!", sentiment: 'positive', impactPercent: 0.45, sourceOffset: 3 },
  { text: "Analysts upgrade {TICKER} to 'Strong Buy' after successful trials of {PRODUCT}.", sentiment: 'positive', impactPercent: 0.25, sourceOffset: 4 },
  { text: "A prominent billionaire investor discloses a massive stake in {NAME} ({TICKER}).", sentiment: 'positive', impactPercent: 0.42, sourceOffset: 5 },
  { text: "A viral social media trend featuring {NAME}'s {PRODUCT} triggers an influx of new retail buyers!", sentiment: 'positive', impactPercent: 0.48, sourceOffset: 6 },
  { text: "{NAME} announced that they will {ACTION}, causing major short-sellers to panic-cover.", sentiment: 'positive', impactPercent: 0.32, sourceOffset: 7 },
  { text: "{NAME} {GOOD_OUTCOME}, leaving key competitor {RIVAL} far behind.", sentiment: 'positive', impactPercent: 0.34, sourceOffset: 8 },
  { text: "Demand for {NAME}'s signature {PRODUCT} exceeds production capacities by 300%.", sentiment: 'positive', impactPercent: 0.30, sourceOffset: 9 },
  { text: "Rumors swirl that a tech giant is planning a premium buyout of {NAME} ({TICKER}).", sentiment: 'positive', impactPercent: 0.40, sourceOffset: 0 },
  { text: "Strategic expansion announced! {NAME} is taking {PRODUCT} into international markets.", sentiment: 'positive', impactPercent: 0.24, sourceOffset: 1 },
  { text: "Famous pop-star seen endorsing {NAME}'s {PRODUCT} in front of millions of fans.", sentiment: 'positive', impactPercent: 0.33, sourceOffset: 2 },
  { text: "Patent approved! {NAME} secures exclusive rights to the technology behind {PRODUCT}.", sentiment: 'positive', impactPercent: 0.29, sourceOffset: 3 },
  { text: "Institutional fund managers allocate 5% of their growth portfolio to {TICKER}.", sentiment: 'positive', impactPercent: 0.22, sourceOffset: 4 },
  { text: "{NAME} successfully completes testing for {PRODUCT}, exceeding performance expectations.", sentiment: 'positive', impactPercent: 0.27, sourceOffset: 5 },
  { text: "Major rating agency upgrades {TICKER} outlook to positive, praising {PRODUCT} scalability.", sentiment: 'positive', impactPercent: 0.23, sourceOffset: 6 },
  { text: "{NAME} {GOOD_OUTCOME}! The board declares a surprise special dividend.", sentiment: 'positive', impactPercent: 0.41, sourceOffset: 7 },
  { text: "Insider buying reports show {NAME}'s executive team is heavily loading up on {TICKER}.", sentiment: 'positive', impactPercent: 0.26, sourceOffset: 8 },
  { text: "Customer satisfaction scores for {NAME}'s {PRODUCT} reach a near-perfect 99.4%.", sentiment: 'positive', impactPercent: 0.21, sourceOffset: 9 },

  // NEGATIVE (Indices 20 - 39)
  { text: "Panic selling hits {TICKER} as {NAME} {BAD_OUTCOME}!", sentiment: 'negative', impactPercent: -0.32, sourceOffset: 0 },
  { text: "A class-action lawsuit is filed against {NAME} regarding safety issues of {PRODUCT}.", sentiment: 'negative', impactPercent: -0.24, sourceOffset: 1 },
  { text: "Short-seller report claims {NAME} overstated the efficiency and sales of {PRODUCT}.", sentiment: 'negative', impactPercent: -0.40, sourceOffset: 2 },
  { text: "Regulators launch formal antitrust probe into {NAME} over unfair trade practices.", sentiment: 'negative', impactPercent: -0.20, sourceOffset: 3 },
  { text: "Major manufacturing plant for {NAME} shut down temporarily due to supply chain failures.", sentiment: 'negative', impactPercent: -0.18, sourceOffset: 4 },
  { text: "Earnings miss! {NAME} reports quarterly loss, citing high development costs of {PRODUCT}.", sentiment: 'negative', impactPercent: -0.22, sourceOffset: 5 },
  { text: "Key executive at {NAME} unexpectedly resigns to join direct competitor {RIVAL}.", sentiment: 'negative', impactPercent: -0.26, sourceOffset: 6 },
  { text: "{NAME} {BAD_OUTCOME}, forcing the board to suspend future product timelines.", sentiment: 'negative', impactPercent: -0.35, sourceOffset: 7 },
  { text: "Leaked internal messages suggest {NAME}'s {PRODUCT} has major defects.", sentiment: 'negative', impactPercent: -0.28, sourceOffset: 8 },
  { text: "Consumer boycott gathers steam online against {NAME} over controversial ads.", sentiment: 'negative', impactPercent: -0.15, sourceOffset: 9 },
  { text: "Rival {RIVAL} launches cheaper version of {PRODUCT}, cutting into {NAME}'s market share.", sentiment: 'negative', impactPercent: -0.21, sourceOffset: 0 },
  { text: "Prominent financial analyst downgrades {TICKER} to 'Sell', citing lack of product direction.", sentiment: 'negative', impactPercent: -0.19, sourceOffset: 1 },
  { text: "Major venture capital backer liquidates entire position in {NAME} ({TICKER}) overnight.", sentiment: 'negative', impactPercent: -0.30, sourceOffset: 2 },
  { text: "Hackers claim to hold key blueprints of {NAME}'s {PRODUCT}; ransomware payment demanded.", sentiment: 'negative', impactPercent: -0.29, sourceOffset: 3 },
  { text: "{NAME} attempts to {ACTION}, but faces intense resistance and delays.", sentiment: 'negative', impactPercent: -0.16, sourceOffset: 4 },
  { text: "Customs authorities block shipping containers containing key parts for {PRODUCT}.", sentiment: 'negative', impactPercent: -0.18, sourceOffset: 5 },
  { text: "A major security firm warns consumers of phishing scams abusing {NAME}'s brand name.", sentiment: 'negative', impactPercent: -0.13, sourceOffset: 6 },
  { text: "{NAME}'s {PRODUCT} fails to secure critical certification, causing stock panic.", sentiment: 'negative', impactPercent: -0.25, sourceOffset: 7 },
  { text: "Disastrous press conference: {NAME} spokesperson struggles to answer basic financial questions.", sentiment: 'negative', impactPercent: -0.23, sourceOffset: 8 },
  { text: "Underwhelming customer reviews for {NAME}'s new {PRODUCT} lead to massive return rates.", sentiment: 'negative', impactPercent: -0.21, sourceOffset: 9 },

  // NEUTRAL / SWING (Indices 40 - 49)
  { text: "Rumors swirl that {NAME} is secretly planning to {ACTION} next month.", sentiment: 'neutral', impactPercent: 0.05, sourceOffset: 0 },
  { text: "Industry roundtable debates whether {NAME}'s {PRODUCT} represents the future or a fad.", sentiment: 'neutral', impactPercent: -0.01, sourceOffset: 1 },
  { text: "{NAME} announces a rebranding campaign, changing the color scheme of {PRODUCT}.", sentiment: 'neutral', impactPercent: 0.02, sourceOffset: 2 },
  { text: "Competitor {RIVAL} comments on {NAME}'s latest strategy: 'We are watching closely'.", sentiment: 'neutral', impactPercent: 0.01, sourceOffset: 3 },
  { text: "{NAME} holds scheduled annual meeting; CEO emphasizes long-term stability of {PRODUCT}.", sentiment: 'neutral', impactPercent: 0.04, sourceOffset: 4 },
  { text: "Analysts split on whether {NAME}'s decision to {ACTION} will benefit stockholders.", sentiment: 'neutral', impactPercent: -0.03, sourceOffset: 5 },
  { text: "A small-scale scientific study evaluates the environmental impact of {PRODUCT}.", sentiment: 'neutral', impactPercent: 0.02, sourceOffset: 6 },
  { text: "Leaked blueprints show {NAME} is working on a secret project codenamed 'Titanium'.", sentiment: 'neutral', impactPercent: 0.06, sourceOffset: 7 },
  { text: "Global commodities index rebalances; {TICKER} weight remains unchanged.", sentiment: 'neutral', impactPercent: 0.0, sourceOffset: 8 },
  { text: "CEO of {NAME} seen dining with the founder of direct competitor {RIVAL}.", sentiment: 'neutral', impactPercent: 0.03, sourceOffset: 9 }
];

// Combine base templates with the 500 extra templates for a total of 550 headlines per company.
const HEADLINE_TEMPLATES = [...BASE_HEADLINE_TEMPLATES, ...EXTRA_HEADLINE_TEMPLATES];

export function generate50HeadlinesForCompany(company: Company): NewsHeadline[] {
  const keywords = getCompanyKeywords(company);

  return HEADLINE_TEMPLATES.map((t, idx) => {
    let text = t.text;
    text = text.replace(/{NAME}/g, company.name);
    text = text.replace(/{TICKER}/g, company.ticker);
    text = text.replace(/{PRODUCT}/g, keywords.product);
    text = text.replace(/{ACTION}/g, keywords.action);
    text = text.replace(/{BAD_OUTCOME}/g, keywords.badOutcome);
    text = text.replace(/{GOOD_OUTCOME}/g, keywords.goodOutcome);
    text = text.replace(/{RIVAL}/g, keywords.rival);

    // Pick deterministic source
    const sourceIdx = (hashString(company.ticker) + t.sourceOffset + idx) % NEWS_SOURCES.length;
    const source = NEWS_SOURCES[sourceIdx];

    return {
      text,
      sentiment: t.sentiment,
      impactPercent: t.impactPercent,
      source
    };
  });
}

export function getHeadlinesForCompany(company: Company): NewsHeadline[] {
  return generate50HeadlinesForCompany(company);
}

export function pickRandomHeadline(company: Company, usedIndices: Set<string>): { headline: NewsHeadline, id: string } {
  const pool = getHeadlinesForCompany(company);

  // Filter out already used ones if possible
  const unused = pool.filter((_, idx) => !usedIndices.has(`${company.id}_${idx}`));
  const finalPool = unused.length > 0 ? unused : pool;

  const randomIndex = Math.floor(Math.random() * finalPool.length);
  const headline = finalPool[randomIndex];
  const realIdx = pool.indexOf(headline);
  const id = `${company.id}_${realIdx}`;

  return { headline, id };
}
