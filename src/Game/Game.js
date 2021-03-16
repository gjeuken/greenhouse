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
			num_take: 0,
			num_give: 0,
			num_auction: 0,
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
	if (G.active_card.length > 0) { return INVALID_MOVE }
    const card = G.deck.pop();
    G.active_card.push(card);
}

function TakeCardFromActive(G, ctx) {
	if (G.players[ctx.currentPlayer].num_take > 0) { return INVALID_MOVE }
	G.players[ctx.currentPlayer].num_take++;
	const card = G.active_card.pop();
	if (card.effect !== null) {
		G.active_special_card.push(card);
		ctx.events.setStage('special');
	} else {
		G.players[ctx.currentPlayer].hand.push(card);
		G.players[ctx.currentPlayer].hand = SortCards(G.players[ctx.currentPlayer].hand)
	}
}

function TakeCardFromPublic(G, ctx, index) {
	const card = G.public_area[index];
	G.public_area.splice(index,1);
	if (card.effect !== null) {
		G.active_special_card.push(card)
		ctx.events.setStage('special');
	} else {
		G.players[ctx.currentPlayer].hand.push(card);
		G.players[ctx.currentPlayer].hand = SortCards(G.players[ctx.currentPlayer].hand)
	}
}

function CardToPublicArea(G, ctx) {
	if (G.players[ctx.currentPlayer].num_give >= G.num_max_give) { return INVALID_MOVE }
	G.players[ctx.currentPlayer].num_give++;
	const card = G.active_card.pop();
	G.public_area.push(card);
}

function CardToAuctionDeck(G, ctx) {
	if (G.players[ctx.currentPlayer].num_auction > 0) { return INVALID_MOVE }
	G.players[ctx.currentPlayer].num_auction++;
	const card = G.active_card.pop();
	G.auction_deck.push(card);
}

function ResetPlayerCounters(G, ctx) {
	G.players[ctx.currentPlayer].num_take = 0;
	G.players[ctx.currentPlayer].num_give = 0;
	G.players[ctx.currentPlayer].num_auction = 0;
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
			},
			next: 'auction_phase',
	        start: true,
			moveLimit: (G, ctx) => G.num_max_give + 2,
        },
        auction_phase: {
            next: 'end_phase',
        },
        end_phase: {
        },
    },

	turn: {
		onBegin: (G, ctx) => ResetPlayerCounters(G, ctx),
			// if (ctx.phase === 'giving_phase') { ctx.events.setStage('giving'); }
			// else if (ctx.phase === 'action_phase') { ctx.events.setStage('bidding'); };
		// },
		stages: {
			recieving: {
				moves: { TakeCardFromPublic }
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
