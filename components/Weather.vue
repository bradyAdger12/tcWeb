<template>
  <div v-if="!loading">
    <p class="text-h4 title">Todays Weather for {{ locationName }}</p>
    <v-row>
      <v-col cols="auto">
        <div class="text-h3">{{ temperature }}<span>&#8457;</span></div>
      </v-col>
      <v-col cols="auto">
        <div class="text-h3">W {{ Math.round(wind.speed) }}mph</div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      lat: null,
      lon: null,
      iconUrl: null,
      temperature: null,
      locationName: "",
      weather: null,
      wind: null,
      loading: true,
    };
  },
  mounted() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.showPosition);
    }
  },
  methods: {
    showPosition(position) {
      this.lat = position.coords.latitude;
      this.lon = position.coords.longitude;
      console.log(this.lat, this.lon);
      this.getWeather();
    },
    async getWeather() {
      this.loading = true;
      if (this.lat && this.lon) {
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${this.lat}&lon=${this.lon}&appid=${process.env.WEATHER_API_KEY}&units=imperial`,
            {
              forceAuthentication: true,
            }
          );
          if (response.data) {
            this.locationName = response.data.name;
            this.weather = response.data.weather;
            this.wind = response.data.wind;
            this.temperature = response.data.main.temp;
            // this.iconUrl = "http://openweathermap.org/img/w/" + response.data. + ".png"
          }
        } catch (e) {}
      }
      this.loading = false;
    },
  },
};
</script>