
function Card(category, number, letter, num_effect, effect) {
    const card = {};
    card.category = category;
	card.number = number;
	card.letter = letter;
    card.num_effect = num_effect;
	card.effect = effect;
    return card;
}

function CreateMoneyDeck(n_players) {
    let money_deck = [];

    let num_each = 11;
    if (n_players === 2) { num_each = 9; }
    else if (n_players === 3) { num_each = 10; }

    var n;
    for (n = 0; n < num_each; n++) {
        let c1 = Card("g", 1, null, null, null);
        let c2 = Card("g", 2, null, null, null);
        let c3 = Card("g", 3, null, null, null);
        money_deck.push(c1);
        money_deck.push(c2);
        money_deck.push(c3);
    }

    return money_deck
}

function CreateCategoryDeck(n_players) {
    let category_deck = [];
    var n;

	let letters = ['A','B','C','D','E','F','G','H', 'I'];

	let l_ind = 0;
    // Add first two categories
    for (n = 0; n < 4; n++) {
        let c1 = Card("a", 2, letters[l_ind], null, null);
        let c2 = Card("b", 2, letters[l_ind], null, null);
        category_deck.push(c1);
        category_deck.push(c2);
		l_ind++;
    }
    for (n = 0; n < 3; n++) {
        let c1 = Card("a", 3, letters[l_ind], null, null);
        let c2 = Card("b", 3, letters[l_ind], null, null);
        category_deck.push(c1);
        category_deck.push(c2);
		l_ind++;
    }
    for (n = 0; n < 2; n++) {
        let c1 = Card("a", 4, letters[l_ind], null, null);
        let c2 = Card("b", 4, letters[l_ind], null, null);
        category_deck.push(c1);
        category_deck.push(c2);
		l_ind++;
    }

    // Add last three categories
	l_ind = 0;
    for (n = 0; n < 7; n++) {
        let c1 = Card("c", 1, letters[l_ind], null, null);
        let c2 = Card("d", 1, letters[l_ind], null, null);
        let c3 = Card("e", 1, letters[l_ind], null, null);
        category_deck.push(c1);
        category_deck.push(c2);
        category_deck.push(c3);
		l_ind++;
    }
    for (n = 0; n < 2; n++) {
        let c1 = Card("c", 2, letters[l_ind], null, null);
        let c2 = Card("d", 2, letters[l_ind], null, null);
        let c3 = Card("e", 2, letters[l_ind], null, null);
        category_deck.push(c1);
        category_deck.push(c2);
        category_deck.push(c3);
		l_ind++;
    }

    // Add special cards
    // let c = Card("s", null, null, 1, 'plusminus');
    // category_deck.push(c);
    // for (n = 0; n < 2; n++) {
    //     let c1 = Card("s", null, null, 1, 'plus');
    //     let c2 = Card("s", null, null, 1, 'minus');
    //     let c3 = Card("s", null, null, 2, 'plus');
    //     let c4 = Card("s", null, null, 2, 'minus');
    //     category_deck.push(c1);
    //     category_deck.push(c2);
    //     category_deck.push(c3);
    //     category_deck.push(c4);
    // }

    return category_deck
}

export function CreateDeck(n_players) {
    let deck = CreateMoneyDeck(n_players);
    let category_deck = CreateCategoryDeck(n_players);

    // Combine decks and shuffle
    deck = deck.concat(category_deck);

    deck = deck.map((a) => ({sort: Math.random(), value: a})).sort((a, b) => a.sort - b.sort).map((a) => a.value)

    // Remove cards
    if (n_players === 2) { deck.splice(deck.length-21, deck.length); }
    else if (n_players === 3) { deck.splice(deck.length-12, deck.length); }
    else { deck.splice(deck.length-7, deck.length); }

    return deck
}
