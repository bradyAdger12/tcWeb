<template>
  <v-app>
    <Snackbar />
    <v-app-bar :clipped-left="true" fixed app>
      <NuxtLink to="/" style="text-decoration: none" class="black--text ml-8">
        <img :src="require('../assets/logo.png')" style="width: 100px">
      </NuxtLink>
      <v-spacer />

      <NuxtLink
        v-if="authenticated"
        to="/connect"
        style="text-decoration: none"
        class="black--text"
      >
        <v-btn text> Connect Apps </v-btn>
      </NuxtLink>

      <NuxtLink
        v-if="authenticated"
        to="/calendar"
        style="text-decoration: none"
        class="black--text"
      >
        <v-btn text> Calendar </v-btn>
      </NuxtLink>

      <v-menu open-on-hover bottom offset-y v-if="authenticated">
        <template v-slot:activator="{ on, attrs }">
          <NuxtLink to="/profile" style="text-decoration: none">
            <v-btn v-bind="attrs" v-on="on" text> Profile </v-btn>
          </NuxtLink>
        </template>

        <v-list>
          <NuxtLink to="/profile/edit" style="text-decoration: none">
            <v-list-item>
              <v-list-item-title>Edit Profile</v-list-item-title>
            </v-list-item>
          </NuxtLink>
          <NuxtLink to="/profile/workouts" style="text-decoration: none">
            <v-list-item>
              <v-list-item-title>Workouts</v-list-item-title>
            </v-list-item>
          </NuxtLink>
          <NuxtLink to="/profile/saved_workouts" style="text-decoration: none">
            <v-list-item>
              <v-list-item-title>Saved Workouts</v-list-item-title>
            </v-list-item>
          </NuxtLink>
        </v-list>
      </v-menu>
      <NuxtLink
        v-if="!authenticated"
        to="/login"
        style="text-decoration: none"
        class="black--text"
      >
        <v-btn text> Login </v-btn>
      </NuxtLink>
      <v-btn v-else text class="black--text" @click="logout"> Logout </v-btn>
    </v-app-bar>
    <v-main v-if="$route.name === 'index'" style="background-color: rgb(150, 150, 150)">
      <Nuxt />
    </v-main>
    <v-main v-else class="my-10">
      <Nuxt />
    </v-main>
    <v-footer absolute app>
      <v-row justify="center" align="center" no-gutters>
        <v-col cols="auto">
          <div>
            <a href="https://strava.com" target="_blank">
              <img
                :src="
                  require('../assets/api_logo_cptblWith_strava_horiz_light.png')
                "
                style="width: 300px"
              />
            </a>
          </div>
        </v-col>
        <v-col cols="auto">
          <span>&copy; {{ new Date().getFullYear() }}</span>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
import _ from "lodash";
export default {
  name: "DefaultLayout",
  mounted() {
    this.drawer = false;
    this.buildDrawer();
  },
  computed: {
    authenticated() {
      return this.$store.state.auth.access_token;
    },
    me() {
      return this.$store.state.auth.me;
    },
  },
  watch: {
    me() {
      this.buildDrawer();
    },
  },
  data() {
    return {
      clipped: false,
      drawer: false,
      items: [],
      meItems: [
        {
          icon: "mdi-home",
          title: "Home",
          to: "/",
        },
        {
          icon: "mdi-account",
          title: "Profile",
          to: "/profile",
        },
        {
          icon: "mdi-cog",
          title: "Edit Profile",
          to: "/profile/edit",
        },
      ],

      defaultItems: [
        {
          icon: "mdi-home",
          title: "Home",
          to: "/",
        },
      ],
      miniVariant: false,
      title: this.$app_config.title,
    };
  },
  methods: {
    buildDrawer() {
      if (this.me) {
        this.items = this.meItems;
      } else {
        this.items = this.defaultItems;
      }
    },
    async logout() {
      await this.$store.dispatch("auth/logout");
    },
  },
};
</script>
