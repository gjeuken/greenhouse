import React from 'react';
import './board.css'

export class Board extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 
			change: [0, 0, 0, 0, 0],
			bid: 0,
			selected_cards: [],
			drag_card: -1,
		};
	}

	draw_cards(cards, draggable = false, selectable = false) {
		if (cards.length === 0) {
			return null
		} else {
			let draw = []
			let this_card = []
			let extra_category = ""
			for (let i=0; i < cards.length; i++) {
				let card = cards[i];
				let pre = ""
				let pos = ""
				let card_number = card.number
				if (card.category === 's') {
					card_number = card.num_effect
					if (card.effect === 'minus') { pre = '-' }
					else if (card.effect === 'plus') { pre = '+' }
					else if (card.effect === 'plusminus') { pre = '\u00b1' }
				}
				if (card.category === 'g') { pos = '\u26c1' }
				if (draggable) {
					this_card = (
						<div key={i} draggable className={'card draggable ' + card.category} onDragStart={() => this.dragCard(i)} >
						<span className='card_number'> {pre + card_number + pos} </span>
						<span className='card_letter'> {card.letter} </span>
						</div>
					)
				} else if (selectable) {
					if (this.state.selected_cards.includes(i)) {
						this_card = (
							<div key={i} className={'card selected ' + card.category} onClick={() => this.handleSelectCard(i)}>
							<span className='card_number'> {pre + card_number + pos} </span>
							<span className='card_letter'> {card.letter} </span>
							</div>
						)
					} else {
						this_card = (
							<div key={i} className={'card selectable ' + card.category} onClick={() => this.handleSelectCard(i)}>
							<span className='card_number'> {pre + card_number + pos} </span>
							<span className='card_letter'> {card.letter} </span>
							</div>
						)
					}
				} else {
					this_card = (
						<div key={i} className={'card ' + card.category + extra_category}>
						<span className='card_number'> {pre + card_number + pos} </span>
						<span className='card_letter'> {card.letter} </span>
						</div>
					)
				}
				draw.push(this_card)
			}
			return draw
		}
	}

	dragCard = (i) => {
		this.setState({ drag_card: i })
	}

	preventDefault = () => (event) => {
    	event.preventDefault();
    	console.log("prevent default")
 	}

	handleChange = (event, i) => {
		let new_change = this.state.change
		new_change[i] = parseInt(event.target.value)
		this.setState({ change: new_change })
	}

	handleChangeButton = () => {
		this.props.moves.ChangeDice(this.state.change);
		this.setState({ change: [0, 0, 0, 0, 0] })
	}

	increaseBid = () => {
		let new_bid = this.state.bid + 1;
		this.setState({ bid: new_bid })
	}

	decreaseBid = () => {
		if (this.state.bid !== 0) {
			let new_bid = this.state.bid - 1;
			this.setState({ bid: new_bid })
		}
	}
	
	handleBid = () => {
		this.props.moves.Bid(this.state.bid)
		// this.setState({ bid: 0 })
	}

	handlePassBid = () => {
		this.props.moves.PassBid();
		this.setState({ bid: 0 })
	}

	handleSelectCard = (i) => {
		let is_selected = (this.state.selected_cards.includes(i))
		if (is_selected) {
			let new_state = this.state.selected_cards
			let index = new_state.indexOf(i)
			new_state.splice(index, 1)
			this.setState({ selected_cards : new_state })
		} else {
			let new_state = this.state.selected_cards
			new_state.push(i)
			this.setState({ selected_cards : new_state })
		}
	}

	handleCardToHand = () => {
		let isRecieving = (this.props.ctx.activePlayers !== null)
		if (isRecieving) {
			this.props.moves.TakeCardFromPublic(this.state.drag_card);
		} else {
			this.props.moves.TakeCardFromActive()
		}
	}


	render() {
		let playerID = parseInt(this.props.playerID);
		// let playerID = 0;

		let currentPlayer_stage = "";
		if (isPlayerActive(this.props.ctx, playerID) && (this.props.ctx.activePlayers !== null)){
			currentPlayer_stage = this.props.ctx.activePlayers[playerID];
		}



		function isPlayerActive(ctx, id) {
			if (ctx.activePlayers !== null) { 
				return (parseInt(Object.keys(ctx.activePlayers)[0]) === id);
			} else {
				return (parseInt(ctx.currentPlayer) === parseInt(id));
			}
		}

		let dice = [];
		dice.push(<div key={1} className="die a"> {this.props.G.dice.a} </div>)
		dice.push(<div key={2} className="die b"> {this.props.G.dice.b} </div>)
		dice.push(<div key={3} className="die c"> {this.props.G.dice.c} </div>)
		dice.push(<div key={4} className="die d"> {this.props.G.dice.d} </div>)
		dice.push(<div key={5} className="die e"> {this.props.G.dice.e} </div>)


		let players = [];
		for (let i=0; i < this.props.ctx.numPlayers; i++) {
			let player = (
				<div key={i} className={isPlayerActive(this.props.ctx, i) ? 'player active' : 'player'}>
					<span className = "player_name">{this.props.matchData[i].name}</span>
					<span className = "player_action">{this.props.G.players[i].bidding_action}</span>
				</div>
			)
			players.push(player)
		}

		let active_area = [] 
		if (this.props.ctx.phase === 'gift_phase') {
			if (isPlayerActive(this.props.ctx, playerID)) {
				active_area = this.draw_cards(this.props.G.active_card, true)
			} else if (this.props.G.active_card.length !== 0) {
				active_area = (<div className='card back' />)
			}
		} else if (this.props.ctx.phase === 'auction_phase') {
			active_area = this.draw_cards(this.props.G.active_auction_card)
		}

		function draw_deck(deck) {
			let draw = ""
			if (deck.length === 0) {
				draw = (<div className = 'card absent' />)
			}
			else {
				draw = (
					<div className = 'card back'>
						{deck.length}
					</div>
				)
			}
			return draw
		}


		let draw_deck_button = "";
		let condition_deck_button = (this.props.G.deck.length !== 0) && (isPlayerActive(this.props.ctx, playerID)) && (parseInt(this.props.ctx.currentPlayer) === playerID) && (this.props.ctx.phase === 'gift_phase') 
		if (condition_deck_button) {
			draw_deck_button = (<button className='draw_button' onClick={() => this.props.moves.DrawCardFromPile()}> Draw </button>)
		}

		let draw_auction_button = [];
		let condition_auction_button = (this.props.G.auction_deck.length !== 0) && (isPlayerActive(this.props.ctx, playerID)) && (parseInt(this.props.ctx.currentPlayer) === playerID) && (this.props.ctx.phase === 'auction_phase') 
		if (condition_auction_button) {
			draw_auction_button = (<button className='draw_button' onClick={() => this.props.moves.DrawCardFromAuction()}> Draw </button>)
		}




		let change_dice = [];
		let condition_change_dice = (currentPlayer_stage === 'special')
		// condition_change_dice = true
		if (condition_change_dice) {
			for (let i=0; i < 5; i++) {
				let change_container = (
					<div key={i} className='change_container'>
					<select id = {'change' + i} className='selector' onChange = {(e) => this.handleChange(e,i)} value={this.state.change[i]} >
					<option value="-1"> -1 </option>   
					<option value="0"> &plusmn; </option>   
					<option value="1"> +1 </option>   
					</select>
					</div>
				)
				change_dice.push(change_container)
			}
			let commit_button = (<button key={5} id='commit_change' onClick={() => this.handleChangeButton()}> Change </button>)
			change_dice.push(commit_button)
		}
	
		let place_bid = []
		let button_place_bid = ""
		let button_pass = ""
		let condition_place_bid = (currentPlayer_stage === 'bidding') 
		// condition_place_bid = true;
		if (condition_place_bid) {
			place_bid.push(<button className='bid_change' key={0} onClick={() => this.decreaseBid()}> - </button>)
		 	place_bid.push(<span key={1}>{this.state.bid}</span>)
			place_bid.push(<button className='bid_change' key={2}onClick={() => this.increaseBid()}> + </button>)
			
			button_place_bid = (<button className='bid_or_pass' onClick={() => this.handleBid()}> Bid </button>)
			button_pass = (<button className='bid_or_pass' onClick={() => this.handlePassBid()}> Pass </button>)
		}

		let bid_display = ""
		if (this.props.G.players[playerID].bidding_action !== "") {
			bid_display = "You " + this.props.G.players[playerID].bidding_action.toLowerCase()
		}

		let condition_selectable_hand = (currentPlayer_stage === 'paying')
		let hand = []
		if (condition_selectable_hand) {
			hand = this.draw_cards(this.props.G.players[playerID].hand, false, true)
		} else {
			hand = this.draw_cards(this.props.G.players[playerID].hand)
		}

		let pay_instructions = ""
		let pay_button = ""
		let dontpay_button = ""
		let condition_pay_button = (currentPlayer_stage === 'paying')
		// condition_pay_button = true
		if (condition_pay_button) {
			pay_instructions = "Select cards from your hand"
			pay_button = (<button id="pay" onClick={() => this.props.moves.Pay(this.state.selected_cards)}> Pay </button>)
			dontpay_button = (<button id="pay" onClick={() => this.props.moves.DontPay()}> Do not pay </button>)
		}

		return(
			<div id='main_window'>
				<div id='board'>
					<div id='dice_area' className='game_container'>
						<div id='dice_and_change'>
							<div id='dice'>
								{dice}
							</div>
							<div id='change_dice'>
								{change_dice}
							</div>
						</div>
						<div id='active_special_card'>
							{this.draw_cards(this.props.G.active_special_card)}
						</div>
					</div>
					<div id='middlecol'>
						<div id='players' className='game_container'>
							{players}
						</div>
						<div id='mid_row'>
							<div id='main_deck' className='game_container'>
								<span className='area_indicator'> Deck </span>
								{draw_deck(this.props.G.deck)}
								{draw_deck_button}
							</div>
							<div id='public_space' className='game_container'  onDragOver={this.preventDefault()} onDrop={() => this.props.moves.CardToPublicArea()}>
								<span className='area_indicator'> Public space </span>
								{this.draw_cards(this.props.G.public_area, true)}
							</div>
							<div id='auction_deck' className='game_container'  onDragOver={this.preventDefault()} onDrop={() => this.props.moves.CardToAuctionDeck()}>
								<span className='area_indicator'> Auction deck </span>
								{draw_deck(this.props.G.auction_deck)}
								{draw_auction_button}
							</div>
						</div>
						<div id='bottom_row'>
							<div id='bid_area' className='game_container'>
								<div id='place_bid'> {place_bid} </div>
								<div id='buttons_bid'>
								{button_place_bid}
								{button_pass}
								</div>
								<div id='display_bid'>{bid_display}</div>
							</div>
							<div id='active_card' className='game_container'>
								{active_area}
							</div>
							<div id='pay_area' className='game_container'>
								{pay_instructions}
								{pay_button}
								{dontpay_button}
							</div>
						</div>
					</div>
				</div>
				<div id='hand' className='game_container'  onDragOver={this.preventDefault()} onDrop={() => this.handleCardToHand()}>
					<span className='area_indicator'> Your hand </span>
					{hand}
				</div>
			</div>
		);
	}
}
