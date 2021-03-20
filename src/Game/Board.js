import React from 'react';
import './board.css'


export class Board extends React.Component {

	constructor(props) {
		super(props);
		// Don't call this.setState() here!
		this.state = { 
			change: [0, 0, 0, 0, 0]
		};
	}

	handleChange = (event, i) => {
		let new_change = this.state.change
		new_change[i] = parseInt(event.target.value)
		this.setState({ change: new_change })
		console.log(this.state.change)
	}

	render() {

		function draw_cards(cards) {
			if (cards.length === 0) {
				return null
			} else {
				let draw = []
				let this_card = []
				for (let i=0; i < cards.length; i++) {
					let card = cards[i];
					if (card.category === 's') {
						let pre = ""
						if (card.effect === 'minus') { pre = '-' }
						else if (card.effect === 'plus') { pre = '+' }
						else if (card.effect === 'plusminus') { pre = '&pm;' }
						this_card = (
							<div key={i} className={'card ' + card.category}>
							<span className='card_number'> {pre + card.num_effect} </span>
							</div>
						)
					} else {
						this_card = (
							<div key={i} className={'card ' + card.category}>
							<span className='card_number'> {card.number} </span>
							<span className='card_letter'> {card.letter} </span>
							</div>
						)	
					}
					draw.push(this_card)
				}
				return draw
			}
		}

		function isPlayerActive(ctx, id) {
			if (ctx.activePlayers !== null) { 
				return  (parseInt(Object.keys(ctx.activePlayers)[0]) === id);
			} else {
				return (parseInt(ctx.currentPlayer) === id);
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
					// <p>{this.props.matchData[i].name}</p>
			let player = (
				<div key={i} className={isPlayerActive(this.props.ctx, i) ? 'player active' : 'player'}>
					<p>{'Player ' + i}</p>
					<p>{this.props.G.players[i].bidding_action}</p>
				</div>
			)
			players.push(player)
		}

		function draw_active_area(G, ctx) {
			if (ctx.phase === 'gift_phase') {
				// if (isPlayerActive(this.props.playerID)) {
				if (true) {
					return draw_cards(G.active_card)
				} else if (G.active_card.length !== 0) {
					return (<div className='card back' />)
				} else {
					return null
				}
			} else if (ctx.phase === 'auction') {
				return draw_cards(G.active_auction_card)
			}
		}


		let change_dice = [];
		for (let i=0; i < 5; i++) {
			let change_container = (
				<div key = {i} className='change_container'>
				<select id = {'change' + i} onChange = {(e) => this.handleChange(e,i)} value={this.state.change[i]} >
				<option value="-1"> -1 </option>   
				<option value="0"> 0 </option>   
				<option value="1"> +1 </option>   
				</select>
				</div>
			)
			change_dice.push(change_container)
		}
		let commit_button = (<button id='commit_change'> Change </button>)
		change_dice.push(commit_button)


		return(
			<div id='main_window'>
				<div id='board'>
					<div id='dice_area'>
						<div id='dice_and_change' className='game_container'>
							<div id='dice'>
								{dice}
							</div>
							<div id='change_dice'>
								{change_dice}
							</div>
						</div>
						<div id='active_specia_card'>
							{draw_cards(this.props.G.active_special_card)}
						</div>
					</div>
					<div id='middlecol'>
						<div id='players' className='game_container'>
							{players}
						</div>
						<div id='mid_row'>
							<div id='main_deck' className='game_container'>
								{(this.props.G.deck.length === 0) ? null : <div className = 'card back' />}	
							</div>
							<div id='public_space' className='game_container'>
								{draw_cards(this.props.G.public_area)}
							</div>
							<div id='auction_deck' className='game_container'>
								{(this.props.G.auction_deck.length === 0) ? null : <div className = 'card back' />}	
							</div>
						</div>
						<div id='bottom_row'>
							<div id='bid_area' className='game_container'>
							</div>
							<div id='active_card' className='game_container'>
								{draw_active_area(this.props.G, this.props.ctx)}
							</div>
							<div id='pay_area' className='game_container'>
							</div>
						</div>
					</div>
				</div>
				<div id='hand' className='game_container'>
					{draw_cards(this.props.G.players[0].hand)}
				</div>
			</div>
		);
	}
}
