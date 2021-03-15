import { INVALID_MOVE } from 'boardgame.io/core';
import { CreateDeck } from './Deck.js'

function DrawCardFromPile(G, ctx) {
    const card = G.deck.pop();
    G.active_card.push(card);
}


export const Greenhouse = {
    name: 'Greenhouse',
    minPlayers: 2,
	maxPlayers: 4,

    setup: ctx => {
        let deck = CreateDeck(ctx.numPlayers);

        return ({ dice: [3, 3, 3, 3, 3],
         deck: deck,
         num_allocate:  ctx.numPlayers + 1,
         hand: Array(ctx.numPlayers).fill([]),
         public_area: [],
         active_card: [],
         auction_deck: [],
         disableUndo: true, })
    },

	phases: {
		gift_phase: {
			moves: {
				// CardToPublicArea,
				// TakeCard,
				// CardToAuctionPile,
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
		stages: {
			giving : {
				moves: {
					DrawCardFromPile,
					// CardToPublicArea,
					// TakeCard,
					// CardToAuctionPile,
				},
			},
			recieving: {
				// moves: { TakeCard }
			},
			special: {
				// moves: { ChangeDie }
			},
			bidding: {
				// moves: { Bid }
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
