import { RuleCard } from '../types';

/**
 * 100 rule cards for the Trading Bot — ALL functional (buy/sell/hold).
 *
 * 7 categories with shared trigger + role + synergy tags:
 *   🔴 dip   (16) — price drops, fear, catching bottoms
 *   🟢 surge (16) — price rises, momentum, riding waves
 *   📰 news  (16) — headlines, sentiment, news streaks
 *   📊 pattern(16) — chart patterns: flat, choppy, trending
 *   💰 position(14) — holdings, profit/loss, cash level
 *   ⏰ timing (12) — round timing: early, mid, late
 *   ⚡ wild   (10) — YOLO, random, gambler's fallacy
 *
 * ponytail: ceiling — conditions are evaluated by id in botEngine.ts with
 * hardcoded checks. Good enough for casual play.
 */
export const RULE_CARDS: RuleCard[] = [
  // ===== 🔴 DIP CARDS (16) =====
  { id: 'c001', title: 'Dip Buyer', description: "Buy when the price drops 5%+ in one tick. Someone is screaming into a pillow — that's your entry.", emoji: '🛒', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['surge'], comboId: 'dip_and_rip' },
  { id: 'c002', title: 'Double Down', description: 'Buy more when price falls below your average entry. Averaging down, or so the forums say.', emoji: '⬇️', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['position'] },
  { id: 'c003', title: 'Whale Wake', description: 'Buy right after a big drop, assuming a whale just dumped and the tide will turn.', emoji: '🐋', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['pattern'] },
  { id: 'c004', title: 'Bounce Believer', description: 'Buy when price bounces up after hitting a low. Rubber balls and stocks both bounce, sometimes.', emoji: '🎾', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['pattern'] },
  { id: 'c005', title: 'Blood Bath', description: 'Buy when the price crashes 6%+ in one tick. Maximum fear = maximum opportunity.', emoji: '🦈', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['surge'] },
  { id: 'c006', title: 'Reversal Rider', description: 'Buy when price bounces after dropping 2+ ticks in a row. The tide is turning.', emoji: '🌊', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['pattern'] },
  { id: 'c007', title: 'Valley Hunter', description: "Buy when price is near its recent low AND flat. Bargain bin energy.", emoji: '🧹', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['pattern'] },
  { id: 'c008', title: 'Quiet Dip', description: 'Buy when price dips twice in a row but settles flat. Overreaction correction.', emoji: '↔️', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['pattern'] },
  { id: 'c009', title: 'Dip Seller', description: "Sell when price keeps sliding with no bounce. Don't catch a falling knife.", emoji: '🍌', action: 'sell', category: 'dip', triggerTag: 'dip', roleTag: 'exit', synergyTags: ['position'] },
  { id: 'c010', title: 'Falling Knife', description: 'Sell if your position drops 8%+ from entry. The net is there to catch you.', emoji: '🩹', action: 'sell', category: 'dip', triggerTag: 'dip', roleTag: 'exit', synergyTags: ['position'] },
  { id: 'c011', title: 'Panic Exit', description: 'Sell the moment price drops below your average buy price. Cut and run.', emoji: '😱', action: 'sell', category: 'dip', triggerTag: 'dip', roleTag: 'exit', synergyTags: ['position'] },
  { id: 'c012', title: 'Red Dump', description: 'Sell immediately when the price drops 5%+ in one tick. Cut the bleeding.', emoji: '🏃', action: 'sell', category: 'dip', triggerTag: 'dip', roleTag: 'exit', synergyTags: ['pattern'] },
  { id: 'c013', title: 'Dip Holder', description: "Hold through small dips (<3%). It's just a scratch.", emoji: '🛡️', action: 'hold', category: 'dip', triggerTag: 'dip', roleTag: 'hold', synergyTags: ['surge'] },
  { id: 'c014', title: 'Recovery Wait', description: 'Hold at a loss, waiting for the bounce. Patience is a virtue, allegedly.', emoji: '⏳', action: 'hold', category: 'dip', triggerTag: 'dip', roleTag: 'hold', synergyTags: ['dip'] },
  { id: 'c015', title: 'Fearless', description: 'Hold when price drops twice in a row. Two red ticks are just noise.', emoji: '🥜', action: 'hold', category: 'dip', triggerTag: 'dip', roleTag: 'hold', synergyTags: ['surge'] },
  { id: 'c016', title: 'Averaging Down', description: 'Buy when price is below entry AND you still have cash. More shares, lower cost.', emoji: '📉', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['position'] },

  // ===== 🟢 SURGE CARDS (16) =====
  { id: 'c017', title: 'Peak Chaser', description: 'Buy when price makes a new local high. Momentum is a hell of a drug.', emoji: '🏔️', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['pattern'] },
  { id: 'c018', title: 'Momentum Entry', description: 'Buy when the price ticks up three times in a row. Slow and steady.', emoji: '🐢', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['pattern'], comboId: 'momentum_train' },
  { id: 'c019', title: 'Rocket Fuel', description: 'Buy when price jumps 4%+ in one tick. To the moon, allegedly.', emoji: '🚀', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['dip'] },
  { id: 'c020', title: 'Smooth Operator', description: 'Buy when price trends up smoothly. Nice and easy does it.', emoji: '🎷', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['pattern'] },
  { id: 'c021', title: 'Thrust Buyer', description: 'Buy when price jumps 3%+ in one tick. Catch the momentum rocket.', emoji: '🌈', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['dip'] },
  { id: 'c022', title: 'Trend Surfer', description: 'Buy when the recent trend is up. Ride the wave, dude.', emoji: '🏄', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['pattern'], comboId: 'momentum_train' },
  { id: 'c023', title: 'Breakout Buyer', description: 'Buy when price breaks above its recent range. Breaking free!', emoji: '🔓', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['pattern'] },
  { id: 'c024', title: 'Green Streak', description: 'Buy when price is rising with a 2%+ spike. Green candles attract more green.', emoji: '🦜', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['pattern'] },
  { id: 'c025', title: 'Profit Taker', description: 'Sell when your position is up 10%+. Take the money and buy snacks.', emoji: '🥨', action: 'sell', category: 'surge', triggerTag: 'surge', roleTag: 'exit', synergyTags: ['position'], comboId: 'dip_and_rip' },
  { id: 'c026', title: 'Peak Seller', description: 'Sell when price hits a local high and stalls. What goes up...', emoji: '🪜', action: 'sell', category: 'surge', triggerTag: 'surge', roleTag: 'exit', synergyTags: ['pattern'], comboId: 'momentum_train' },
  { id: 'c027', title: 'Spike Exit', description: 'Sell when price spikes 6%+ in one tick. What goes straight up...', emoji: '🪂', action: 'sell', category: 'surge', triggerTag: 'surge', roleTag: 'exit', synergyTags: ['dip'] },
  { id: 'c028', title: 'Momentum Lock', description: 'Sell after 3 consecutive green ticks. The streak will break eventually.', emoji: '🔥', action: 'sell', category: 'surge', triggerTag: 'surge', roleTag: 'exit', synergyTags: ['pattern'] },
  { id: 'c029', title: 'Trend Rider', description: 'Hold as long as price keeps making higher lows. The trend is your friend.', emoji: '📈', action: 'hold', category: 'surge', triggerTag: 'surge', roleTag: 'hold', synergyTags: ['pattern'], comboId: 'momentum_train' },
  { id: 'c030', title: 'Momentum Hold', description: "Hold while in profit and trend is up. Don't jump off a moving train.", emoji: '🚂', action: 'hold', category: 'surge', triggerTag: 'surge', roleTag: 'hold', synergyTags: ['position'] },
  { id: 'c031', title: "Winner's Hold", description: 'Hold while in profit with a 2%+ spike. Let the winners ride.', emoji: '🎯', action: 'hold', category: 'surge', triggerTag: 'surge', roleTag: 'hold', synergyTags: ['pattern'] },
  { id: 'c032', title: 'Let It Ride', description: "Hold while in profit, don't sell yet. Greed is a virtue here.", emoji: '🎢', action: 'hold', category: 'surge', triggerTag: 'surge', roleTag: 'hold', synergyTags: ['position'] },

  // ===== � TREND CARDS (replacing news cards c033-c048) =====
  { id: 'c033', title: 'Green Rider', description: 'Hold when price ticks up twice in a row. Ride the green wave.', emoji: '🦜', action: 'hold', category: 'pattern', triggerTag: 'pattern', roleTag: 'hold', synergyTags: ['surge'] },
  { id: 'c034', title: 'Red Rider', description: 'Hold when price ticks down twice in a row. Stay strong through the slide.', emoji: '🌧️', action: 'hold', category: 'pattern', triggerTag: 'pattern', roleTag: 'hold', synergyTags: ['dip'] },
  { id: 'c035', title: 'Big Green', description: 'Buy when price spikes 4%+ in a single tick. Ride the rocket.', emoji: '🤑', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['surge'] },
  { id: 'c036', title: 'Big Red', description: 'Sell when price drops 4%+ in a single tick. Don\'t ride the cliff.', emoji: '🏃', action: 'sell', category: 'dip', triggerTag: 'dip', roleTag: 'exit', synergyTags: ['dip'] },
  { id: 'c037', title: 'Flat Entry', description: 'Buy when price is flat and you have cash. Something is about to happen.', emoji: '🗣️', action: 'buy', category: 'pattern', triggerTag: 'pattern', roleTag: 'entry', synergyTags: ['pattern'] },
  { id: 'c038', title: 'Flat Hold', description: 'Hold when price is flat. Boring is sometimes the play.', emoji: '😴', action: 'hold', category: 'pattern', triggerTag: 'pattern', roleTag: 'hold', synergyTags: ['pattern'] },
  { id: 'c039', title: 'Streak Rider', description: "Hold while price keeps rising. Don't jump off a moving train.", emoji: '🚂', action: 'hold', category: 'surge', triggerTag: 'surge', roleTag: 'hold', synergyTags: ['surge'] },
  { id: 'c040', title: 'Slide Hold', description: 'Hold through a downtrend. Patience through the red.', emoji: '🫣', action: 'hold', category: 'dip', triggerTag: 'dip', roleTag: 'hold', synergyTags: ['dip'] },
  { id: 'c041', title: 'Early Green', description: 'Buy on the first 2%+ spike of the round. First impressions matter.', emoji: '👀', action: 'buy', category: 'timing', triggerTag: 'timing', roleTag: 'entry', synergyTags: ['surge'] },
  { id: 'c042', title: 'Quick Exit', description: 'Sell on any tick after buying. Better safe than sorry.', emoji: '🩺', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['position'] },
  { id: 'c043', title: 'Contrarian Buy', description: 'Buy on a 3%+ dip. Be greedy when the chart is bloody.', emoji: '🤡', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['dip'] },
  { id: 'c044', title: 'Top Caller', description: 'Sell when price spikes 4%+ in a tick while holding. Be the smart money.', emoji: '🎯', action: 'sell', category: 'surge', triggerTag: 'surge', roleTag: 'exit', synergyTags: ['surge'] },
  { id: 'c045', title: 'Small Green Greed', description: 'Buy on any 2%+ uptick. Small gains add up.', emoji: '☀️', action: 'buy', category: 'surge', triggerTag: 'surge', roleTag: 'entry', synergyTags: ['surge'] },
  { id: 'c046', title: 'Small Red Panic', description: 'Sell on any 2%+ downtick. Small drops become big ones.', emoji: '☁️', action: 'sell', category: 'dip', triggerTag: 'dip', roleTag: 'exit', synergyTags: ['dip'] },
  { id: 'c047', title: 'Dip Flip Entry', description: 'Buy when price bounced after two drops. The reversal is here.', emoji: '↪️', action: 'buy', category: 'dip', triggerTag: 'dip', roleTag: 'entry', synergyTags: ['dip'] },
  { id: 'c048', title: 'Peak Flip Exit', description: 'Sell when price dips after two rises. The run is over.', emoji: '↩️', action: 'sell', category: 'surge', triggerTag: 'surge', roleTag: 'exit', synergyTags: ['surge'] },

  // ===== 📊 PATTERN CARDS (16) =====
  { id: 'c049', title: 'Flatline Buyer', description: 'Buy when price is flat for 3+ ticks. The calm before the storm.', emoji: '🕯️', action: 'buy', category: 'pattern', triggerTag: 'pattern', roleTag: 'entry', synergyTags: ['surge'] },
  { id: 'c050', title: 'Breakout Entry', description: 'Buy when price breaks above resistance after being flat. Here we go!', emoji: '💥', action: 'buy', category: 'pattern', triggerTag: 'pattern', roleTag: 'entry', synergyTags: ['surge'] },
  { id: 'c051', title: 'Choppy Exit', description: 'Sell when price is swinging wildly. Motion sickness is real.', emoji: '🎢', action: 'sell', category: 'pattern', triggerTag: 'pattern', roleTag: 'exit', synergyTags: ['position'] },
  { id: 'c052', title: 'After Storm', description: 'Sell after a big move when price stabilizes. Catch the exit wave.', emoji: '🌊', action: 'sell', category: 'pattern', triggerTag: 'pattern', roleTag: 'exit', synergyTags: ['position'], comboId: 'volatility_play' },
  { id: 'c053', title: 'Smooth Hold', description: 'Hold when price trends smoothly in your favor. No need to fix what works.', emoji: '🎷', action: 'hold', category: 'pattern', triggerTag: 'pattern', roleTag: 'hold', synergyTags: ['surge'] },
  { id: 'c054', title: 'Volatility Hold', description: "Hold when price is choppy. Don't drive on a flat tire.", emoji: '🛻', action: 'hold', category: 'pattern', triggerTag: 'pattern', roleTag: 'hold', synergyTags: ['position'] },
  { id: 'c055', title: 'Double Dip Buyer', description: 'Buy when price dips twice in a row. Double dip, double opportunity.', emoji: '🥻', action: 'buy', category: 'pattern', triggerTag: 'pattern', roleTag: 'entry', synergyTags: ['dip'] },
  { id: 'c056', title: 'Breakdown Seller', description: 'Sell when price breaks below its recent range. Get out before the floor falls.', emoji: '🚩', action: 'sell', category: 'pattern', triggerTag: 'pattern', roleTag: 'exit', synergyTags: ['dip'] },
  { id: 'c057', title: 'Resistance Seller', description: 'Sell when price stalls at a recent high. The ceiling is real.', emoji: '🧱', action: 'sell', category: 'pattern', triggerTag: 'pattern', roleTag: 'exit', synergyTags: ['surge'] },
  { id: 'c058', title: 'Support Buyer', description: 'Buy when price bounces at a recent low. The floor holds.', emoji: '🏗️', action: 'buy', category: 'pattern', triggerTag: 'pattern', roleTag: 'entry', synergyTags: ['dip'] },
  { id: 'c059', title: 'Trend Continuation', description: "Hold as long as the current trend continues. Don't overthink it.", emoji: '➡️', action: 'hold', category: 'pattern', triggerTag: 'pattern', roleTag: 'hold', synergyTags: ['surge'] },
  { id: 'c060', title: 'Range Trader', description: 'Buy when price is in the middle of its range trending up. Sweet spot.', emoji: '🎯', action: 'buy', category: 'pattern', triggerTag: 'pattern', roleTag: 'entry', synergyTags: ['pattern'] },
  { id: 'c061', title: 'Range Exit', description: 'Sell when price is in the middle of its range trending down. Bounce off.', emoji: '🎯', action: 'sell', category: 'pattern', triggerTag: 'pattern', roleTag: 'exit', synergyTags: ['pattern'] },
  { id: 'c062', title: 'Calm Before Storm', description: 'Buy when price is very flat, expecting a breakout. The fuse is lit.', emoji: '🧨', action: 'buy', category: 'pattern', triggerTag: 'pattern', roleTag: 'entry', synergyTags: ['surge'], comboId: 'volatility_play' },
  { id: 'c063', title: 'Stationary Signal', description: "Buy when price barely moves for a while. Something's about to happen.", emoji: '📡', action: 'buy', category: 'pattern', triggerTag: 'pattern', roleTag: 'entry', synergyTags: ['surge'] },
  { id: 'c064', title: 'Spike Seller', description: 'Sell when the price spikes twice in a row. Two spikes and you are out.', emoji: '🏔️', action: 'sell', category: 'pattern', triggerTag: 'pattern', roleTag: 'exit', synergyTags: ['surge'] },

  // ===== 💰 POSITION CARDS (14) =====
  { id: 'c065', title: 'All In', description: 'Buy with everything you have, every single time. Go big or go home.', emoji: '🎰', action: 'buy', category: 'position', triggerTag: 'position', roleTag: 'entry', synergyTags: ['wild'], comboId: 'yolo_moon' },
  { id: 'c066', title: 'No Position Entry', description: "Always buy if you currently hold nothing. Can't make money on the sidelines.", emoji: '🪑', action: 'buy', category: 'position', triggerTag: 'position', roleTag: 'entry', synergyTags: ['timing'], comboId: 'safe_haven' },
  { id: 'c067', title: 'Paper Hands', description: 'Sell the moment you have any profit at all. A win is a win.', emoji: '📄', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['dip'] },
  { id: 'c068', title: 'Diamond Hands', description: 'Never sell at a loss. Hold until profit appears or the heat death of the universe.', emoji: '💎', action: 'hold', category: 'position', triggerTag: 'position', roleTag: 'hold', synergyTags: ['surge'], comboId: 'safe_haven' },
  { id: 'c069', title: 'Cut The Loss', description: 'Sell immediately at any loss. Stop the bleeding.', emoji: '🩹', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['dip'] },
  { id: 'c070', title: 'Safety Net', description: 'Sell if your position drops 8%+. The net catches you, not smothers you.', emoji: '🛟', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['dip'] },
  { id: 'c071', title: 'Bag Holder', description: 'Hold through small losses (<5%). They probably come back. Probably.', emoji: '🎒', action: 'hold', category: 'position', triggerTag: 'position', roleTag: 'hold', synergyTags: ['dip'] },
  { id: 'c072', title: 'Greedy Exit', description: "Only sell when profit is 20%+. Hold out for the big slice.", emoji: '🍕', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['surge'] },
  { id: 'c073', title: 'Cash Guard', description: 'Only buy if you have more than half your starting cash. Save the emergency fund.', emoji: '🐷', action: 'buy', category: 'position', triggerTag: 'position', roleTag: 'entry', synergyTags: ['timing'], comboId: 'safe_haven' },
  { id: 'c074', title: 'Profit Lock', description: "Sell if the round is currently in profit. Lock it in, don't get greedy.", emoji: '🔒', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['timing'] },
  { id: 'c075', title: 'Position Momentum', description: 'Hold while in profit AND trend is up. Let the winners run.', emoji: '🏃', action: 'hold', category: 'position', triggerTag: 'position', roleTag: 'hold', synergyTags: ['surge'] },
  { id: 'c076', title: 'Quick Flip', description: 'Sell almost immediately after buying. In, out, shake it all about.', emoji: '🥞', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['timing'], comboId: 'scalper' },
  { id: 'c077', title: 'Re-Entry', description: 'Buy right after selling. Second chance, better entry.', emoji: '♻️', action: 'buy', category: 'position', triggerTag: 'position', roleTag: 'entry', synergyTags: ['timing'] },
  { id: 'c078', title: 'Scaled Exit', description: 'Sell when profit hits 15%. Sweet spot between greed and fear.', emoji: '⚖️', action: 'sell', category: 'position', triggerTag: 'position', roleTag: 'exit', synergyTags: ['surge'] },

  // ===== ⏰ TIMER CARDS (12) =====
  { id: 'c079', title: 'Early Bird', description: 'Buy at the very start of the round. The worm goes to the early bird.', emoji: '🐦', action: 'buy', category: 'timing', triggerTag: 'timing', roleTag: 'entry', synergyTags: ['position'], comboId: 'scalper' },
  { id: 'c080', title: 'Late Exit', description: "Sell in the last 25% of the round. Don't let the clock run out.", emoji: '⏰', action: 'sell', category: 'timing', triggerTag: 'timing', roleTag: 'exit', synergyTags: ['position'] },
  { id: 'c081', title: 'First In Last Out', description: 'Buy early and hold until the very end. Loyalty is a virtue.', emoji: '🎟️', action: 'hold', category: 'timing', triggerTag: 'timing', roleTag: 'hold', synergyTags: ['surge'] },
  { id: 'c082', title: 'Patience', description: 'Wait the first 3 ticks before doing anything. Good things come to those who wait.', emoji: '🙏', action: 'hold', category: 'timing', triggerTag: 'timing', roleTag: 'hold', synergyTags: ['pattern'] },
  { id: 'c083', title: 'Clock Watcher', description: 'Sell when the round is 75%+ done. Dramatic exits only.', emoji: '🕐', action: 'sell', category: 'timing', triggerTag: 'timing', roleTag: 'exit', synergyTags: ['position'], comboId: 'safe_haven' },
  { id: 'c084', title: 'Impulse', description: 'Buy on the very first opportunity. Now now now.', emoji: '⏱️', action: 'buy', category: 'timing', triggerTag: 'timing', roleTag: 'entry', synergyTags: ['dip'] },
  { id: 'c085', title: 'Mid-Round Entry', description: 'Buy in the middle third of the round. Let the dust settle first.', emoji: '🧒', action: 'buy', category: 'timing', triggerTag: 'timing', roleTag: 'entry', synergyTags: ['pattern'] },
  { id: 'c086', title: 'Mid-Round Exit', description: "Sell in the middle third of the round. Don't wait too long.", emoji: '🚪', action: 'sell', category: 'timing', triggerTag: 'timing', roleTag: 'exit', synergyTags: ['position'] },
  { id: 'c087', title: 'Last Minute', description: 'Sell in the final 2 ticks. Cutting it close, but dramatic.', emoji: '🎬', action: 'sell', category: 'timing', triggerTag: 'timing', roleTag: 'exit', synergyTags: ['position'] },
  { id: 'c088', title: 'Slow Start', description: "Don't buy in the first 3 ticks. Let the market settle.", emoji: '🐌', action: 'hold', category: 'timing', triggerTag: 'timing', roleTag: 'hold', synergyTags: ['pattern'] },
  { id: 'c089', title: 'Second Wind', description: 'Buy in the second half of the round. Late game heroics.', emoji: '💨', action: 'buy', category: 'timing', triggerTag: 'timing', roleTag: 'entry', synergyTags: ['surge'] },
  { id: 'c090', title: 'Timer Hold', description: 'Hold for at least 3 ticks before considering selling. Patience.', emoji: '⏳', action: 'hold', category: 'timing', triggerTag: 'timing', roleTag: 'hold', synergyTags: ['surge'] },

  // ===== ⚡ WILD CARDS (10) =====
  { id: 'c091', title: 'YOLO', description: 'Always buy with everything. You only live once, allegedly.', emoji: '🎲', action: 'buy', category: 'wild', triggerTag: 'wild', roleTag: 'entry', synergyTags: [] },
  { id: 'c092', title: 'Lucky Number', description: 'Buy when the price ends in 7. Numerology is totally real.', emoji: '🍀', action: 'buy', category: 'wild', triggerTag: 'wild', roleTag: 'entry', synergyTags: [] },
  { id: 'c093', title: 'Unlucky Exit', description: 'Sell when the price ends in 4. Bad juju, bad number.', emoji: '🔮', action: 'sell', category: 'wild', triggerTag: 'wild', roleTag: 'exit', synergyTags: [] },
  { id: 'c094', title: 'Moon Shot', description: 'Hold forever, ride to the moon or crash. No in-between.', emoji: '🌙', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['position'], comboId: 'yolo_moon' },
  { id: 'c095', title: 'Panic Button', description: "Sell at ANY sign of trouble. One red candle and you're out.", emoji: '🚨', action: 'sell', category: 'wild', triggerTag: 'wild', roleTag: 'exit', synergyTags: ['dip'] },
  { id: 'c096', title: "Gambler's Fallacy", description: 'Buy after 3+ drops. It HAS to bounce, right? Right??', emoji: '🎰', action: 'buy', category: 'wild', triggerTag: 'wild', roleTag: 'entry', synergyTags: ['dip'] },
  { id: 'c097', title: 'Hot Hand', description: 'Buy after 3+ rises. The streak continues, probably!', emoji: '🔥', action: 'buy', category: 'wild', triggerTag: 'wild', roleTag: 'entry', synergyTags: ['surge'] },
  { id: 'c098', title: 'Chicken Little', description: 'Sell at the slightest sign of trouble. The sky is falling!', emoji: '🐔', action: 'sell', category: 'wild', triggerTag: 'wild', roleTag: 'exit', synergyTags: [] },
  { id: 'c099', title: 'Zen Master', description: 'Hold through everything. The market is an illusion.', emoji: '🧘', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: [] },
  { id: 'c100', title: 'Combo Master', description: 'Hold until 2+ other cards have fired this round. Then let chaos reign.', emoji: '🃏', action: 'hold', category: 'wild', triggerTag: 'wild', roleTag: 'hold', synergyTags: ['dip', 'surge', 'pattern'] },
];

export function getRuleById(id: string): RuleCard | undefined {
  return RULE_CARDS.find(r => r.id === id);
}

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
  return [...guaranteed, ...fillers].sort(() => Math.random() - 0.5);
}
