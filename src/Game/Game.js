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
			bidding_action: "",
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
		CheckEndTurn(G, ctx);
	}
}

function CardToPublicArea(G, ctx) {
	if (G.counters.num_give >= G.num_max_give) { return INVALID_MOVE }
	G.counters.num_give++;
	const card = G.active_card.pop();
	G.public_area.push(card);
	CheckEndTurn(G, ctx);
}

function CardToAuctionDeck(G, ctx) {
	if (G.counters.num_auction > 0) { return INVALID_MOVE }
	G.counters.num_auction++;
	const card = G.active_card.pop();
	G.auction_deck.push(card);
	CheckEndTurn(G, ctx);
}

function EndGiftTurn(G, ctx) {
	let playerIdx = (parseInt(ctx.currentPlayer) + 1) % parseInt(ctx.numPlayers);
	ctx.events.setActivePlayers({ value: {[playerIdx] : 'recieving'}, moveLimit: 1 })
}

function TakeCardFromPublic(G, ctx, index) {
	const card = G.public_area[index];
	G.public_area.splice(index,1);
	let activePlayerId = parseInt(Object.keys(ctx.activePlayers)[0]);
	if (card.effect !== null) {
		G.active_special_card.push(card)
		ctx.events.setActivePlayers({ value: { [activePlayerId]: 'special'}, moveLimit: 1});
	} else {
		G.players[activePlayerId].hand.push(card);
		G.players[activePlayerId].hand = SortCards(G.players[activePlayerId].hand);
		let playerIdx = (parseInt(activePlayerId) + 1) % parseInt(ctx.numPlayers);
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
	for (const [_key, value] of Object.entries(G.dice)) {
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
		G.active_special_card.pop();

		let activePlayerId = parseInt(Object.keys(ctx.activePlayers)[0]);
		if (ctx.phase === 'auction_phase') {
			ctx.events.endTurn()
		} else if (parseInt(ctx.currentPlayer) === activePlayerId) {
			CheckEndTurn(G, ctx);
		} else {
			let playerIdx = (activePlayerId + 1) % ctx.numPlayers;
			if (playerIdx !== parseInt(ctx.currentPlayer)) {
				ctx.events.setActivePlayers({ value: {[playerIdx] : 'recieving'}, moveLimit: 1 });
			} else {
				ctx.events.endTurn();
			}
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
		G.auction_player_list = [];
		G.current_bid = 0;
		for ( let i=1; i <= ctx.numPlayers; i++ ) {
			G.auction_player_list.push((parseInt(ctx.currentPlayer) + i ) % ctx.numPlayers);
			G.players[i - 1].bidding_action = "";
		}

	}
}

function IsGiftOver(G) {
	let num_cards = G.active_special_card.length + G.deck.length + G.public_area.length + G.active_card.length;
	return num_cards === 0;
}

function CheckEndTurn(G, ctx) {
	if (ctx.phase === 'gift_phase') {
		let num_played = G.counters.num_give + G.counters.num_take + G.counters.num_auction;
		if (num_played === G.num_max_give  + 2) {
			EndGiftTurn(G, ctx);
		}
	}
}

function DrawCardFromAuction(G, ctx) {
	let card = G.auction_deck.pop();
	G.active_auction_card.push(card);
	let nextBidder = G.auction_player_list[0];
	ctx.events.setActivePlayers({ value: {[nextBidder] : 'bidding'}, moveLimit: 1 })
}

function Bid(G, ctx, bid) {
	if (G.current_bid >= bid) { return INVALID_MOVE }
	G.current_bid = bid;
	let currentBidder = G.auction_player_list[0];
	G.players[currentBidder].bidding_action = "Bid " + bid;	
	if (G.auction_player_list.length === 1) { // only one bid
		ctx.events.setActivePlayers({ value: {[currentBidder] : 'paying'}, moveLimit: 1 })
	} else {
		G.auction_player_list.shift();
		G.auction_player_list.push(currentBidder);
		let nextBidder = G.auction_player_list[0];
		ctx.events.setActivePlayers({ value: {[nextBidder] : 'bidding'}, moveLimit: 1 })
	}
}

function PassBid(G, ctx) {
	let currentBidder = G.auction_player_list.shift();
	G.players[currentBidder].bidding_action = "Pass";	
	if (G.auction_player_list.length === 0) {
		G.active_auction_card.pop(); // no one wants the card;
		ctx.events.endTurn();
	} else if ((G.current_bid !== 0) && (G.auction_player_list.length === 1) ){ // auction winner
		let nextBidder = G.auction_player_list[0];
		ctx.events.setActivePlayers({ value: {[nextBidder] : 'paying'}, moveLimit: 1 })
	} else {
		let nextBidder = G.auction_player_list[0];
		ctx.events.setActivePlayers({ value: {[nextBidder] : 'bidding'}, moveLimit: 1 })
	}
}

function Pay(G, ctx, ids) {
	ids.sort()
	let currentBidder = G.auction_player_list[0];
	if (G.active_auction_card[0].category === "g") { // pay with cards
		if (ids.length !== G.current_bid) { return INVALID_MOVE }
		for (let i=ids.length -1; i>=0; i--) {
			let cardId = ids[i];
			G.players[currentBidder].hand.splice(cardId,1);
		}
		let card = G.active_auction_card.pop()
		G.players[currentBidder].hand.push(card);
		G.players[currentBidder].hand = SortCards(G.players[currentBidder].hand);
		ctx.events.endTurn();
	} else { // pay with gold
		let goldTotal = 0;
		for (let i=0; i<ids.length; i++) {
			let thisCard = G.players[currentBidder].hand[ids[i]];
			if (thisCard.category !== "g") { return INVALID_MOVE }
			goldTotal += thisCard.number;
		}
		if (goldTotal < G.current_bid) { return INVALID_MOVE }
		for (let i=ids.length -1; i>=0; i--) {
			let cardId = ids[i];
			G.players[currentBidder].hand.splice(cardId,1);
		}
		let card = G.active_auction_card.pop()

		let activePlayerId = parseInt(Object.keys(ctx.activePlayers)[0]);
		if (card.effect !== null) {
			G.active_special_card.push(card)
			ctx.events.setActivePlayers({ value: { [activePlayerId]: 'special'}, moveLimit: 1});
		} else {
			G.players[currentBidder].hand.push(card);
			G.players[currentBidder].hand = SortCards(G.players[currentBidder].hand);
			ctx.events.endTurn();
		}
	}
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function DontPay(G, ctx) {
	let activePlayerId = parseInt(Object.keys(ctx.activePlayers)[0]);
	if (G.variant === 0) {
		let nextPlayer = (activePlayerId + 1) % ctx.numPlayers;
		for (let i=0; i < ctx.numPlayers - 1; i++) {
			let randomId = getRandomInt(G.players[activePlayerId].hand.length);
			let card = G.players[activePlayerId].hand.splice(randomId,1)[0];
			G.players[nextPlayer].hand.push(card);
			// G.players[nextPlayer].hand = SortCards(G.players[nextPlayer].hand);
			nextPlayer = (nextPlayer + 1) % ctx.numPlayers;
		}
		G.auction_player_list = [];
		G.current_bid = 0;
		for ( let i=1; i <= ctx.numPlayers; i++ ) {
				let this_player = (parseInt(ctx.currentPlayer) + i ) % ctx.numPlayers
			if (this_player !== activePlayerId) {
				G.auction_player_list.push(this_player);
				G.players[this_player].bidding_action = "";
			} else {
				G.players[this_player].bidding_action = "Out";
			}
		}
		let nextBidder = G.auction_player_list[0];
		ctx.events.setActivePlayers({ value: {[nextBidder] : 'bidding'}, moveLimit: 1 })
	} else { // medieval variant
		let randomId = getRandomInt(G.players[activePlayerId].hand.length);
		G.players[activePlayerId].hand.splice(randomId,1);
		G.auction_player_list = [];
		G.current_bid = 0;
		for ( let i=1; i <= ctx.numPlayers; i++ ) {
				let this_player = (parseInt(ctx.currentPlayer) + i ) % ctx.numPlayers
			if (i !== activePlayerId) {
				G.auction_player_list.push(this_player);
				G.players[this_player].bidding_action = "";
			} else {
				G.players[this_player].bidding_action = "Out";
			}
		}
		let nextBidder = G.auction_player_list[0];
		ctx.events.setActivePlayers({ value: {[nextBidder] : 'bidding'}, moveLimit: 1 })
	}
}


function ShuffleAuctionDeck(G, ctx) {
    G.auction_deck = G.auction_deck.map((a) => ({sort: Math.random(), value: a})).sort((a, b) => a.sort - b.sort).map((a) => a.value)
}

export const Greenhouse = {
	name: 'Greenhouse',
	minPlayers: 2,
	maxPlayers: 4,

	setup: ctx => {
		return ({ 
			dice: dice,
			deck: CreateDeck(ctx.numPlayers),
			players: InitializePlayers(ctx.numPlayers),
			num_max_give:  ctx.numPlayers - 1,
			public_area: [],
			active_card: [],
			auction_deck: [],
			active_special_card: [],
			active_auction_card: [],
			auction_player_list: [],
			current_bid: 0,
			counters: {
				num_take: 0,
				num_give: 0,
				num_auction: 0,
				num_draw: 0,
			},
			disableUndo: true,
			variant: 0,
		})
	},

	phases: {
		gift_phase: {
			moves: {
				DrawCardFromPile,
				TakeCardFromActive,
				CardToPublicArea,
				CardToAuctionDeck,
				// EndGiftTurn,
			},
			next: 'auction_phase',
	        start: true,
			endIf: G => IsGiftOver(G),
        },
        auction_phase: {
            next: 'end_phase',
			onBegin: (G, ctx) => ShuffleAuctionDeck(G, ctx),
			moves: {
				DrawCardFromAuction,
			}
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
			special: {
				moves: { ChangeDice },
				moveLimit: 1,
			},
			bidding: {
				moves: { 
					Bid,
					PassBid,
				},
				moveLimit: 1,
			},
			paying: {
				moves: {
					Pay,
					DontPay,
				},
			},
		}
	}
};
