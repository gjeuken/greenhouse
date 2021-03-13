
function Card(category, number, num_effect) {
    const card = {};
    card.category = category;
    card.number = number;
    card.num_effect = num_effect;
    card.name = category + number.toString();
    return card;
}

function CreateMoneyDeck(n_players) {
    let money_deck = [];

    let num_each = 11;
    if (n_players === 2) { num_each = 9; }
    else if (n_players === 3) { num_each = 10; }

    var n;
    for (n = 0; n < num_each; n++) {
        let c1 = Card("G", 1, null);
        let c2 = Card("G", 2, null);
        let c3 = Card("G", 3, null);
        money_deck.push(c1);
        money_deck.push(c2);
        money_deck.push(c3);
    }

    return money_deck
}

function CreateCategoryDeck(n_players) {
    let category_deck = [];
    var n;

    // Add first two categories
    for (n = 0; n < 4; n++) {
        let c1 = Card("A", "2", null);
        let c2 = Card("B", "2", null);
        category_deck.push(c1);
        category_deck.push(c2);
    }
    for (n = 0; n < 3; n++) {
        let c1 = Card("A", "3", null);
        let c2 = Card("B", "3", null);
        category_deck.push(c1);
        category_deck.push(c2);
    }
    for (n = 0; n < 2; n++) {
        let c1 = Card("A", "4", null);
        let c2 = Card("B", "4", null);
        category_deck.push(c1);
        category_deck.push(c2);
    }

    // Add last three categories
    for (n = 0; n < 7; n++) {
        let c1 = Card("C", "1", null);
        let c2 = Card("D", "1", null);
        let c3 = Card("E", "1", null);
        category_deck.push(c1);
        category_deck.push(c2);
        category_deck.push(c3);
    }
    for (n = 0; n < 2; n++) {
        let c1 = Card("C", "2", null);
        let c2 = Card("D", "2", null);
        let c3 = Card("E", "2", null);
        category_deck.push(c1);
        category_deck.push(c2);
        category_deck.push(c3);
    }

    // Add special cards
    let c = Card("S", "+1-1", 1);
    category_deck.push(c);
    for (n = 0; n < 2; n++) {
        let c1 = Card("S", "+1", 1);
        let c2 = Card("S", "-1", 1);
        let c3 = Card("S", "+1", 2);
        let c4 = Card("S", "-1", 2);
        category_deck.push(c1);
        category_deck.push(c2);
        category_deck.push(c3);
        category_deck.push(c4);
    }

    // Shuffle the deck and remove cards
    category_deck = category_deck.map((a) => ({sort: Math.random(), value: a})).sort((a, b) => a.sort - b.sort).map((a) => a.value)
	if (n_players === 2) { category_deck.splice(category_deck.length-21, category_deck.length); }
	else if (n_players === 3) { category_deck.splice(category_deck.length-12, category_deck.length); }

    return category_deck
}

export function CreateDeck(n_players) {
    let deck = CreateMoneyDeck(n_players);
    let category_deck = CreateCategoryDeck(n_players);

    // Combine decks and shuffle
    deck = deck.concat(category_deck);
    deck = deck.map((a) => ({sort: Math.random(), value: a})).sort((a, b) => a.sort - b.sort).map((a) => a.value)

    // Remove cards
    if (n_players === 4) { category_deck.splice(category_deck.length-7, category_deck.length); }

    return deck
}
