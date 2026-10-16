/* Assessment fixes applied on top of content.js/extra.js: option text rewritten (similar lengths, plausible distractors), corrected wording, duplicate questions dropped. Engine shuffles option order at display time. */
(function(){var A=window.APP;if(!A||!A.levels)return;
var F={
"l1": {
"0": {
"o": [
"A small sleeve that cuts drawdowns and makes cash for future entries",
"The main source of the portfolio's returns over time",
"A replacement for holding cash in a falling market",
"A tool for predicting where the market goes next"
]
},
"1": {
"o": [
"They reduce decisions made on emotion in the heat of a move",
"They guarantee that the plan will make a profit",
"Brokers require written rules before they allow options trading",
"They remove all risk from the portfolio"
]
},
"3": {
"o": [
"Sizing: the cover is too small for the exposure",
"Cost: the spreads were too cheap to be effective",
"Mechanics: put options do not work as a hedge",
"Nothing is wrong, since any hedge is better than none"
]
}
},
"l2": {
"0": {
"o": [
"A minimum you never invest, whatever the signals say",
"The level of cash you hold when the market looks risk-off",
"The cash needed to place a single trade",
"The target cash level when signals turn risk-on"
]
},
"3": {
"o": [
"Interest-bearing cash, bills or a money-market style product",
"Cash-secured puts written on volatile stocks",
"A leveraged ETF that moves with the market",
"Call options bought on an index"
]
},
"4": {
"o": [
"Move toward the floor in steps (thirds), never below 20%",
"Go to 0% cash at once, since the signals have turned",
"Sell the hedge and use the proceeds to buy more shares",
"Wait for the next signal change before doing anything"
]
},
"1": {
"why": "Risk-off is 50% total: the 20% floor plus the whole 30% flexible layer held as cash."
}
},
"l3": {
"0": {
"o": [
"Over the 5 to 10% band for volatile names",
"Fine, since it is below the 25% single-stock limit",
"Too small to matter for a stock that moves this much",
"Undefined, because the plan has no rule for volatile names"
]
},
"2": {
"o": [
"40% of the account depends on two ideas",
"Each position is too small to affect the result",
"The dividends from the two positions will be taxed",
"There is no concern, since the cap is 15% per position"
]
},
"3": {
"o": [
"Stage it: part now, the rest into a bounce at pre-set levels",
"Sell the whole excess at once, whatever the price",
"Do nothing, since the stock is oversold and may bounce",
"Buy more, since oversold prices are cheaper"
]
}
},
"l4": {
"3": {
"o": [
"Width × 100 × contracts",
"Strike × 100, which is the notional",
"The premium that was paid for the spread",
"The value of the whole account"
]
},
"4": {
"o": [
"Protection below the short strike",
"Protection above the long strike",
"Part of the cost, which is not refunded",
"The right to profit if the price keeps rising"
]
}
},
"l5": {
"1": {
"o": [
"Basis risk",
"Overfitting",
"Theta decay",
"Assignment risk"
]
},
"2": {
"o": [
"Time decay speeds up near expiry, leaving little time to be right",
"Options expire early if the underlying price moves too far",
"Brokers require every spread to be closed before expiry",
"Holding to expiry creates a larger tax bill"
]
},
"4": {
"o": [
"Pre-set tranche limit orders at written levels",
"Watch the screen all day for the next move",
"Never take profit, so winners can keep running",
"Double the size so a miss costs less"
]
}
},
"l6": {
"0": {
"o": [
"Two",
"One",
"All three, every time",
"None, as signals are only a guide"
]
},
"1": {
"o": [
"Two of three are bearish: risk-off",
"Risk-on, since one signal is still positive",
"No information, since the signals disagree",
"All three are bullish, as MACD is still positive"
],
"q": "Price is below the 50-day average, RSI is rolling over, and MACD has not yet crossed below its signal line. What does this say?"
},
"2": {
"o": [
"About a third",
"All of it, since the signals are confirmed",
"Nothing until a full year has passed",
"The floor as well, since the signals are strong"
]
},
"3": {
"o": [
"Fewer false signals from noise",
"It is legally required for retail accounts",
"Daily charts predict where prices will go",
"Minute charts are inaccurate"
]
}
},
"l7": {
"1": {
"o": [
"No: a covered call needs 100 shares per contract",
"Yes, since one contract is allowed for any holding",
"Only if the shares are held in a retirement account",
"Yes, if the account's cash balance is high"
]
},
"2": {
"o": [
"They use cash the plan wants held, and assignment could breach caps",
"They are not allowed in a regulated account",
"They carry no risk, so the plan does not need them",
"They require MACD to be positive before they can be placed"
]
},
"3": {
"o": [
"Being assigned shares in a stock that keeps falling",
"Losing the right to vote at the company's meeting",
"Receiving a margin call on a call you hold elsewhere",
"The risk is small because the seller keeps the premium"
]
},
"4": {
"o": [
"Your upside is capped near the strike plus the premium",
"You keep all of the gains from the rally",
"You receive a bonus for selling the call early",
"The call expires early to protect you"
]
}
}
},DROP={};
var BOSS={"0": [{"t": "Risk-off, so 50% cash in total, because two of the three signals are down", "pts": 2, "why": "Two of three down means risk-off and 50%."}, {"t": "Neutral, so about 35% cash in total, because one of the three signals still looks positive", "pts": 1, "why": "Neutral needs mixed signals, and two of three are down here."}, {"t": "Risk-on, so deploy toward the 20% floor, because the long-run trend is still upward", "pts": 0, "why": "The signals say the opposite."}], "1": [{"t": "Trim over-cap positions in stages: part now, and the rest into a bounce at pre-set levels", "pts": 2, "why": "Trims fix both concentration and cash."}, {"t": "Sell a little of every holding equally, so no single stock is trimmed more than the others", "pts": 1, "why": "It raises cash, but ignores which positions are over their caps."}, {"t": "Borrow against the account to buy the dip, then repay the loan once prices recover", "pts": 0, "why": "Adds risk and goes against the plan."}], "2": [{"t": "Sell part now and set pre-planned levels for the rest on a bounce (RSI recovery)", "pts": 2, "why": "Staged trims balance cap discipline with whipsaw risk."}, {"t": "Sell the whole excess at the market now, so the position is back under its cap straight away", "pts": 1, "why": "Meets the cap but risks selling at the low."}, {"t": "Wait for the price to return to its earlier high before trimming, since selling now would lock in the loss", "pts": 0, "why": "Ignores the cap and waits without a rule."}], "3": [{"t": "Recognise basis risk, size to what the Example Index actually covers, and consider an instrument closer to the exposure", "pts": 2, "why": "Check what the hedge really tracks."}, {"t": "Keep the hedge as it is, since it is cheap and the premium is a small share of the account", "pts": 1, "why": "It is cheap, but you should still review how well it fits."}, {"t": "Buy more of the same spreads, so the hedge payout is larger if the market falls further", "pts": 0, "why": "More of a mismatched hedge is not better cover."}], "4": [{"t": "Wait: use flexible cash only after signals turn neutral or risk-on, and only on names that fit the caps after assignment", "pts": 2, "why": "Matches the plan."}, {"t": "Sell puts on a name that fits the caps, using part of the flexible layer, even though signals are still risk-off", "pts": 1, "why": "Closer to the plan, but the plan waits for neutral or risk-on first."}, {"t": "Sell puts on the most volatile name, using part of the 20% floor, because the premium is highest there", "pts": 0, "why": "Never use the floor, and high premium reflects high risk that could breach caps."}]},SQ={};if(A.boss&&BOSS){Object.keys(BOSS).forEach(function(k){if(A.boss.steps[k])A.boss.steps[k].opts=BOSS[k]});Object.keys(SQ).forEach(function(k){if(A.boss.steps[k])A.boss.steps[k].q=SQ[k]})}
A.levels.forEach(function(L){var f=F[L.id]||{},d=DROP[L.id]||[];
 L.qs.forEach(function(q,i){var x=f[i];if(!x)return;
  if(x.o&&(q.t==='mc')){q.opts=x.o.slice();q.a=(x.a===undefined?0:x.a)}
  else if(x.o&&q.t==='multi'){q.opts=x.o.slice();q.a=x.a}
  if(x.q)q.q=x.q;if(x.why)q.why=x.why});
 L.qs=L.qs.filter(function(q,i){return d.indexOf(i)<0})})})();
