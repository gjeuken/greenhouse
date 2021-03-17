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
	if (G.counters.num_draw < G.num_max_give + 1) {
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
		ctx.events.setStage('special');
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
	// if (ctx.numMoves !== G.num_max_give  + 1) { return INVALID_MOVE }
	let playerIdx = (ctx.currentPlayer + 1) % ctx.numPlayers;
	ctx.events.setActivePlayers({ value: {[playerIdx] : 'recieving'}, moveLimit: 1 })
}

function TakeCardFromPublic(G, ctx, index) {
	const card = G.public_area[index];
	G.public_area.splice(index,1);
	if (card.effect !== null) {
		G.active_special_card.push(card)
		ctx.events.setStage('special_recieving');
	} else {
		let activePlayerId = Object.keys(ctx.activePlayers)[0];
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

function ChangeDie_recieving(G, ctx) {
	// do stuff
	//
	let activePlayerId = Object.keys(ctx.activePlayers)[0];
	let playerIdx = (activePlayerId + 1) % ctx.numPlayers;
	if (playerIdx !== parseInt(ctx.currentPlayer)) {
		ctx.events.setActivePlayers({ value: {[playerIdx] : 'recieving'}, moveLimit: 1 });
	} else {
		ctx.events.endTurn();
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
				moves: { TakeCardFromPublic }
			},
			special_recieving: {
				// moves: { ChangeDie_recieving }
			},
			special: {
				// moves: { ChangeDie }
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
