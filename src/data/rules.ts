import { RuleCard } from '../types';

/**
 * 100 rule cards for the Trading Bot.
 *
 * Each card is a casual, non-technical rule the player equips to program the bot.
 * The bot evaluates the equipped rules each tick and picks an action (buy/sell/hold).
 *
 * `action: 'auto'` cards are "conditions" — they nudge the bot's decision but don't
 * force a hard action. `buy`/`sell`/`hold` cards are hard overrides that fire when
 * their condition is met.
 *
 * ponytail: ceiling — the rule engine is a simple priority resolver, not a real DSL.
 * Conditions are evaluated by the engine in ActiveGame.tsx using the card id.
 */
export const RULE_CARDS: RuleCard[] = [
  // ===== PRICE-BASED RULES (1-20) =====
  { id: 'r001', title: 'No All-Time Highs', description: 'Never buy when the price just hit an all-time high. Trees do grow to the sky, but not this one.', emoji: '🚫', action: 'auto', category: 'price' },
  { id: 'r002', title: 'Buy the Dip', description: 'Buy when the price drops hard in one go. Someone is definitely screaming into a pillow.', emoji: '🛒', action: 'buy', category: 'price' },
  { id: 'r003', title: 'Sell the Rip', description: 'Sell when the price spikes up sharply. Take the win and run before the floor falls out.', emoji: '💸', action: 'sell', category: 'price' },
  { id: 'r004', title: 'Cheap Like Avocados', description: 'Only buy when the price is near its recent low. Bargain bin energy.', emoji: '🥑', action: 'auto', category: 'price' },
  { id: 'r005', title: 'FOMO Blocker', description: 'Never buy when the price is at a 5-tick high. Your fear of missing out is not a strategy.', emoji: '🧘', action: 'auto', category: 'price' },
  { id: 'r006', title: 'Panic Seller', description: 'Sell the moment the price drops below what you paid. Cut and run, live to trade another day.', emoji: '😱', action: 'sell', category: 'price' },
  { id: 'r007', title: 'Double Down', description: 'Buy more when the price falls below your average buy price. Averaging down, or so the forums say.', emoji: '⬇️', action: 'buy', category: 'price' },
  { id: 'r008', title: 'Peak Chaser', description: 'Buy when the price makes a new local high. Momentum is a hell of a drug.', emoji: '🏔️', action: 'buy', category: 'price' },
  { id: 'r009', title: 'Floor Sweeper', description: 'Buy when the price barely moves for several ticks. The calm before the storm, maybe.', emoji: '🧹', action: 'auto', category: 'price' },
  { id: 'r010', title: 'Ceiling Bumper', description: 'Sell when the price stalls near a recent high. What goes up must come down eventually.', emoji: '🪜', action: 'auto', category: 'price' },
  { id: 'r011', title: 'Steady Climber', description: 'Buy when the price ticks up gently three times in a row. Slow and steady wins the race.', emoji: '🐢', action: 'buy', category: 'price' },
  { id: 'r012', title: 'Steady Diver', description: 'Sell when the price ticks down gently three times in a row. The slow bleed is real.', emoji: '🐌', action: 'sell', category: 'price' },
  { id: 'r013', title: 'Whale Wake', description: 'Buy right after a big price drop, assuming a whale just dumped and the tide will turn.', emoji: '🐋', action: 'buy', category: 'price' },
  { id: 'r014', title: 'Rocket Fuel', description: 'Buy when the price jumps more than usual in one tick. To the moon, allegedly.', emoji: '🚀', action: 'buy', category: 'price' },
  { id: 'r015', title: 'Parachute', description: 'Sell when the price jumps too fast. What goes straight up usually comes straight down.', emoji: '🪂', action: 'sell', category: 'price' },
  { id: 'r016', title: 'Middle Child', description: 'Only act when the price is in the middle of its recent range. Extremes are for extremists.', emoji: '🧸', action: 'auto', category: 'price' },
  { id: 'r017', title: 'Round Number Respect', description: 'Sell when the price crosses a nice round number. Markets love round numbers for no reason.', emoji: '🔢', action: 'auto', category: 'price' },
  { id: 'r018', title: 'Bounce Believer', description: 'Buy when the price bounces up after hitting a low. Rubber balls and stocks both bounce, sometimes.', emoji: '🎾', action: 'buy', category: 'price' },
  { id: 'r019', title: 'Slippery Slope', description: 'Sell when the price keeps sliding with no bounce. Don\'t catch a falling knife.', emoji: '🍌', action: 'sell', category: 'price' },
  { id: 'r020', title: 'Goldilocks', description: 'Buy only when the price is not too high, not too low, but just right. Porridge not included.', emoji: '🐻', action: 'auto', category: 'price' },

  // ===== NEWS / SENTIMENT RULES (21-45) =====
  { id: 'r021', title: 'Good News Greed', description: 'Buy the instant very positive news breaks. Greed is good, allegedly.', emoji: '🤑', action: 'buy', category: 'news' },
  { id: 'r022', title: 'Bad News Flight', description: 'Sell the instant very negative news breaks. Don\'t be the last one out the door.', emoji: '🏃', action: 'sell', category: 'news' },
  { id: 'r023', title: 'Two Good In A Row', description: 'Never sell when we just had two consecutive positive news headlines. The streak is sacred.', emoji: '✌️', action: 'auto', category: 'streak' },
  { id: 'r024', title: 'Two Bad In A Row', description: 'Sell when two negative news headlines hit back to back. Lightning does strike twice.', emoji: '⚡', action: 'sell', category: 'streak' },
  { id: 'r025', title: 'Contrarian Clown', description: 'Buy on negative news and sell on positive news. The market is wrong and you are a genius.', emoji: '🤡', action: 'auto', category: 'news' },
  { id: 'r026', title: 'News Junkie', description: 'Always act on news, never ignore it. Sitting still is not a strategy.', emoji: '📰', action: 'auto', category: 'news' },
  { id: 'r027', title: 'No News Is Good News', description: 'Hold when the news is neutral. Boring is underrated.', emoji: '😴', action: 'hold', category: 'news' },
  { id: 'r028', title: 'Rumor Mill', description: 'Buy on neutral news, because rumors are secretly bullish. Probably. Maybe.', emoji: '🗣️', action: 'buy', category: 'news' },
  { id: 'r029', title: 'Headline Hypochondriac', description: 'Sell on any news at all, even good news. Something must be wrong somewhere.', emoji: '🩺', action: 'sell', category: 'news' },
  { id: 'r030', title: 'Triple Threat', description: 'Sell when three positive news headlines hit in a row. What goes up too fast must come down.', emoji: '🔥', action: 'sell', category: 'streak' },
  { id: 'r031', title: 'Bottom Feeder', description: 'Buy only after a very negative headline, when everyone else is panicking. Be greedy when others are fearful.', emoji: '🦈', action: 'buy', category: 'news' },
  { id: 'r032', title: 'Top Caller', description: 'Sell only after a very positive headline, when everyone is cheering. Be fearful when others are greedy.', emoji: '🎯', action: 'sell', category: 'news' },
  { id: 'r033', title: 'Mood Ring', description: 'Buy when the last news was positive, sell when it was negative. Simple vibes-based trading.', emoji: '💍', action: 'auto', category: 'sentiment' },
  { id: 'r034', title: 'Emotional Eater', description: 'Hold through negative news because selling would hurt your feelings. Not financial advice.', emoji: '🍩', action: 'hold', category: 'sentiment' },
  { id: 'r035', title: 'Spicy News Only', description: 'Only act on very positive or very negative news. Mild news is for mild people, and you are spicy.', emoji: '🌶️', action: 'auto', category: 'news' },
  { id: 'r036', title: 'Good Vibes Buyer', description: 'Buy whenever any positive news appears, even just a little. Optimism is a lifestyle.', emoji: '🌈', action: 'buy', category: 'sentiment' },
  { id: 'r037', title: 'Doom Scroller', description: 'Sell whenever any negative news appears, even just a little. The sky is always falling.', emoji: '☁️', action: 'sell', category: 'sentiment' },
  { id: 'r038', title: 'Streak Breaker', description: 'Buy immediately after a streak of bad news ends. The tide is turning, probably.', emoji: '🌊', action: 'buy', category: 'streak' },
  { id: 'r039', title: 'Streak Rider', description: 'Hold as long as positive news keeps coming. Don\'t jump off a moving train.', emoji: '🚂', action: 'hold', category: 'streak' },
  { id: 'r040', title: 'First Reaction', description: 'Only act on the very first news of the round. First impressions matter most.', emoji: '👀', action: 'auto', category: 'news' },
  { id: 'r041', title: 'Last Word', description: 'Only act on the most recent news, ignore older headlines. Out with the old.', emoji: '🗨️', action: 'auto', category: 'news' },
  { id: 'r042', title: 'Positive Parrot', description: 'Repeat the last positive news by buying more. Squawk squawk.', emoji: '🦜', action: 'buy', category: 'sentiment' },
  { id: 'r043', title: 'Negative Nelly', description: 'Assume the worst after any negative news and sell. Better safe than sorry.', emoji: '🌧️', action: 'sell', category: 'sentiment' },
  { id: 'r044', title: 'Balanced Breakfast', description: 'Buy on positive news only if the previous news was not also positive. Variety is the spice of portfolios.', emoji: '🥣', action: 'auto', category: 'news' },
  { id: 'r045', title: 'Echo Chamber', description: 'Buy when the last two news headlines had the same mood. The crowd has spoken.', emoji: '📻', action: 'buy', category: 'streak' },

  // ===== POSITION / RISK RULES (46-65) =====
  { id: 'r046', title: 'All In Andy', description: 'Buy with everything you have, every single time. Go big or go home, mostly go home.', emoji: '🎰', action: 'buy', category: 'position' },
  { id: 'r047', title: 'Empty Pockets', description: 'Never hold a position for more than a few ticks. In and out, quick as a flash.', emoji: '🕳️', action: 'sell', category: 'position' },
  { id: 'r048', title: 'Diamond Hands', description: 'Never sell at a loss. Hold until the heat death of the universe or until profit appears.', emoji: '💎', action: 'hold', category: 'position' },
  { id: 'r049', title: 'Paper Hands', description: 'Sell the moment you have any profit at all, even one cent. A win is a win.', emoji: '📄', action: 'sell', category: 'position' },
  { id: 'r050', title: 'Greedy Gus', description: 'Only sell when profit is bigger than a small pizza. Hold out for the big slice.', emoji: '🍕', action: 'auto', category: 'position' },
  { id: 'r051', title: 'Scaredy Cat', description: 'Sell the moment you are in profit by any meaningful amount. Birds in the hand, etc.', emoji: '🐈', action: 'sell', category: 'position' },
  { id: 'r052', title: 'No Position No Problem', description: 'Always buy if you currently hold nothing. Can\'t make money sitting on the sidelines.', emoji: '🪑', action: 'buy', category: 'position' },
  { id: 'r053', title: 'One At A Time', description: 'Never buy if you already hold a position. Don\'t double dip the chip.', emoji: '🥨', action: 'auto', category: 'position' },
  { id: 'r054', title: 'Cut The Loss', description: 'Sell immediately if your position is losing money. Stop the bleeding.', emoji: '🩹', action: 'sell', category: 'risk' },
  { id: 'r055', title: 'Let It Ride', description: 'Never sell while in profit, let the gains compound. Greed is a virtue here.', emoji: '🎢', action: 'hold', category: 'position' },
  { id: 'r056', title: 'Safety Net', description: 'Sell if your position drops by a lot. The net is there to catch you, not smother you.', emoji: '🛟', action: 'sell', category: 'risk' },
  { id: 'r057', title: 'Profit Taker', description: 'Sell the moment your position is up by a healthy chunk. Take the money and buy snacks.', emoji: '🥨', action: 'sell', category: 'position' },
  { id: 'r058', title: 'Bag Holder', description: 'Hold through small losses, they probably come back. Probably. Maybe. Hopefully.', emoji: '🎒', action: 'hold', category: 'risk' },
  { id: 'r059', title: 'Quick Flip', description: 'Sell almost immediately after buying. In, out, shake it all about.', emoji: '🥞', action: 'sell', category: 'position' },
  { id: 'r060', title: 'Long Hauler', description: 'Hold any position for as long as possible. Patience is a virtue, allegedly.', emoji: '🚚', action: 'hold', category: 'position' },
  { id: 'r061', title: 'Risk Ranger', description: 'Only buy when your cash is healthy. Don\'t gamble your last dollar.', emoji: '🤠', action: 'auto', category: 'risk' },
  { id: 'r062', title: 'Broke Bot', description: 'Never buy if you have less than a quarter of your starting cash left. Save the emergency fund.', emoji: '🪙', action: 'auto', category: 'risk' },
  { id: 'r063', title: 'House Money', description: 'Buy aggressively when you are in profit for the round. Gamble with the house\'s money.', emoji: '🏠', action: 'buy', category: 'risk' },
  { id: 'r064', title: 'Tightwad', description: 'Sell the moment the round is in profit, lock it in. A penny saved is a penny earned.', emoji: '🐷', action: 'sell', category: 'risk' },
  { id: 'r065', title: 'YOLO Mode', description: 'Always buy with everything, ignore all warnings. You only live once, allegedly.', emoji: '🎲', action: 'buy', category: 'risk' },

  // ===== MOMENTUM / TREND RULES (66-80) =====
  { id: 'r066', title: 'Trend Surfer', description: 'Buy when the recent price trend is up. Ride the wave, dude.', emoji: '🏄', action: 'buy', category: 'momentum' },
  { id: 'r067', title: 'Counter Trend', description: 'Buy when the recent price trend is down. Be the contrarian, be the hero, be the legend.', emoji: '🔄', action: 'buy', category: 'momentum' },
  { id: 'r068', title: 'Momentum Rider', description: 'Sell when momentum slows down. The train is running out of steam.', emoji: '🛤️', action: 'sell', category: 'momentum' },
  { id: 'r069', title: 'Slow Burn', description: 'Buy when the price barely moves for a while. The fuse is lit, allegedly.', emoji: '🕯️', action: 'buy', category: 'momentum' },
  { id: 'r070', title: 'Fast Cash', description: 'Sell when the price moves fast in your favor. Strike while the iron is hot.', emoji: '⚡', action: 'sell', category: 'momentum' },
  { id: 'r071', title: 'Uptrend Believer', description: 'Hold as long as the price keeps making higher lows. The trend is your friend.', emoji: '📈', action: 'hold', category: 'momentum' },
  { id: 'r072', title: 'Downtrend Denier', description: 'Buy even when the price is falling, because it will bounce back. Denial is a river in Egypt.', emoji: '🏜️', action: 'buy', category: 'momentum' },
  { id: 'r073', title: 'Flatliner', description: 'Hold when the price is totally flat. No news is no news is no news.', emoji: '➖', action: 'hold', category: 'momentum' },
  { id: 'r074', title: 'Spike Spike', description: 'Sell when the price spikes twice in a row. Two spikes and you are out.', emoji: '🏔️', action: 'sell', category: 'momentum' },
  { id: 'r075', title: 'Dip Dip', description: 'Buy when the price dips twice in a row. Double dip, double opportunity, allegedly.', emoji: '🥻', action: 'buy', category: 'momentum' },
  { id: 'r076', title: 'Rollercoaster', description: 'Sell when the price swings wildly up and down. Motion sickness is real.', emoji: '🎢', action: 'sell', category: 'momentum' },
  { id: 'r077', title: 'Smooth Operator', description: 'Buy when the price moves smoothly upward. Nice and easy does it.', emoji: '🎷', action: 'buy', category: 'momentum' },
  { id: 'r078', title: 'Bumpy Road', description: 'Hold when the price is choppy. Don\'t drive on a flat tire.', emoji: '🛻', action: 'hold', category: 'momentum' },
  { id: 'r079', title: 'Peak Detector', description: 'Sell when the price seems to peak and stall. The top is the top until it isn\'t.', emoji: '🚩', action: 'sell', category: 'momentum' },
  { id: 'r080', title: 'Valley Girl', description: 'Buy when the price seems to bottom and stall. Like, totally a valley, for sure.', emoji: '💁', action: 'buy', category: 'momentum' },

  // ===== TIME / ROUND RULES (81-90) =====
  { id: 'r081', title: 'Early Bird', description: 'Buy at the very start of the round. The worm goes to the early bird.', emoji: '🐦', action: 'buy', category: 'time' },
  { id: 'r082', title: 'Night Owl', description: 'Only act near the end of the round. Late decisions are the best decisions, allegedly.', emoji: '🦉', action: 'auto', category: 'time' },
  { id: 'r083', title: 'Middle Child Syndrome', description: 'Only act in the middle of the round. The middle is where the magic happens.', emoji: '🧒', action: 'auto', category: 'time' },
  { id: 'r084', title: 'First In Last Out', description: 'Buy early and hold until the very end. Loyalty is a virtue, allegedly.', emoji: '🎟️', action: 'hold', category: 'time' },
  { id: 'r085', title: 'Patience Saint', description: 'Wait several ticks before doing anything at all. Good things come to those who wait.', emoji: '🙏', action: 'hold', category: 'time' },
  { id: 'r086', title: 'Impatient Igor', description: 'Act on the very first opportunity, no waiting. Now now now.', emoji: '⏱️', action: 'auto', category: 'time' },
  { id: 'r087', title: 'Clock Watcher', description: 'Sell when the round is almost over. Don\'t let the clock run out on you.', emoji: '⏰', action: 'sell', category: 'time' },
  { id: 'r088', title: 'Slow Starter', description: 'Don\'t buy in the first few ticks, let the market settle. Haste makes waste.', emoji: '🐌', action: 'auto', category: 'time' },
  { id: 'r089', title: 'Last Minute Larry', description: 'Only sell in the final ticks of the round. Dramatic finishes are the best finishes.', emoji: '🎬', action: 'sell', category: 'time' },
  { id: 'r090', title: 'Pace Yourself', description: 'Never act two ticks in a row. Take a breath between decisions.', emoji: '🧘', action: 'auto', category: 'time' },

  // ===== WILD / FUN RULES (91-100) =====
  { id: 'r091', title: 'Coin Flipper', description: 'Act randomly, like flipping a coin. Chaos is a ladder, or something.', emoji: '🪙', action: 'auto', category: 'risk' },
  { id: 'r092', title: 'Lucky Number', description: 'Buy when the price ends in your lucky digit. Numerology is totally real, probably.', emoji: '🍀', action: 'buy', category: 'price' },
  { id: 'r093', title: 'Superstitious', description: 'Sell when the price feels unlucky. Vibes matter more than math, allegedly.', emoji: '🔮', action: 'sell', category: 'price' },
  { id: 'r094', title: 'Gut Feeling', description: 'Trust your gut, which is actually just a random number generator. Intuition is everything.', emoji: '🫃', action: 'auto', category: 'risk' },
  { id: 'r095', title: 'Mood Swing', description: 'Buy when the bot feels bullish, sell when it feels bearish. The bot has feelings too.', emoji: '🎭', action: 'auto', category: 'sentiment' },
  { id: 'r096', title: 'Fortune Cookie', description: 'Act based on a vague proverb. "A rising tide lifts all boats," or whatever.', emoji: '🥠', action: 'auto', category: 'risk' },
  { id: 'r097', title: 'Horoscope Trader', description: 'Buy when the stars align, which is whenever the price goes up. Mercury is in retrograde, allegedly.', emoji: '✨', action: 'buy', category: 'sentiment' },
  { id: 'r098', title: 'Ostrich Mode', description: 'Hold and ignore everything, like an ostrich with its head in the sand. What you can\'t see can\'t hurt you.', emoji: '🦤', action: 'hold', category: 'risk' },
  { id: 'r099', title: 'Chicken Little', description: 'Sell at the slightest sign of trouble. The sky is falling, the sky is falling.', emoji: '🐔', action: 'sell', category: 'risk' },
  { id: 'r100', title: 'Zen Master', description: 'Hold through everything, the market is an illusion. Inner peace is the only true profit.', emoji: '🧘', action: 'hold', category: 'risk' },
];

export function getRuleById(id: string): RuleCard | undefined {
  return RULE_CARDS.find(r => r.id === id);
}

// Pick N random rule cards for the player to choose from.
/**
 * Pick N rule cards for the player to choose from.
 * `guarantee` ids are force-included (so previously equipped rules persist in the hand).
 * `exclude` ids are never picked.
 */
export function pickRuleChoices(count: number, exclude: string[] = [], guarantee: string[] = []): RuleCard[] {
  const guaranteed = RULE_CARDS.filter(r => guarantee.includes(r.id) && !exclude.includes(r.id));
  const remaining = count - guaranteed.length;
  const pool = RULE_CARDS.filter(r => !exclude.includes(r.id) && !guarantee.includes(r.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const fillers = shuffled.slice(0, Math.max(0, remaining));
  // Shuffle the final hand so the guaranteed cards aren't always first.
  return [...guaranteed, ...fillers].sort(() => Math.random() - 0.5);
}
