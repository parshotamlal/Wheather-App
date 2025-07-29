// Function to show custom alert with a specific message
function showAlert(message) {
    const customAlert = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message;
    customAlert.style.display = 'flex'; // Display the alert
  }
  
  // Function to close the custom alerts
  function closeAlert() {
    const customAlert = document.getElementById('customAlert');
    customAlert.style.display = 'none';
  }
  
  // Function to fetch weather data based on city name input
  async function FetchData() {
    loader.style.display = 'block'; // Show loader while fetching
    const apiKey = '8253ad72e9e33eddee65652361af4b06';
    const cityName = document.querySelector('input').value;
  
    document.querySelector('input').value = ''; // Clear input field
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}`;
  
    try {
      const response = await fetch(apiUrl);
      const responseJSON = await response.json();
      console.log(responseJSON); // For debugging
      assignValue(responseJSON); // Populate data into UI
  
      // Save city name to local storage
      let cityNameArray = JSON.parse(localStorage.getItem('cityNameArray')) || [];
      cityNameArray.push({ name: cityName });
  
      // Limit storage to last 5 searches
      if (cityNameArray.length >= 5) {
        cityNameArray.shift(); // Remove oldest
      }
  
      localStorage.setItem('cityNameArray', JSON.stringify(cityNameArray));
    } catch (err) {
      showAlert('Invalid City Name. Please enter a valid city.');
      console.log(err);
    } finally {
      loader.style.display = 'none'; // Hide loader
    }
  }
  
  // Function to assign fetched data to UI
  function assignValue(data) {
    // Get local time using timezone offset
    const timezoneOffset = data.city.timezone;
    const localDate = new Date(new Date().getTime() + timezoneOffset * 1000);
    const formattedTime = localDate.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    const formattedDate = localDate.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  
    // Update city name and time
    const cityNameElement = document.querySelector('#cityName');
    cityNameElement.textContent = `${data.city.name} (${formattedDate}, ${formattedTime})`;
  
    // Convert and display temperature (Kelvin to Celsius)
    const temp = (data.list[0].main.temp - 273.15).toFixed(1);
    document.querySelector('#temp').innerHTML =
      `<i class="fa-solid text-red-500 fa-temperature-high"></i> Temperature : ${temp} C°`;
  
    // Display wind speed
    document.querySelector('#Wind').innerHTML =
      `<i class="fa-solid text-yellow-400 fa-fan"></i> Wind : ${data.list[0].wind.gust} m/s`;
  
    // Display humidity
    document.querySelector('#humidity').innerHTML =
      `<i class="fa-solid text-blue-700 fa-droplet"></i> Humidity : ${data.list[0].main.humidity} %`;
  
    // Display main weather icon and description
    const iconCode = data.list[0].weather[0].icon;
    document.querySelector('#imgEl').src = `http://openweathermap.org/img/wn/${iconCode}.png`;
    document.querySelector('#iconDesc').textContent = data.list[0].weather[0].description;
  
    // Loop through forecast data (every 8th index = ~24 hours) for 5-day forecast
    for (let i = 6; i <= 38; i += 8) {
      let date = data.list[i].dt_txt.substring(0, 10);
      document.querySelector(`#Date${i}`).textContent = `( ${date} )`;
  
      // Display temperature
      let temp = (data.list[i].main.temp - 273.15).toFixed(1);
      document.querySelector(`#temp${i}`).innerHTML =
        `<i class="fa-solid text-red-200 fa-temperature-high"></i> Temp <i class="fa-solid fa-arrow-right"></i> ${temp} C°`;
  
      // Display wind
      document.querySelector(`#Wind${i}`).innerHTML =
        `<i class="fa-solid text-red-200 fa-fan"></i> Wind <i class="fa-solid fa-arrow-right"></i> ${data.list[i].wind.gust} m/s`;
  
      // Display humidity
      document.querySelector(`#humidity${i}`).innerHTML =
        `<i class="fa-solid text-red-200 fa-droplet"></i> Humidity <i class="fa-solid fa-arrow-right"></i> ${data.list[i].main.humidity} %`;
  
      // Display weather icon and description
      let iconCode = data.list[i].weather[0].icon;
      document.querySelector(`.imgElClass${i}`).src = `http://openweathermap.org/img/wn/${iconCode}.png`;
      document.querySelector(`.iconDescClass${i}`).textContent = data.list[i].weather[0].description;
    }
  }
  
  // Function to manage recent search history
  function SearchList() {
    let recentSearchDiv = document.querySelector('.recentSearchesDiv');
    let inputElement = document.querySelector('#inputEl');
  
    inputElement.addEventListener('click', function () {
      let cityNameArray = JSON.parse(localStorage.getItem('cityNameArray')) || [];
      recentSearchDiv.style.display = cityNameArray.length === 0 ? 'none' : 'block';
  
      let recentSearchesDiv = document.querySelector('.recentSearches');
      recentSearchesDiv.innerHTML = ''; // Clear previous list
  
      cityNameArray.reverse(); // Show latest on top
      for (let city of cityNameArray) {
        let searchListDiv = document.createElement('div');
        searchListDiv.classList.add('searchList');
  
        // Create clickable city name
        let para1 = document.createElement('p');
        para1.innerHTML = `<i class="fa-regular fa-clock"></i> ${city.name}`;
        para1.addEventListener('click', () => {
          inputElement.value = para1.textContent;
        });
  
        // Create 'X' button to remove from recent list
        let para2 = document.createElement('p');
        para2.textContent = 'X';
        para2.addEventListener('click', function () {
          cityNameArray = cityNameArray.filter(c => c.name !== city.name);
          localStorage.setItem('cityNameArray', JSON.stringify(cityNameArray));
          searchListDiv.remove();
        });
  
        searchListDiv.appendChild(para1);
        searchListDiv.appendChild(para2);
        recentSearchesDiv.appendChild(searchListDiv);
      }
    });
  
    // Hide search list on click elsewhere
    document.querySelector('.searchBtn').addEventListener('click', () => recentSearchDiv.style.display = 'none');
    document.querySelector('.cross').addEventListener('click', () => recentSearchDiv.style.display = 'none');
    document.querySelector('.halfRightDashboard').addEventListener('click', () => recentSearchDiv.style.display = 'none');
    document.querySelector('.DashboardHead').addEventListener('click', () => recentSearchDiv.style.display = 'none');
  }
  
  // Hide recent search dropdown initially
  let recentSearchDiv = document.querySelector('.recentSearchesDiv');
  recentSearchDiv.style.display = 'none';
  SearchList(); // Initialize recent search feature
  
  // Fetch weather data using current location
  function fetchLocation() {
    let apiKey = '8253ad72e9e33eddee65652361af4b06';
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
  
      try {
        // Fetch city name based on lat/lon
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
        const res = await response.json();
  
        // Autofill city input and fetch forecast
        document.querySelector('input').value = res.name;
        FetchData();
      } catch (err) {
        console.log(err);
      }
    }, (error) => {
      console.error(`Error Code = ${error.code} - ${error.message}`);
    });
  
  }
