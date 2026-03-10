const CONFIG = {
    INITIAL_BALANCE: 1000,
    SPEED: {
        MIN_START: 2,
        MAX_START: 5,
        VARIATION: 0.4,
        MIN_LIMIT: 1.5,
        MAX_LIMIT: 11
    },
    COLORS: ['#ff4757', '#2ed573', '#1e90ff', '#eccc68', '#ffa502', '#3742fa'],
    STORAGE_KEYS: {
        WINS: 'winData',
        BALANCE: 'userBalance'
    }
};

const getCssVar = (name, fallback) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!value) return fallback;
    return value.endsWith('px') ? parseInt(value) : value;
};

let winData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.WINS)) || {};
let userBalance = parseInt(localStorage.getItem(CONFIG.STORAGE_KEYS.BALANCE)) || CONFIG.INITIAL_BALANCE;
let finished = false;
let raceAnimationId = null;

const track = document.getElementById('game-container');
const carCountInput = document.getElementById('car-count');
const colorPickersContainer = document.getElementById('color-pickers');
const applyBtn = document.getElementById('apply-settings');
const scoreboard = document.getElementById('scoreboard');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');
const balanceDisplay = document.getElementById('balance-display');
const betAmountInput = document.getElementById('bet-amount');
const betCarSelect = document.getElementById('bet-car-select');

function updateColorInputs() {
    const count = parseInt(carCountInput.value);
    colorPickersContainer.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        const div = document.createElement('div');
        div.className = 'color-input-item';
        div.innerHTML = `
            <span>№${i}</span>
            <input type="color" id="color-car${i}" value="${CONFIG.COLORS[(i - 1) % CONFIG.COLORS.length]}">
        `;
        colorPickersContainer.appendChild(div);
    }
}

function updateDisplay() {
    Object.keys(winData).forEach(carId => {
        const carScore = document.getElementById(`score-${carId}`);
        if (carScore) carScore.textContent = winData[carId];
    });
    balanceDisplay.textContent = userBalance;
    localStorage.setItem(CONFIG.STORAGE_KEYS.BALANCE, userBalance);
}

function setupRace() {
    const count = parseInt(carCountInput.value);
    const finishLineElement = document.createElement('div');
    finishLineElement.className = 'finish-line';
    
    track.innerHTML = '';
    track.appendChild(finishLineElement);
    scoreboard.innerHTML = '';
    betCarSelect.innerHTML = '<option value="">Choose car</option>';

    for (let i = 1; i <= count; i++) {
        const colorInput = document.getElementById(`color-car${i}`);
        const color = colorInput ? colorInput.value : CONFIG.COLORS[i-1];
        const carId = `car${i}`;
        
        const car = document.createElement('div');
        car.className = 'car';
        car.id = carId;
        car.innerHTML = `<span>🏎️</span>`;
        car.style.borderColor = color;
        car.style.textShadow = `0 0 ${getCssVar('--glow-strength', 10)}px ${color}`;
        track.appendChild(car);

        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        scoreItem.innerHTML = `Car ${i}: <span id="score-${carId}">${winData[carId] || 0}</span>`;
        scoreboard.appendChild(scoreItem);

        const option = document.createElement('option');
        option.value = carId;
        option.textContent = `Car №${i}`;
        betCarSelect.appendChild(option);
    }
    updateDisplay();
}

function handleBetResult(winnerId) {
    const betAmount = parseInt(betAmountInput.value) || 0;
    const selectedCar = betCarSelect.value;

    if (selectedCar === winnerId) {
        userBalance += betAmount;
        alert(`🎉 Win! Car ${winnerId} finished first. You got ${betAmount}$!`);
    } else if (selectedCar !== "") {
        userBalance -= betAmount;
        alert(`😔 Loss! Car ${winnerId} won. You lost ${betAmount}$.`);
    } else {
        alert(`🏁 Race finished! Winner: ${winnerId}`);
    }

    winData[winnerId] = (winData[winnerId] || 0) + 1;
    localStorage.setItem(CONFIG.STORAGE_KEYS.WINS, JSON.stringify(winData));
    updateDisplay();
}

startButton.addEventListener('click', () => {
    if (finished) return;

    const betAmount = parseInt(betAmountInput.value) || 0;
    if (betCarSelect.value !== "" && betAmount > userBalance) {
        alert("Not enough money!");
        return;
    }

    const trackWidth = track.offsetWidth;
    const carSize = getCssVar('--car-size', 60);
    const finishOffset = getCssVar('--finish-line-offset', 50);
    const finishLine = trackWidth - carSize - finishOffset;

    const currentCars = document.querySelectorAll('.car');
    const carsState = Array.from(currentCars).map(car => ({
        element: car,
        id: car.id,
        posX: 0,
        speed: Math.random() * (CONFIG.SPEED.MAX_START - CONFIG.SPEED.MIN_START) + CONFIG.SPEED.MIN_START
    }));

    function move() {
        let winner = null;

        carsState.forEach(car => {
            car.speed += (Math.random() - 0.5) * CONFIG.SPEED.VARIATION;
            car.speed = Math.min(Math.max(car.speed, CONFIG.SPEED.MIN_LIMIT), CONFIG.SPEED.MAX_LIMIT);
            car.posX += car.speed;
            car.element.style.transform = `translateX(${car.posX}px)`;

            if (car.posX >= finishLine && !winner) {
                winner = car;
            }
        });

        if (!winner) {
            raceAnimationId = requestAnimationFrame(move);
        } else {
            cancelAnimationFrame(raceAnimationId);
            finished = true;
            
            winner.element.classList.add('winner-glow');
            winner.element.style.setProperty('--final-pos', `${winner.posX}px`);
            
            setTimeout(() => {
                handleBetResult(winner.id);
            }, 100);
        }
    }

    move();
});

resetButton.addEventListener('click', () => {
    cancelAnimationFrame(raceAnimationId);
    finished = false;
    const currentCars = document.querySelectorAll('.car');
    currentCars.forEach(car => {
        car.style.transform = 'translateX(0)';
        car.classList.remove('winner-glow');
    });
});

carCountInput.addEventListener('input', updateColorInputs);
applyBtn.addEventListener('click', () => {
    finished = false;
    setupRace();
});

updateColorInputs();
setupRace();