<template>
  <div>
    <div style="position: relative; height: 900px">
      <video autoplay muted loop id="myVideo">
        <source src="../assets/TrainingClub_Background.mp4" type="video/mp4" />
      </video>
      <div class="video-overlay" />
      <div style="position: absolute; top: 0; color: white; z-index: 2">
        <v-container>
          <v-row justify="center" align="center" class="mt-16">
            <v-col cols="12">
              <p class="text-h1 font-weight-bold">
                Welcome to {{ $app_config.title }}
              </p>
              <p class="subtitle">
                A simple and easy to use training app to help you reach your
                endurance sport goals.
              </p>
              <v-row v-if="!authenticated" class="mt-2">
                <v-col cols="auto">
                  <NuxtLink class="auth-link" to="/login">
                    <v-btn> Login </v-btn>
                  </NuxtLink></v-col
                >
                <v-col cols="auto">
                  <NuxtLink class="auth-link" to="/register">
                    <v-btn> Register </v-btn>
                  </NuxtLink></v-col
                >
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>
    <!-- <v-container class="white--text">
      <div>
        <p class="text-h1 font-weight-bold">How To Get Started</p>
        <ol class="text-h6">
          <li><NuxtLink to="/register" class="white--text">Register</NuxtLink> a new account.</li>
          <li>Enter in training data so we can get you as much training feedback as possible.</li>
          <li>Connect to Strava.</li>
          <li>Plan some workouts for the week using our Calendar, or just get moving ASAP.</li>
        </ol>
      </div>
    </v-container> -->
  </div>
</template>

<script>
import moment from "moment";
export default {
  head: {
    titleTemplate: "ZON",
  },
  name: "IndexPage",
  computed: {
    authenticated() {
      return this.$store.state.auth.access_token;
    },
    me() {
      return this.$store.state.auth.me;
    },
  },
};
</script>

<style>
.auth-link {
  text-decoration: none;
}
.video-overlay {
  position: absolute;
  right: 0;
  top: 0;
  background-color: rgba(0,0,0,.5);
  min-width: 100%;
  min-height: 100%;
  z-index: 1;
}
#myVideo {
  position: absolute;
  right: 0;
  top: 0;
  object-position: top;
  object-fit: cover;
  min-width: 100%;
  height: 100%;
  z-index: 1;
}
</style>