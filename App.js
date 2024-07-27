const selectors = {
    board: document.querySelector('.board'),
    boardContainer: document.querySelector('.board-container'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('#start'),
    restart: document.querySelector('#restart'),
    win: document.querySelector('.win')
}

const state = {
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null,
    gameStarted: false
}

const emojis = ['😀', '😂', '😍', '😎', '🥳', '🤔', '😜', '😎', '😛', '🤯']

const shuffle = array => array.sort(() => Math.random());

const pickRandom = (array, items) => {
    const clonedArray = [...array];
    const randomPicks = [];
    for (let i = 0; i < items; i++) {
        const index = Math.floor(Math.random() * clonedArray.length);
        randomPicks.push(clonedArray.splice(index, 1)[0]);
    }
    return randomPicks;
}

const generateGame = () => {
    const dimensions = selectors.board.getAttribute('data-dimension');
    if (dimensions % 2 !== 0) throw new Error("The dimension of the board must be an even number.");

    const picks = pickRandom(emojis, (dimensions * dimensions) / 2);
    const items = shuffle([...picks, ...picks]);
    const cardsHTML = items.map(item => `
        <div class="card">
            <div class="card-front"></div>
            <div class="card-back">${item}</div>
        </div>
    `).join('');

    selectors.board.innerHTML = `<div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">${cardsHTML}</div>`;
}

const startGame = () => {
    state.gameStarted = true;
    selectors.start.classList.add('disabled');
    state.loop = setInterval(() => {
        state.totalTime++;
        selectors.timer.innerText = `Time: ${state.totalTime}`;
        selectors.moves.innerText = `Moves: ${state.totalFlips}`;
    }, 1000);

    // Play background music
    document.getElementById('background-music').play();
}

const restartGame = () => {
    state.gameStarted = false;
    state.flippedCards = 0;
    state.totalFlips = 0;
    state.totalTime = 0;
    clearInterval(state.loop);

    selectors.timer.innerText = `Time: ${state.totalTime}`;
    selectors.moves.innerText = `Moves: ${state.totalFlips}`;
    selectors.win.innerHTML = '';

    selectors.boardContainer.classList.remove('flipped');

    document.querySelectorAll('.card').forEach(card => card.classList.remove('flipped', 'matched'));

    generateGame();

    document.getElementById('background-music').pause();
    document.getElementById('background-music').currentTime = 0;
}

const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => card.classList.remove('flipped'));
    state.flippedCards = 0;
}

const flipCard = card => {
    document.getElementById('flip-sound').play();

    state.flippedCards++;
    state.totalFlips++;

    if (!state.gameStarted) startGame();
    if (state.flippedCards <= 2) card.classList.add('flipped');

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)');
        if (flippedCards[0].innerText === flippedCards[1].innerText) {
            flippedCards.forEach(fc => fc.classList.add('matched'));
            document.getElementById('match-sound').play();
        }
        setTimeout(flipBackCards, 1000);
    }

    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped');
            selectors.win.innerHTML = `
                <span class="win-text">
                    You won!🏆<br />
                    with <span class="highlight">${state.totalFlips}</span> moves<br />
                    under <span class="highlight">${state.totalTime}</span> seconds
                </span>
            `;
            document.getElementById('win-sound').play();
            clearInterval(state.loop);
        }, 1000);
    }
}

const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const target = event.target;
        const card = target.classList.contains('card') ? target : target.closest('.card');
        if (card && !card.classList.contains('flipped')) {
            flipCard(card);
        } else if (target.id === 'start' && !target.classList.contains('disabled')) {
            startGame();
        } else if (target.id === 'restart') {
            restartGame();
        }
    });
}

generateGame();
attachEventListeners();
