import { RoundGoal } from '../types';

/**
 * 100 rounds for Trading Bot Tycoon.
 *
 * Every 4th round (4, 8, 12, ...) is a BOSS round with a much harder goal.
 * Goals are evaluated against the round's starting bankroll (RoundEvalContext).
 *
 * ponytail: ceiling — goals are simple threshold checks, not a real achievement engine.
 */
export const ROUNDS: RoundGoal[] = [
  // ===== ACT 1: BABY STEPS (1-4) =====
  { id: 1, title: 'First Day On The Job', goal: 'Don\'t lose any money', description: 'Just don\'t end the round with less than you started with. Surely you can manage that.', isBoss: false, emoji: '🍼', evaluate: ctx => ctx.endCash >= ctx.startCash },
  { id: 2, title: 'Lemonade Stand', goal: 'Make $1 in profit', description: 'Earn a single dollar. A child with a lemonade stand can do this.', isBoss: false, emoji: '🍋', evaluate: ctx => ctx.roundProfit >= 1 },
  { id: 3, title: 'Pocket Change', goal: 'Have at least 5% return', description: 'Grow your bankroll by 5%. That\'s like, a decent coupon.', isBoss: false, emoji: '🪙', evaluate: ctx => ctx.returnPercent >= 5 },
  { id: 4, title: 'BOSS: The Big Leagues', goal: 'Have at least 40% return', description: 'A 40% return in one round. Wall Street would kill for this. Good luck.', isBoss: true, emoji: '👹', evaluate: ctx => ctx.returnPercent >= 40 },

  // ===== ACT 2: WARMING UP (5-8) =====
  { id: 5, title: 'Big Spender', goal: 'Make $100 from a single trade', description: 'One trade, one hundred bucks. Find a winner and ride it.', isBoss: false, emoji: '💵', evaluate: ctx => ctx.biggestSingleTradeProfit >= 100 },
  { id: 6, title: 'Double Digits', goal: 'Make at least $10 in profit', description: 'Ten whole dollars. You can buy a fancy sandwich with that.', isBoss: false, emoji: '🥪', evaluate: ctx => ctx.roundProfit >= 10 },
  { id: 7, title: 'Percent Player', goal: 'Have at least 10% return', description: 'A 10% return. Mutual funds wish they were you.', isBoss: false, emoji: '📊', evaluate: ctx => ctx.returnPercent >= 10 },
  { id: 8, title: 'BOSS: Centurion', goal: 'Make $100 in profit', description: 'One hundred dollars of pure profit in a single round. The big boss is watching.', isBoss: true, emoji: '👺', evaluate: ctx => ctx.roundProfit >= 100 },

  // ===== ACT 3: GETTING SERIOUS (9-12) =====
  { id: 9, title: 'Streak Keeper', goal: 'Don\'t lose any money', description: 'Back to basics. Don\'t end the round in the red. Consistency is key.', isBoss: false, emoji: '🔑', evaluate: ctx => ctx.endCash >= ctx.startCash },
  { id: 10, title: 'Quarter Master', goal: 'Have at least 25% return', description: 'A 25% return. You\'re cooking with gas now.', isBoss: false, emoji: '🍳', evaluate: ctx => ctx.returnPercent >= 25 },
  { id: 11, title: 'Half Grand', goal: 'Make $500 in profit', description: 'Five hundred dollars of profit. That\'s a nice weekend.', isBoss: false, emoji: '🏖️', evaluate: ctx => ctx.roundProfit >= 500 },
  { id: 12, title: 'BOSS: Doubler', goal: 'Double your money (100% return)', description: 'Double your entire bankroll in one round. This is where legends are made.', isBoss: true, emoji: '🐉', evaluate: ctx => ctx.returnPercent >= 100 },

  // ===== ACT 4: HIGH ROLLER (13-16) =====
  { id: 13, title: 'Thousand Club', goal: 'Make $1,000 in profit', description: 'One thousand dollars of profit. Welcome to the club.', isBoss: false, emoji: '🎟️', evaluate: ctx => ctx.roundProfit >= 1000 },
  { id: 14, title: 'Fifty Fifty', goal: 'Have at least 50% return', description: 'A 50% return. Half again as much as you started with.', isBoss: false, emoji: '⚖️', evaluate: ctx => ctx.returnPercent >= 50 },
  { id: 15, title: 'Big Trade Energy', goal: 'Make $2,000 from a single trade', description: 'One trade, two grand. Find the rocket and hold on tight.', isBoss: false, emoji: '🚀', evaluate: ctx => ctx.biggestSingleTradeProfit >= 2000 },
  { id: 16, title: 'BOSS: Triple Threat', goal: 'Triple your money (200% return)', description: 'Triple your bankroll in one round. This is genuinely hard. Good luck.', isBoss: true, emoji: '👹', evaluate: ctx => ctx.returnPercent >= 200 },

  // ===== ACT 5: WHALE TERRITORY (17-20) =====
  { id: 17, title: 'Two Grand Plan', goal: 'Make $2,000 in profit', description: 'Two thousand dollars of profit. The whale tank is filling up.', isBoss: false, emoji: '🐋', evaluate: ctx => ctx.roundProfit >= 2000 },
  { id: 18, title: 'Seventy Five', goal: 'Have at least 75% return', description: 'A 75% return. Almost doubled. So close you can taste it.', isBoss: false, emoji: '👅', evaluate: ctx => ctx.returnPercent >= 75 },
  { id: 19, title: 'Five Grand Slam', goal: 'Make $5,000 in profit', description: 'Five thousand dollars of profit. That\'s a used car.', isBoss: false, emoji: '🚗', evaluate: ctx => ctx.roundProfit >= 5000 },
  { id: 20, title: 'BOSS: Quadruple', goal: 'Quadruple your money (300% return)', description: 'Four times your bankroll in one round. This is absurd. You can do it.', isBoss: true, emoji: '👺', evaluate: ctx => ctx.returnPercent >= 300 },

  // ===== ACT 6: TITAN (21-24) =====
  { id: 21, title: 'Ten K Day', goal: 'Make $10,000 in profit', description: 'Ten thousand dollars of profit. A very good day at the office.', isBoss: false, emoji: '🏢', evaluate: ctx => ctx.roundProfit >= 10000 },
  { id: 22, title: 'Mega Trade', goal: 'Make $10,000 from a single trade', description: 'One trade, ten grand. Find the unicorn and ride it into the sunset.', isBoss: false, emoji: '🦄', evaluate: ctx => ctx.biggestSingleTradeProfit >= 10000 },
  { id: 23, title: 'Hundred Club', goal: 'Have at least 100% return', description: 'Double your money again. You\'ve done this before, right?', isBoss: false, emoji: '💯', evaluate: ctx => ctx.returnPercent >= 100 },
  { id: 24, title: 'BOSS: Quintuple', goal: 'Quintuple your money (400% return)', description: 'Five times your bankroll. This is the kind of round that breaks people.', isBoss: true, emoji: '🐉', evaluate: ctx => ctx.returnPercent >= 400 },

  // ===== ACT 7: LEGEND (25-28) =====
  { id: 25, title: 'Twenty Five K', goal: 'Make $25,000 in profit', description: 'Twenty-five thousand dollars of profit. That\'s a down payment on a house.', isBoss: false, emoji: '🏠', evaluate: ctx => ctx.roundProfit >= 25000 },
  { id: 26, title: 'Fifty K Flip', goal: 'Make $50,000 in profit', description: 'Fifty thousand dollars of profit. You could buy a Tesla and crash it.', isBoss: false, emoji: '⚡', evaluate: ctx => ctx.roundProfit >= 50000 },
  { id: 27, title: 'Hundred K Hero', goal: 'Make $100,000 in profit', description: 'One hundred thousand dollars of profit. Six figures, baby.', isBoss: false, emoji: '🦸', evaluate: ctx => ctx.roundProfit >= 100000 },
  { id: 28, title: 'BOSS: Ten X', goal: '10x your money (900% return)', description: 'Ten times your bankroll in one round. This is genuinely insane. Go.', isBoss: true, emoji: '👹', evaluate: ctx => ctx.returnPercent >= 900 },

  // ===== ACT 8: MYTHIC (29-32) =====
  { id: 29, title: 'Two Fifty K', goal: 'Make $250,000 in profit', description: 'A quarter million dollars of profit. You\'re basically rich now.', isBoss: false, emoji: '💰', evaluate: ctx => ctx.roundProfit >= 250000 },
  { id: 30, title: 'Half Million', goal: 'Make $500,000 in profit', description: 'Half a million dollars of profit. You could buy a small island.', isBoss: false, emoji: '🏝️', evaluate: ctx => ctx.roundProfit >= 500000 },
  { id: 31, title: 'Millionaire Maker', goal: 'Make $1,000,000 in profit', description: 'One million dollars of profit. Welcome to the seven figure club.', isBoss: false, emoji: '🤑', evaluate: ctx => ctx.roundProfit >= 1000000 },
  { id: 32, title: 'BOSS: Twenty X', goal: '20x your money (1900% return)', description: 'Twenty times your bankroll. This is the kind of round that makes or breaks a tycoon.', isBoss: true, emoji: '👺', evaluate: ctx => ctx.returnPercent >= 1900 },

  // ===== ACT 9: ASCENDED (33-36) =====
  { id: 33, title: 'Two Million', goal: 'Make $2,000,000 in profit', description: 'Two million dollars of profit. You can buy a very nice house now.', isBoss: false, emoji: '🏡', evaluate: ctx => ctx.roundProfit >= 2000000 },
  { id: 34, title: 'Five Million', goal: 'Make $5,000,000 in profit', description: 'Five million dollars of profit. You\'re in the big leagues now.', isBoss: false, emoji: '🏟️', evaluate: ctx => ctx.roundProfit >= 5000000 },
  { id: 35, title: 'Ten Million', goal: 'Make $10,000,000 in profit', description: 'Ten million dollars of profit. You can buy a private jet.', isBoss: false, emoji: '✈️', evaluate: ctx => ctx.roundProfit >= 10000000 },
  { id: 36, title: 'BOSS: Fifty X', goal: '50x your money (4900% return)', description: 'Fifty times your bankroll. This is the kind of round that breaks reality.', isBoss: true, emoji: '🐉', evaluate: ctx => ctx.returnPercent >= 4900 },

  // ===== ACT 10: GODLIKE (37-40) =====
  { id: 37, title: 'Twenty Five Million', goal: 'Make $25,000,000 in profit', description: 'Twenty-five million dollars of profit. You can buy a sports team.', isBoss: false, emoji: '🏀', evaluate: ctx => ctx.roundProfit >= 25000000 },
  { id: 38, title: 'Fifty Million', goal: 'Make $50,000,000 in profit', description: 'Fifty million dollars of profit. You can buy a skyscraper.', isBoss: false, emoji: '🏙️', evaluate: ctx => ctx.roundProfit >= 50000000 },
  { id: 39, title: 'Hundred Million', goal: 'Make $100,000,000 in profit', description: 'One hundred million dollars of profit. You are now a tycoon.', isBoss: false, emoji: '👑', evaluate: ctx => ctx.roundProfit >= 100000000 },
  { id: 40, title: 'BOSS: Hundred X', goal: '100x your money (9900% return)', description: 'One hundred times your bankroll. This is the final boss of trading. Go.', isBoss: true, emoji: '👹', evaluate: ctx => ctx.returnPercent >= 9900 },

  // ===== ACT 11: TRANSCENDENT (41-44) =====
  { id: 41, title: 'Quarter Billion', goal: 'Make $250,000,000 in profit', description: 'A quarter billion dollars of profit. You can buy a small country.', isBoss: false, emoji: '🌍', evaluate: ctx => ctx.roundProfit >= 250000000 },
  { id: 42, title: 'Half Billion', goal: 'Make $500,000,000 in profit', description: 'Half a billion dollars of profit. You can buy a big country.', isBoss: false, emoji: '🌐', evaluate: ctx => ctx.roundProfit >= 500000000 },
  { id: 43, title: 'Billionaire', goal: 'Make $1,000,000,000 in profit', description: 'One billion dollars of profit. Welcome to the three comma club.', isBoss: false, emoji: '🦅', evaluate: ctx => ctx.roundProfit >= 1000000000 },
  { id: 44, title: 'BOSS: Thousand X', goal: '1000x your money (99900% return)', description: 'One thousand times your bankroll. This is mathematically terrifying.', isBoss: true, emoji: '👺', evaluate: ctx => ctx.returnPercent >= 99900 },

  // ===== ACT 12: COSMIC (45-48) =====
  { id: 45, title: 'Two Billion', goal: 'Make $2,000,000,000 in profit', description: 'Two billion dollars of profit. You can buy a space program.', isBoss: false, emoji: '🛰️', evaluate: ctx => ctx.roundProfit >= 2000000000 },
  { id: 46, title: 'Five Billion', goal: 'Make $5,000,000,000 in profit', description: 'Five billion dollars of profit. You can buy a planet, allegedly.', isBoss: false, emoji: '🪐', evaluate: ctx => ctx.roundProfit >= 5000000000 },
  { id: 47, title: 'Ten Billion', goal: 'Make $10,000,000,000 in profit', description: 'Ten billion dollars of profit. You are now a global superpower.', isBoss: false, emoji: '🌌', evaluate: ctx => ctx.roundProfit >= 10000000000 },
  { id: 48, title: 'BOSS: Ten Thousand X', goal: '10000x your money', description: 'Ten thousand times your bankroll. This is no longer trading, this is sorcery.', isBoss: true, emoji: '🐉', evaluate: ctx => ctx.returnPercent >= 999900 },

  // ===== ACT 13: INFINITE (49-52) =====
  { id: 49, title: 'Twenty Five Billion', goal: 'Make $25,000,000,000 in profit', description: 'Twenty-five billion dollars of profit. You can buy a galaxy.', isBoss: false, emoji: '🌠', evaluate: ctx => ctx.roundProfit >= 25000000000 },
  { id: 50, title: 'Fifty Billion', goal: 'Make $50,000,000,000 in profit', description: 'Fifty billion dollars of profit. You can buy a universe.', isBoss: false, emoji: '🔮', evaluate: ctx => ctx.roundProfit >= 50000000000 },
  { id: 51, title: 'Hundred Billion', goal: 'Make $100,000,000,000 in profit', description: 'One hundred billion dollars of profit. You are now a deity.', isBoss: false, emoji: '⚡', evaluate: ctx => ctx.roundProfit >= 100000000000 },
  { id: 52, title: 'BOSS: Final Form', goal: '100000x your money', description: 'One hundred thousand times your bankroll. This is the end of all things.', isBoss: true, emoji: '👹', evaluate: ctx => ctx.returnPercent >= 99999900 },

  // ===== ACT 14: BEYOND (53-56) =====
  { id: 53, title: 'Quarter Trillion', goal: 'Make $250,000,000,000 in profit', description: 'A quarter trillion dollars of profit. Numbers no longer mean anything.', isBoss: false, emoji: '🌀', evaluate: ctx => ctx.roundProfit >= 250000000000 },
  { id: 54, title: 'Half Trillion', goal: 'Make $500,000,000,000 in profit', description: 'Half a trillion dollars of profit. You own the concept of money now.', isBoss: false, emoji: '💫', evaluate: ctx => ctx.roundProfit >= 500000000000 },
  { id: 55, title: 'Trillionaire', goal: 'Make $1,000,000,000,000 in profit', description: 'One trillion dollars of profit. You have transcended the economy.', isBoss: false, emoji: '🌟', evaluate: ctx => ctx.roundProfit >= 1000000000000 },
  { id: 56, title: 'BOSS: Million X', goal: '1,000,000x your money', description: 'One million times your bankroll. This is the final boss of reality.', isBoss: true, emoji: '👺', evaluate: ctx => ctx.returnPercent >= 99999900 },

  // ===== ACT 15: ETERNITY (57-60) =====
  { id: 57, title: 'Two Trillion', goal: 'Make $2,000,000,000,000 in profit', description: 'Two trillion dollars of profit. You can buy the solar system.', isBoss: false, emoji: '☀️', evaluate: ctx => ctx.roundProfit >= 2000000000000 },
  { id: 58, title: 'Five Trillion', goal: 'Make $5,000,000,000,000 in profit', description: 'Five trillion dollars of profit. You can buy the galaxy.', isBoss: false, emoji: '🌌', evaluate: ctx => ctx.roundProfit >= 5000000000000 },
  { id: 59, title: 'Ten Trillion', goal: 'Make $10,000,000,000,000 in profit', description: 'Ten trillion dollars of profit. You can buy the universe.', isBoss: false, emoji: '🌠', evaluate: ctx => ctx.roundProfit >= 10000000000000 },
  { id: 60, title: 'BOSS: Infinity', goal: '10,000,000x your money', description: 'Ten million times your bankroll. Infinity is just a number to you now.', isBoss: true, emoji: '🐉', evaluate: ctx => ctx.returnPercent >= 999999900 },

  // ===== ACT 16: THE VOID (61-64) =====
  { id: 61, title: 'Twenty Five Trillion', goal: 'Make $25T in profit', description: 'Twenty-five trillion dollars of profit. Money is a concept you invented.', isBoss: false, emoji: '🌑', evaluate: ctx => ctx.roundProfit >= 25000000000000 },
  { id: 62, title: 'Fifty Trillion', goal: 'Make $50T in profit', description: 'Fifty trillion dollars of profit. You own the concept of value.', isBoss: false, emoji: '🌒', evaluate: ctx => ctx.roundProfit >= 50000000000000 },
  { id: 63, title: 'Hundred Trillion', goal: 'Make $100T in profit', description: 'One hundred trillion dollars of profit. You are the economy.', isBoss: false, emoji: '🌓', evaluate: ctx => ctx.roundProfit >= 100000000000000 },
  { id: 64, title: 'BOSS: Beyond Infinity', goal: '100,000,000x your money', description: 'One hundred million times your bankroll. There are no more numbers.', isBoss: true, emoji: '👹', evaluate: ctx => ctx.returnPercent >= 9999999900 },

  // ===== ACT 17: THE SINGULARITY (65-68) =====
  { id: 65, title: 'Quarter Quadrillion', goal: 'Make $250T in profit', description: 'A quarter quadrillion dollars of profit. You have broken math.', isBoss: false, emoji: '🔮', evaluate: ctx => ctx.roundProfit >= 250000000000000 },
  { id: 66, title: 'Half Quadrillion', goal: 'Make $500T in profit', description: 'Half a quadrillion dollars of profit. Math is crying.', isBoss: false, emoji: '🪞', evaluate: ctx => ctx.roundProfit >= 500000000000000 },
  { id: 67, title: 'Quadrillionaire', goal: 'Make $1Q in profit', description: 'One quadrillion dollars of profit. You have invented a new number.', isBoss: false, emoji: '🧬', evaluate: ctx => ctx.roundProfit >= 1000000000000000 },
  { id: 68, title: 'BOSS: Singularity', goal: '1,000,000,000x your money', description: 'One billion times your bankroll. You have become the singularity.', isBoss: true, emoji: '👺', evaluate: ctx => ctx.returnPercent >= 99999999900 },

  // ===== ACT 18: THE ASCENSION (69-72) =====
  { id: 69, title: 'Two Quadrillion', goal: 'Make $2Q in profit', description: 'Two quadrillion dollars of profit. Numbers are just suggestions now.', isBoss: false, emoji: '🌟', evaluate: ctx => ctx.roundProfit >= 2000000000000000 },
  { id: 70, title: 'Five Quadrillion', goal: 'Make $5Q in profit', description: 'Five quadrillion dollars of profit. You own the multiverse.', isBoss: false, emoji: '🌈', evaluate: ctx => ctx.roundProfit >= 5000000000000000 },
  { id: 71, title: 'Ten Quadrillion', goal: 'Make $10Q in profit', description: 'Ten quadrillion dollars of profit. You are the multiverse.', isBoss: false, emoji: '✨', evaluate: ctx => ctx.roundProfit >= 10000000000000000 },
  { id: 72, title: 'BOSS: Ascended', goal: '10,000,000,000x your money', description: 'Ten billion times your bankroll. You have ascended mortality.', isBoss: true, emoji: '🐉', evaluate: ctx => ctx.returnPercent >= 999999999900 },

  // ===== ACT 19: THE OMNI (73-76) =====
  { id: 73, title: 'Twenty Five Quadrillion', goal: 'Make $25Q in profit', description: 'Twenty-five quadrillion dollars of profit. You are everywhere.', isBoss: false, emoji: '🌀', evaluate: ctx => ctx.roundProfit >= 25000000000000000 },
  { id: 74, title: 'Fifty Quadrillion', goal: 'Make $50Q in profit', description: 'Fifty quadrillion dollars of profit. You are everything.', isBoss: false, emoji: '💫', evaluate: ctx => ctx.roundProfit >= 50000000000000000 },
  { id: 75, title: 'Hundred Quadrillion', goal: 'Make $100Q in profit', description: 'One hundred quadrillion dollars of profit. You are the omni.', isBoss: false, emoji: '🪐', evaluate: ctx => ctx.roundProfit >= 100000000000000000 },
  { id: 76, title: 'BOSS: The Omni', goal: '100,000,000,000x your money', description: 'One hundred billion times your bankroll. You are the omni.', isBoss: true, emoji: '👹', evaluate: ctx => ctx.returnPercent >= 99999999999 },

  // ===== ACT 20: THE END (77-80) =====
  { id: 77, title: 'Quintillionaire', goal: 'Make $1Qi in profit', description: 'One quintillion dollars of profit. You have invented infinity.', isBoss: false, emoji: '♾️', evaluate: ctx => ctx.roundProfit >= 1000000000000000000 },
  { id: 78, title: 'Two Quintillion', goal: 'Make $2Qi in profit', description: 'Two quintillion dollars of profit. Infinity is small.', isBoss: false, emoji: '🔮', evaluate: ctx => ctx.roundProfit >= 2000000000000000000 },
  { id: 79, title: 'Five Quintillion', goal: 'Make $5Qi in profit', description: 'Five quintillion dollars of profit. You are infinity.', isBoss: false, emoji: '🌟', evaluate: ctx => ctx.roundProfit >= 5000000000000000000 },
  { id: 80, title: 'BOSS: The End', goal: '1,000,000,000,000x your money', description: 'One trillion times your bankroll. This is the end. There is no more.', isBoss: true, emoji: '👺', evaluate: ctx => ctx.returnPercent >= 999999999999 },

  // ===== ACT 21: POST-END (81-84) =====
  { id: 81, title: 'Ten Quintillion', goal: 'Make $10Qi in profit', description: 'Ten quintillion dollars of profit. You have passed the end.', isBoss: false, emoji: '🌠', evaluate: ctx => ctx.roundProfit >= 10000000000000000000 },
  { id: 82, title: 'Twenty Five Quintillion', goal: 'Make $25Qi in profit', description: 'Twenty-five quintillion dollars of profit. The end was a lie.', isBoss: false, emoji: '🌌', evaluate: ctx => ctx.roundProfit >= 25000000000000000000 },
  { id: 83, title: 'Fifty Quintillion', goal: 'Make $50Qi in profit', description: 'Fifty quintillion dollars of profit. There is always more.', isBoss: false, emoji: '🌀', evaluate: ctx => ctx.roundProfit >= 50000000000000000000 },
  { id: 84, title: 'BOSS: Post-End', goal: '10,000,000,000,000x your money', description: 'Ten trillion times your bankroll. The end was just the beginning.', isBoss: true, emoji: '🐉', evaluate: ctx => ctx.returnPercent >= 9999999999999 },

  // ===== ACT 22: THE RECURSION (85-88) =====
  { id: 85, title: 'Hundred Quintillion', goal: 'Make $100Qi in profit', description: 'One hundred quintillion dollars of profit. You have recursed.', isBoss: false, emoji: '🪞', evaluate: ctx => ctx.roundProfit >= 100000000000000000000 },
  { id: 86, title: 'Two Hundred Fifty Quintillion', goal: 'Make $250Qi in profit', description: 'Two hundred fifty quintillion dollars of profit. The recursion deepens.', isBoss: false, emoji: '🔮', evaluate: ctx => ctx.roundProfit >= 250000000000000000000 },
  { id: 87, title: 'Five Hundred Quintillion', goal: 'Make $500Qi in profit', description: 'Five hundred quintillion dollars of profit. You are the recursion.', isBoss: false, emoji: '💫', evaluate: ctx => ctx.roundProfit >= 500000000000000000000 },
  { id: 88, title: 'BOSS: The Recursion', goal: '100,000,000,000,000x your money', description: 'One hundred trillion times your bankroll. You have become the recursion.', isBoss: true, emoji: '👹', evaluate: ctx => ctx.returnPercent >= 99999999999999 },

  // ===== ACT 23: THE FINAL RECURSION (89-92) =====
  { id: 89, title: 'Sextillionaire', goal: 'Make $1Sx in profit', description: 'One sextillion dollars of profit. You have invented a new word.', isBoss: false, emoji: '🧬', evaluate: ctx => ctx.roundProfit >= 1000000000000000000000 },
  { id: 90, title: 'Two Sextillion', goal: 'Make $2Sx in profit', description: 'Two sextillion dollars of profit. Words no longer matter.', isBoss: false, emoji: '🌟', evaluate: ctx => ctx.roundProfit >= 2000000000000000000000 },
  { id: 91, title: 'Five Sextillion', goal: 'Make $5Sx in profit', description: 'Five sextillion dollars of profit. You are the word.', isBoss: false, emoji: '✨', evaluate: ctx => ctx.roundProfit >= 5000000000000000000000 },
  { id: 92, title: 'BOSS: Final Recursion', goal: '1,000,000,000,000,000x your money', description: 'One quadrillion times your bankroll. This is the final recursion.', isBoss: true, emoji: '🐉', evaluate: ctx => ctx.returnPercent >= 999999999999999 },

  // ===== ACT 24: THE TRUE END (93-96) =====
  { id: 93, title: 'Ten Sextillion', goal: 'Make $10Sx in profit', description: 'Ten sextillion dollars of profit. You have passed the final recursion.', isBoss: false, emoji: '🌠', evaluate: ctx => ctx.roundProfit >= 10000000000000000000000 },
  { id: 94, title: 'Twenty Five Sextillion', goal: 'Make $25Sx in profit', description: 'Twenty-five sextillion dollars of profit. The final recursion was a lie.', isBoss: false, emoji: '🌌', evaluate: ctx => ctx.roundProfit >= 25000000000000000000000 },
  { id: 95, title: 'Fifty Sextillion', goal: 'Make $50Sx in profit', description: 'Fifty sextillion dollars of profit. There is no end.', isBoss: false, emoji: '🌀', evaluate: ctx => ctx.roundProfit >= 50000000000000000000000 },
  { id: 96, title: 'BOSS: True End', goal: '10,000,000,000,000,000x your money', description: 'Ten quadrillion times your bankroll. This is the true end. For real this time.', isBoss: true, emoji: '👹', evaluate: ctx => ctx.returnPercent >= 9999999999999999 },

  // ===== ACT 25: THE BEYOND (97-100) =====
  { id: 97, title: 'Hundred Sextillion', goal: 'Make $100Sx in profit', description: 'One hundred sextillion dollars of profit. You have passed the true end.', isBoss: false, emoji: '🔮', evaluate: ctx => ctx.roundProfit >= 100000000000000000000000 },
  { id: 98, title: 'Two Hundred Fifty Sextillion', goal: 'Make $250Sx in profit', description: 'Two hundred fifty sextillion dollars of profit. The true end was a lie.', isBoss: false, emoji: '🪞', evaluate: ctx => ctx.roundProfit >= 250000000000000000000000 },
  { id: 99, title: 'Five Hundred Sextillion', goal: 'Make $500Sx in profit', description: 'Five hundred sextillion dollars of profit. There is only the beyond.', isBoss: false, emoji: '💫', evaluate: ctx => ctx.roundProfit >= 500000000000000000000000 },
  { id: 100, title: 'BOSS: The Beyond', goal: '100,000,000,000,000,000x your money', description: 'One hundred quadrillion times your bankroll. You have reached the beyond. There is nothing more. Or is there?', isBoss: true, emoji: '👑', evaluate: ctx => ctx.returnPercent >= 99999999999999999 },
];

export function getRound(id: number): RoundGoal {
  return ROUNDS[Math.min(id, ROUNDS.length) - 1];
}
