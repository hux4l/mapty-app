'use strict';


// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map;
let mapEvent;

if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        // gets latitude and longitude from API
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        // creates link to current position in google maps
        console.log(`https://www.google.com/maps/@${latitude},${longitude}z`);

        const coords = [latitude, longitude];

        map = L.map('map', {closePopupOnClick: false}).setView(coords, 13);
        // map.closePopupOnClick = false;
        console.log(map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        // L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {       // another style theme
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // method from leaflet, handling click on map
        map.on('click', function (mapE) {
            mapEvent = mapE;
            form.classList.remove('hidden');
            inputDistance.focus();
            // console.log(mapEvent);

        });
    }, function () {
        alert('Could not get your position');
    });
}

// from event listener
form.addEventListener('submit', function (e) {
    e.preventDefault();
    // console.log(mapEvent);


    // clear input fields
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

    // gets coordinates from cursor click position
    const {lat, lng} = mapEvent.latlng;

    // adds marker on cursor position on the map
    L.marker([lat, lng]).addTo(map).bindPopup(L.popup({
        maxWidth: 250,
        minWidth: 150,
        autoClose: false,
        closeOnCLick: false,
        className: 'running-popup',
    })).setPopupContent('Workout').openPopup();
});

// adds event listener on changing selector input
inputType.addEventListener('change', function () {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});