import { INVALID_MOVE } from 'boardgame.io/core';
import { CreateDeck } from './Deck.js'

let dice = {
	a: 3,
	b: 3,
	c: 3,
	d: 3,
	e: 3,
}

function InitializePlayers(n) {
	let players = []
	for (let i = 0; i < n; i++) {
		players.push({
			hand: [],

		})
	}
	return players
}

function SortCards(cards) {
	cards.sort((a, b) => (a.category > b.category) ? 1 : (a.category === b.category) ? ((a.letter > b.letter) ? 1 : (a.letter === b.letter) ? ((a.number > b.number) ? 1 : -1) : -1
) : -1 ); // Sort the cards by color and number(letter)
	return cards
}

function DrawCardFromPile(G, ctx) {
	// if (G.active_card.length > 0) { return INVALID_MOVE } this will probably not be a 'move'
	
	if (G.counters.num_draw < G.num_max_give + 2 && G.active_card.length === 0) {
		const card = G.deck.pop();
		G.active_card.push(card);
		G.counters.num_draw++;
	} else {
		return INVALID_MOVE;
	}
}

function TakeCardFromActive(G, ctx) {
	if (G.counters.num_take > 0) { return INVALID_MOVE }
	G.counters.num_take++;
	const card = G.active_card.pop();
	if (card.effect !== null) {
		G.active_special_card.push(card);
		ctx.events.setActivePlayers({ currentPlayer:'special', moveLimit: 1});
	} else {
		G.players[ctx.currentPlayer].hand.push(card);
		G.players[ctx.currentPlayer].hand = SortCards(G.players[ctx.currentPlayer].hand)
	}
}

function CardToPublicArea(G, ctx) {
	if (G.counters.num_give >= G.num_max_give) { return INVALID_MOVE }
	G.counters.num_give++;
	const card = G.active_card.pop();
	G.public_area.push(card);
}

function CardToAuctionDeck(G, ctx) {
	if (G.counters.num_auction > 0) { return INVALID_MOVE }
	G.counters.num_auction++;
	const card = G.active_card.pop();
	G.auction_deck.push(card);
}

function EndGiftTurn(G, ctx) {
	let num_played = G.num_give + G.num_take + G.num_auction;
	if (num_played !== G.num_max_give  + 2) { 
	return INVALID_MOVE;
	} else {
		let playerIdx = (ctx.currentPlayer + 1) % ctx.numPlayers;
		ctx.events.setActivePlayers({ value: {[playerIdx] : 'recieving'}, moveLimit: 1 })
	}
}

function TakeCardFromPublic(G, ctx, index) {
	const card = G.public_area[index];
	G.public_area.splice(index,1);
	let activePlayerId = Object.keys(ctx.activePlayers)[0];
	if (card.effect !== null) {
		G.active_special_card.push(card)
		ctx.events.setActivePlayers({ value: { [activePlayerId]: 'special_recieving'}, moveLimit: 1});
	} else {
		G.players[activePlayerId].hand.push(card);
		G.players[activePlayerId].hand = SortCards(G.players[activePlayerId].hand);
		let playerIdx = (activePlayerId + 1) % ctx.numPlayers;
		if (playerIdx !== parseInt(ctx.currentPlayer)) {
			ctx.events.setActivePlayers({ value: {[playerIdx] : 'recieving'}, moveLimit: 1 });
		} else {
			ctx.events.endTurn();
		}
	}
}

function ChangeDice(G, ctx, change) {
	let has_positive = change.some(x => x > 0)
	let has_negative = change.some(x => x < 0)
	let only_once = !change.some(x => x > 1) && !change.some(x => x < -1)

	let change_number = G.active_special_card[0].num_effect;
	let next_values = [];
	let change_counter = 0;
	let i = 0
	for (const [key, value] of Object.entries(G.dice)) {
		change_counter += Math.abs(change[i]);
		next_values.push(value + change[i])
		i++;
	}
	let correct_change = change_counter === change_number || change_counter === 0;

	let is_in_bounds = correct_change && only_once && !next_values.some(x => x < 0) && !next_values.some(x => x > 6);

	var is_valid;
	if (G.active_special_card[0].effect === 'plus') {
		is_valid = !has_negative && is_in_bounds;
	} else if (G.active_special_card[0].effect === 'minus') {
		is_valid = !has_positive && is_in_bounds;
	} else {
		is_valid = is_in_bounds;
	}

	if (is_valid) {
		G.dice.a += change[0];
		G.dice.b += change[1];
		G.dice.c += change[2];
		G.dice.d += change[3];
		G.dice.e += change[4];
		G.active_special_card.pop()
	} else {
		return INVALID_MOVE;
	}
}

function ChangeDice_recieving(G, ctx, change) {
	let has_positive = change.some(x => x > 0)
	let has_negative = change.some(x => x < 0)
	let only_once = !change.some(x => x > 1) && !change.some(x => x < -1)

	let change_number = G.active_special_card[0].num_effect;
	let next_values = [];
	let change_counter = 0;
	let i = 0
	for (const [key, value] of Object.entries(G.dice)) {
		change_counter += Math.abs(change[i]);
		next_values.push(value + change[i])
		i++;
	}
	let correct_change = change_counter === change_number || change_counter === 0;

	let is_in_bounds = correct_change && only_once && !next_values.some(x => x < 0) && !next_values.some(x => x > 6);

	var is_valid;
	if (G.active_special_card[0].effect === 'plus') {
		is_valid = !has_negative && is_in_bounds;
	} else if (G.active_special_card[0].effect === 'minus') {
		is_valid = !has_positive && is_in_bounds;
	} else {
		is_valid = is_in_bounds;
	}

	if (is_valid) {
		G.dice.a += change[0];
		G.dice.b += change[1];
		G.dice.c += change[2];
		G.dice.d += change[3];
		G.dice.e += change[4];
		G.active_special_card.pop()
		let activePlayerId = Object.keys(ctx.activePlayers)[0];
		let playerIdx = (activePlayerId + 1) % ctx.numPlayers;
		if (playerIdx !== parseInt(ctx.currentPlayer)) {
			ctx.events.setActivePlayers({ value: {[playerIdx] : 'recieving'}, moveLimit: 1 });
		} else {
			ctx.events.endTurn();
		}
	} else {
		return INVALID_MOVE;
	}
}

function HandleBeginTurn(G, ctx) {
	if (ctx.phase === 'gift_phase') {
		G.counters.num_take = 0;
		G.counters.num_give = 0;
		G.counters.num_auction = 0;
		G.counters.num_draw = 0;
	} else if (ctx.phase === 'auction_phase') {

	}
}

export const Greenhouse = {
	name: 'Greenhouse',
	minPlayers: 2,
	maxPlayers: 4,

	setup: ctx => {
		return ({ 
			dice: dice,
			deck: CreateDeck(ctx.numPlayers),
			num_max_give:  ctx.numPlayers - 1,
			public_area: [],
			active_card: [],
			auction_deck: [],
			players: InitializePlayers(ctx.numPlayers),
			active_special_card: [],
			counters: {
				num_take: 0,
				num_give: 0,
				num_auction: 0,
				num_draw: 0,
			},
			disableUndo: true, 
		})
	},

	phases: {
		gift_phase: {
			moves: {
				DrawCardFromPile,
				TakeCardFromActive,
				CardToPublicArea,
				CardToAuctionDeck,
				EndGiftTurn,
			},
			next: 'auction_phase',
	        start: true,
        },
        auction_phase: {
            next: 'end_phase',
        },
        end_phase: {
        },
    },

	turn: {
		onBegin: (G, ctx) => HandleBeginTurn(G, ctx),
		stages: {
			recieving: {
				moves: { TakeCardFromPublic },
				moveLimit: 1,
			},
			special_recieving: {
				moves: { ChangeDice_recieving },
				moveLimit: 1,
			},
			special: {
				moves: { ChangeDice },
				moveLimit: 1,
			},
			payingWithGold: {
				moves: {
					// PayWithGold,
					// DontPay,
				},
			},
			payingWithCards: {
				moves: {
					// PayWithCards,
					// DontPay,
				}
			}
		}
	}
};
