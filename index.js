let gameRunning = false;
let win = false;
let powerupTimer = undefined;
let timer = 0;

async function loadPokemon(pokemonToGet) {
	$(".game_status").html("Loading...");

	$("#game_grid").empty();

	let response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1400`);

	let pokemon = await response.json();

	let cards = [];

	for (i = 0; i < pokemonToGet; i++) {
		let randomPick = Math.floor(Math.random() * pokemon.count);

		for (j = 0; j < 2; j++) {
			let name = pokemon.results[randomPick].name;

			let response2 = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
			let pokemonRecord = await response2.json();

			let html = ejs.render(`
			<div class="card">
				<img id="<%= name %><%= num %>" class="front_face" src="<%= img %>" alt="">
				<img class="back_face" src="back.webp" alt="">
			</div>
			`,
				{
					name: name,
					num: j,
					img: pokemonRecord.sprites.other['official-artwork'].front_default
				}
			);

			cards.push(html);
		}
	}

	// taken from here: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	let shuffledCards = cards.map(value => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value);

	for (i = 0; i < cards.length; i++) {
		document.getElementById('game_grid').innerHTML += shuffledCards[i];
	}

	$(".game_status").html("DONE!");

	setTimeout(() => {
		$(".game_status").html("");
	}, 1000);
}

function powerup() {
	if (powerupTimer == undefined) {
		powerupTimer = setTimeout(2000);
	} else if (powerupTimer != undefined) {
		timer += 2;
		$(".match_status").html("Quick Match!!");

		setTimeout(() => {
			$(".match_status").html("");
		}, 1000);
	}
}

function setup(difficulty) {
	let firstCard = undefined;
	let secondCard = undefined;

	let clicks = 0;
	let matches = 0;
	let total = difficulty;

	switch (difficulty) {
		case 3: {
			timer = 10;
			break;
		}
		case 6: {
			timer = 20;
			break;
		}
		case 12: {
			timer = 40;
			break;
		}
	}

	gameRunning = true;
	win == false;

	let gameTimer = setInterval(() => {

		if (timer == 0 || win == true) {
			console.log('Done counter');
			clearInterval(gameTimer);
			win = false;
			$(".card").off("click");
			$(".game_status").html("Game Over!");
		}
		$(".timer").html(`Timer: ${timer--}`);
	}, 1000);

	$(".card").on(("click"), async function () {
		$(".clicks").html(`Clicks: ${++clicks}`);

		$(this).toggleClass("flip");
		$(this).css("pointer-events", "none");

		if (!firstCard) {
			firstCard = $(this).find(".front_face")[0];
			console.log(firstCard);
		}
		else {
			secondCard = $(this).find(".front_face")[0];
			console.log(firstCard, secondCard);

			$(".card").css("pointer-events", "none");

			if (firstCard.id == secondCard.id) {
				console.log("no match");

				setTimeout(() => {
					$(`#${firstCard.id}`).parent().toggleClass("flip");
					$(`#${secondCard.id}`).parent().toggleClass("flip");

					firstCard = undefined;
					secondCard = undefined;

					$(".card").css("pointer-events", "all");
				}, 1000);
			}
			else if (firstCard.src == secondCard.src) {
				console.log("match");

				$(`#${firstCard.id}`).parent().off("click");
				$(`#${secondCard.id}`).parent().off("click");

				firstCard = undefined;
				secondCard = undefined;

				$(".card").css("pointer-events", "all");

				matches++;
				powerup();

				$(".pairs").html(`Pairs: ${matches}/${total}`);
			} else {
				console.log("no match");

				setTimeout(() => {
					$(`#${firstCard.id}`).parent().toggleClass("flip");
					$(`#${secondCard.id}`).parent().toggleClass("flip");

					firstCard = undefined;
					secondCard = undefined;

					$(".card").css("pointer-events", "all");

				}, 1000);
			}
		}

		if (matches == total) {
			win = true;
		}
	});
}


// RUNTIME LOGIC --------------------------------------------------
$(async function () {
	let difficulty = 3;

	$(".theme_toggle").on(("click"), function () {
		if ($('html').attr("data-bs-theme") == "dark") {
			$('html').attr("data-bs-theme", "light");
		} else {
			$('html').attr("data-bs-theme", "dark");
		}
	})

	$(".easy").on(("click"), function () {
		$("#game_grid").attr("class", "container easy_dif");
		difficulty = 3;
	});
	$(".medium").on(("click"), function () {
		$("#game_grid").attr("class", "container medium_dif");
		difficulty = 6;
	});
	$(".hard").on(("click"), function () {
		$("#game_grid").attr("class", "container hard_dif");

		difficulty = 12;
	});

	// There's a better way to do this
	$(".reset").on(("click"), async function () {
		$(".clicks").html(`Clicks: 0`);
		$(".pairs").html(`Pairs: 0/0`);
		$(".timer").html(`Timer: 0`);
		
		await loadPokemon(difficulty);
		setup(difficulty);
	});

	$(".start").on(("click"), async function () {
		$(".clicks").html(`Clicks: 0`);
		$(".pairs").html(`Pairs: 0/0`);
		$(".timer").html(`Timer: 0`);

		await loadPokemon(difficulty);
		setup(difficulty);

		$(".reset").attr("disabled", false);
	});
});