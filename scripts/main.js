let finished = false;
const winData = JSON.parse(localStorage.getItem('winData')) || {};

const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');
const cars = document.querySelectorAll('.car');

startButton.addEventListener('click', () => {
    cars.forEach(car => {
        const randomSpeed = Math.random() * 5 + 2;
        car.style.transition = `transform ${randomSpeed}s linear`;
        car.style.transform = 'translateX(90vw)';
    });
});

cars.forEach(car => {
    car.addEventListener('transitionend', () => {
        if (!finished) {    
            finished = true;
            alert(`${car.id} wins!`);
            winData[car.id] = (winData[car.id] || 0) + 1;   
            localStorage.setItem('winData', JSON.stringify(winData));
            console.table(winData);
        }
    });
}); 

resetButton.addEventListener('click', () => {
    cars.forEach(car => {
        car.style.transition = 'none';
        car.style.transform = 'translateX(0)';
    });
    finished = false;
});
