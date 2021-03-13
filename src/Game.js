import { INVALID_MOVE } from 'boardgame.io/core';
import { CreateDeck } from './Deck.js'

function DrawCardFromPile(G, ctx) {
    const card = G.deck.pop();
    G.temp_hand.push(card);
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
         public_deck: Array(ctx.numPlayers-1).fill(null),
         temp_hand: [],
         auction_deck: [],
         disableUndo: true, })
    },

    phases: {
        gift_phase: {
            moves: {DrawCardFromPile},
            next: 'auction_phase',
	        start: true,
        },
        auction_phase: {
            next: 'end_phase',
        },
        end_phase: {
        },
    }
};