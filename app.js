const startMenu = document.getElementById('start-menu');
const rulesModal = document.getElementById('rules-modal');
const playGameButton = document.getElementById('play-game');
const showRulesButton = document.getElementById('show-rules');
const closeRulesButton = document.getElementById('close-rules');
const gameBoard = document.getElementById('game-board');
// Definir el mazo de cartas
const deck = [];
const suits = ["corazones", "diamantes", "tréboles", "picas"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// Parámetros del método de congruencia mixta
let seed = Date.now() % 1000; // Semilla inicial basada en el tiempo actual
const a = 1664525;            // Multiplicador
const c = 1013904223;         // Incremento
const m = Math.pow(2, 32);    // Módulo (2^32)


// Función para iniciar el juego y ocultar el menú de inicio
playGameButton.addEventListener('click', () => {
    startMenu.style.display = 'none';
    gameBoard.style.display = 'block';
    startGame();
});

// Función para mostrar las reglas
showRulesButton.addEventListener('click', () => {
    rulesModal.style.display = 'flex';
});

// Función para cerrar las reglas
closeRulesButton.addEventListener('click', () => {
    rulesModal.style.display = 'none';
});

// Generador de números pseudoaleatorios con el método de congruencia mixta
function getRandomNumber(min, max) {
    seed = (a * seed + c) % m; // Actualizar la semilla
    const random = seed / m;    // Escalar el valor entre 0 y 1
    return Math.floor(random * (max - min + 1)) + min;
}

// Crear el mazo de cartas
function createDeck() {
    deck.length = 0;  // Reiniciar el mazo
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ value, suit });
        }
    }
}

// Función para sacar una carta aleatoria del mazo
function drawCard() {
    const randomIndex = getRandomNumber(0, deck.length - 1);
    return deck.splice(randomIndex, 1)[0]; // Remover y devolver una carta aleatoria
}

// Calcular los puntos
function calculatePoints(hand) {
    let points = 0;
    let aces = 0;

    for (let card of hand) {
        if (card.value === "A") {
            points += 11;
            aces += 1;
        } else if (["J", "Q", "K"].includes(card.value)) {
            points += 10;
        } else {
            points += parseInt(card.value);
        }
    }

    // Ajustar los ases si es necesario
    while (points > 21 && aces > 0) {
        points -= 10;
        aces -= 1;
    }

    return points;
}

// Mostrar las cartas en pantalla con imágenes
function displayCards(player, hand) {
    const cardContainer = document.getElementById(`${player}-cards`);
    cardContainer.innerHTML = '';
    const angleIncrement = 10; // Ángulo de inclinación entre cartas, ajusta según prefieras
    
    hand.forEach((card, index) => {
        const cardImage = document.createElement('img');
        cardImage.src = `img/${card.suit}/${card.value}_de_${card.suit}.png`;
        cardImage.alt = `${card.value} de ${card.suit}`;
        cardImage.className = "card-image";
        
        // Inclinación incremental para cada carta
        const angle = -angleIncrement + index * angleIncrement * 2 / (hand.length - 1);
        cardImage.style.transform = `rotate(${angle}deg)`;
        
        cardContainer.appendChild(cardImage);
    });
}

// Actualizar el puntaje en pantalla
function updateScore(player, score) {
    document.getElementById(`${player}-score`).textContent = `Puntos: ${score}`;
}

// Variables del juego
let dealerHand = [];
let playerHand = [];
let playerTurn = true;

// Inicio del juego
function startGame() {
    createDeck();
    dealerHand = [drawCard(), drawCard()];
    playerHand = [drawCard(), drawCard()];

    displayCards('dealer', dealerHand.slice(0, 1)); // Mostrar solo la primera carta del crupier
    displayCards('player', playerHand);

    updateScore('dealer', calculatePoints(dealerHand.slice(0, 1))); // Mostrar puntos parciales
    updateScore('player', calculatePoints(playerHand));

    document.getElementById('message').textContent = '';
    playerTurn = true;
}

// Jugador pide carta
document.getElementById('hit').addEventListener('click', () => {
    if (playerTurn) {
        playerHand.push(drawCard());
        displayCards('player', playerHand);
        const playerPoints = calculatePoints(playerHand);
        updateScore('player', playerPoints);

        // Si el jugador se pasa de 21 puntos, pierde automáticamente
        if (playerPoints > 21) {
            document.getElementById('message').textContent = 'Te has pasado de 21. ¡Perdiste!';
            playerTurn = false;
            endDealerTurn();
        }
    }
});

// Jugador se planta
document.getElementById('stand').addEventListener('click', () => {
    if (playerTurn) {
        playerTurn = false;
        endDealerTurn();
    }
});

// Función para manejar el turno del crupier
function endDealerTurn() {
    let dealerPoints = calculatePoints(dealerHand);
    displayCards('dealer', dealerHand); // Mostrar todas las cartas del crupier
    updateScore('dealer', dealerPoints);

    // El crupier sigue tomando cartas hasta tener al menos 17 puntos
    while (dealerPoints < 17) {
        dealerHand.push(drawCard());
        dealerPoints = calculatePoints(dealerHand);
        displayCards('dealer', dealerHand);
        updateScore('dealer', dealerPoints);
    }

    // Determinar el resultado final
    const playerPoints = calculatePoints(playerHand);

    if (playerPoints > 21 && dealerPoints > 21) {
        document.getElementById('message').textContent = 'Ambos se han pasado de 21. ¡Ambos pierden!';
    } else if (playerPoints > 21) {
        document.getElementById('message').textContent = 'Te has pasado de 21. ¡El crupier gana!';
    } else if (dealerPoints > 21) {
        document.getElementById('message').textContent = 'El crupier se ha pasado de 21. ¡Ganaste!';
    } else if (playerPoints === dealerPoints) {
        document.getElementById('message').textContent = 'Empate. Ambos tienen el mismo puntaje.';
    } else if (playerPoints > dealerPoints) {
        document.getElementById('message').textContent = '¡Ganaste! Tienes más puntos que el crupier.';
    } else {
        document.getElementById('message').textContent = 'El crupier gana. Tiene más puntos que tú.';
    }
}

// Nuevo juego
document.getElementById('new-game').addEventListener('click', startGame);

// Iniciar el primer juego
startGame();
