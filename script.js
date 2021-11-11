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

class App {
    #map;
    #mapEvent;

    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newWorkout.bind(this));
        this._toggleElevationField();
    }

    // gets users current position
    _getPosition() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () { alert('Could not get your position'); });
        }
    }

    // load map on current user location
    _loadMap(position) {
        // gets latitude and longitude from API
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        // creates link to current position in google maps
        console.log(`https://www.google.com/maps/@${latitude},${longitude}z`);

        const coords = [latitude, longitude];

        console.log(this);
        this.#map = L.map('map', {closePopupOnClick: false}).setView(coords, 13);
        // map.closePopupOnClick = false;
        // console.log(map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            // L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {       // another style theme
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        // method from leaflet, handling click on map
        // to work event handler function we need to bind the handler to self
        this.#map.on('click', this._showForm.bind(this));
    }

    // show the input form when user clicks anywhere on the map
    _showForm(mapE) {
        // wont work
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
        // console.log(mapEvent);
    }

    // switches fields in input form based on workout type
    _toggleElevationField() {
        // adds event listener on changing selector input
        inputType.addEventListener('change', function () {
            inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        });
    }

    // from event listener, display marker
    _newWorkout(e) {
        e.preventDefault();
        // console.log(mapEvent);

        // clear input fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

        // gets coordinates from cursor click position
        const {lat, lng} = this.#mapEvent.latlng;

        // adds marker on cursor position on the map
        L.marker([lat, lng]).addTo(this.#map).bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 150,
            autoClose: false,
            closeOnCLick: false,
            className: 'running-popup',
        })).setPopupContent('Workout').openPopup();
    }
}

const app = new App();