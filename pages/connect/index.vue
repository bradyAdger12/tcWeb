<template>
<div class="mt-16">
  <p class="text-h3 text-center">
    Connect a Compatible Application
  </p>
  <v-row justify="center" class="mt-10">
    <v-col cols="auto">
      <a :href="`https://www.strava.com/oauth/authorize?client_id=${stravaClientId}&response_type=code&redirect_uri=http://localhost:3000/connect/strava&approval_prompt=auto&scope=activity:read`">
        <v-img class="app-image" eager :src="require('~/assets/btn_strava_connectwith_orange.svg')" width="400" />
      </a>
    </v-col>
  </v-row>
</div>
</template>
<script>
export default {
   head: {
    title: 'Connect'
  },
  middleware: 'auth',
  name: "Connect",
  data() {
    return {
      stravaClientId: process.env.STRAVA_CLIENT_ID
    }
  }
};
</script>

<style scoped>
.app-image {
  cursor: pointer
}
</style>