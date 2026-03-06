let winData = JSON.parse(localStorage.getItem('winData')) || {};
let finished = false;
let raceAnimationId = null;

const track = document.getElementById('game-container');
const carCountInput = document.getElementById('car-count');
const colorPickersContainer = document.getElementById('color-pickers');
const applyBtn = document.getElementById('apply-settings');
const scoreboard = document.getElementById('scoreboard');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');

function updateColorInputs() {
    const count = parseInt(carCountInput.value);
    colorPickersContainer.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        const div = document.createElement('div');
        div.className = 'color-input-item';
        div.innerHTML = `
            <span>№${i}</span>
            <input type="color" id="color-car${i}" value="${getDefaultColor(i)}">
        `;
        colorPickersContainer.appendChild(div);
    }
}

function getDefaultColor(i) {
    const colors = ['#ff4757', '#2ed573', '#1e90ff', '#eccc68', '#ffa502', '#3742fa'];
    return colors[(i - 1) % colors.length];
}

function updateDisplay() {
    Object.keys(winData).forEach(carId => {
        const carScore = document.getElementById(`score-${carId}`);
        if (carScore) carScore.textContent = winData[carId];
    });
}

function setupRace() {
    const count = parseInt(carCountInput.value);
    const finishLine = track.querySelector('.finish-line');
    
    track.innerHTML = '';
    track.appendChild(finishLine);
    scoreboard.innerHTML = '';

    for (let i = 1; i <= count; i++) {
        const color = document.getElementById(`color-car${i}`).value;
        const carId = `car${i}`;
        
        const car = document.createElement('div');
        car.className = 'car';
        car.id = carId;
        car.innerHTML = `<span>🏎️</span>`;
        car.style.borderColor = color;
        car.style.textShadow = `0 0 10px ${color}`;
        track.appendChild(car);

        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        scoreItem.innerHTML = `${carId}: <span id="score-${carId}">${winData[carId] || 0}</span>`;
        scoreboard.appendChild(scoreItem);
    }
}

function saveWin(carId) {
    winData[carId] = (winData[carId] || 0) + 1;
    localStorage.setItem('winData', JSON.stringify(winData));
    updateDisplay();
}

startButton.addEventListener('click', () => {
    if (finished) return;

    const trackWidth = track.offsetWidth;
    const carWidth = 60;
    const finishOffset = 70;
    const finishLine = trackWidth - carWidth - finishOffset;

    const currentCars = document.querySelectorAll('.car');
    const carsState = Array.from(currentCars).map(car => ({
        element: car,
        id: car.id,
        posX: 0,
        speed: Math.random() * 3 + 2 
    }));

    function move() {
        let winner = null;

        carsState.forEach(car => {
            car.speed += (Math.random() - 0.5);
            car.speed = Math.min(Math.max(car.speed, 2), 10);
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
            alert(`🏆 ${winner.id} wins!`);
            saveWin(winner.id);
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
    });
});

carCountInput.addEventListener('input', updateColorInputs);
applyBtn.addEventListener('click', () => {
    finished = false;
    setupRace();
});

updateColorInputs();
setupRace();