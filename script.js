'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // km
    this.duration = duration; // min
  }

  // makes description for each workout
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

// running extends Workout class
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  // calculate pace
  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

//cycling extends Workout class
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    // calculates description
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([49.1167941, 18.3306917], 5.2, 24, 178);
// const cycling1 = new Cycling([49.1167742, 18.3306300], 27, 95, 523);
//
// console.log(run1);
// console.log(cycling1);

//////////////////////////////
// Application architecture
class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  // constructor of app class
  constructor() {
    // enables _getPosition(); method on page load
    this._getPosition();
    // get data from local storage
    this._getLocalStorage();
    // adds listener to from submit, binds _newWorkout method to this object to to cal this, in _newWorkout Method
    form.addEventListener('submit', this._newWorkout.bind(this));
    // enables _toggleElevationField() class on page load
    inputType.addEventListener('change', this._toggleElevationField);
    // event listener to move on pin on workout click
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  // gets users current position
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
    }
  }

  // load map on current user location
  _loadMap(position) {
    // gets latitude and longitude from API
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // creates link to current position in google maps
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}z`);

    // creates array of latitude and longitude to pass into setView
    const coords = [latitude, longitude];

    // console.log(this);
    this.#map = L.map('map', { closePopupOnClick: false }).setView(
      coords,
      this.#mapZoomLevel
    );
    // map.closePopupOnClick = false;
    // console.log(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      // L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {       // another style theme
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // method from leaflet, handling click on map
    // to work event handler function we need to bind the handler to self
    this.#map.on('click', this._showForm.bind(this));

    // renders markers on map
    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  // show the input form when user clicks anywhere on the map
  _showForm(mapE) {
    // wont work
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
    // console.log(mapEvent);
  }

  _hideForm() {
    // Empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    // to hide the form
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  // switches fields in input form based on workout type
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  // from event listener, display marker
  _newWorkout(e) {
    // small validation arrow function to check if input is a number
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    // check if number is positive or negative
    const validPositive = (...inputs) => inputs.every(inp => inp > 0);
    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // Check if data is valid

    // If workout running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !validPositive(distance, duration, cadence)
      )
        return alert('input have to be positive numbers');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      // elevation can be negative so we dont check for it
      if (
        !validInputs(distance, duration, elevation) ||
        !validPositive(distance, duration)
      )
        return alert('input have to be positive numbers');
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // add new object to workout array
    this.#workouts.push(workout);
    // console.log(workout);

    // console.log(mapEvent);

    // render new object on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout to list
    this._renderWorkout(workout);

    // hide form + clear input fields
    this._hideForm();

    // Set local storage to all workouts
    this._setLocalStorage();
  }

  // render marker on cursor position on the map
  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 150,
          autoClose: false,
          closeOnCLick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃' : '♂'} ${workout.description}`
      )
      .openPopup();
  }

  // crete workout HTML code to insert into list
  _renderWorkout(workout) {
    // create html for inserting workout into list on webpage
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃' : '♂'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;

    // if running adds this part to html
    if (workout.type === 'running') {
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`;
    }

    // if cycling add this to html
    if (workout.type === 'cycling') {
      html += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(2)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
    }

    // insert into sibling, the HTML code
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    // get to the closest element with .workout selector
    const workoutEl = e.target.closest('.workout');

    // guard method
    if (!workoutEl) return;

    // get data from selected workout, search for workout based on the generated id data-id
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    // console.log(workout);
    // console.log(workoutEl);

    // sets view of the map to selected workout, with animation
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // wising public interface to click
    // to make this work we need to recreate the data from local storage as object of workout
    // workout.click();
  }

  // sets local storages
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  // gets data from lcoal storage
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    // console.log(data);

    // guard
    if (!data) return;

    this.#workouts = data;

    // renders each workout from local storage to list
    this.#workouts.forEach(work => {
      this._renderWorkout(work);
      // wont work because it calls before it creates the entire map
      // this._renderWorkoutMarker(work);
    });
  }

  // resets local storage data
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
