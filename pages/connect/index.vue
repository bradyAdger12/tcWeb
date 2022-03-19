<template>
  <div class="mt-16">
    <div v-if="loading" class="text-center">
      <v-progress-circular indeterminate size="100" />
    </div>
    <div v-else>
      <p class="text-h3 text-center">Connect a Compatible Application</p>
      <v-row justify="center" class="mt-10">
        <v-col cols="auto" style="position: relative">
          <a
             v-if="!connectedToStrava"
            :href="`https://www.strava.com/oauth/authorize?client_id=${stravaClientId}&response_type=code&redirect_uri=http://localhost:3000/connect/strava&approval_prompt=auto&scope=activity:read`"
          >
            <v-img
              class="app-image"
              eager
              :src="require('~/assets/btn_strava_connectwith_orange.svg')"
              width="400"
            />
          </a>
          <NuxtLink
             v-else
             to="/connect/strava?connected=true"
          >
            <v-img
              class="app-image"
              eager
              :src="require('~/assets/btn_strava_connectwith_orange.svg')"
              width="400"
            />
          </NuxtLink>
          <div
            v-if="connectedToStrava"
            style="position: absolute; right: 0px; top: 0px"
            class="green rounded text-center px-4 py-2"
          >
            Connected
            <v-icon class="ml-1" style="text-align: middle" size="22">
              mdi-check
            </v-icon>
          </div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
<script>
export default {
  head: {
    title: "Connect",
  },
  middleware: "auth",
  name: "Connect",
  computed: {
    me() {
      return this.$store.state.auth.me;
    },
  },
  data() {
    return {
      stravaClientId: process.env.STRAVA_CLIENT_ID,
      connectedToStrava: false,
      loading: true,
    };
  },
  async mounted() {
    await this.getStravaAthlete();
    this.loading = false;
  },
  methods: {
    async getStravaAthlete() {
      if (this.me && this.me.strava_token) {
        try {
          const athlete = await this.$axios.get(
            this.$axios.defaults.baseURL + "/strava/athlete",
            {
              noShowSnackbar: true,
              headers: {
                Authorization: "Bearer " + this.$store.state.auth.access_token,
              },
            }
          );
          if (athlete.data) {
            this.connectedToStrava = true;
          }
        } catch (e) {
          console.log(e);
        }
      }
    },
  },
};
</script>

<style scoped>
.app-image {
  cursor: pointer;
}
</style>