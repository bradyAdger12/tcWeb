<template>
  <v-app dark>
    <Snackbar />
    <v-app-bar :clipped-left="true" fixed app>
      <NuxtLink to="/" style="text-decoration: none" class="white--text ml-8">
        <v-toolbar-title v-text="title" />
      </NuxtLink>
      <v-spacer />

      <NuxtLink
        v-if="authenticated"
        to="/connect"
        style="text-decoration: none"
        class="white--text"
      >
        <v-btn text> Connect Apps </v-btn>
      </NuxtLink>

      <NuxtLink
        v-if="authenticated"
        to="/calendar"
        style="text-decoration: none"
        class="white--text"
      >
        <v-btn text> Calendar </v-btn>
      </NuxtLink>

      <v-menu open-on-hover bottom offset-y v-if="authenticated">
        <template v-slot:activator="{ on, attrs }">
          <NuxtLink to="/profile" style="text-decoration: none">
            <v-btn dark v-bind="attrs" v-on="on" text> Profile </v-btn>
          </NuxtLink>
        </template>

        <v-list>
          <NuxtLink to="/profile/edit" style="text-decoration: none">
            <v-list-item>
              <v-list-item-title>Edit Profile</v-list-item-title>
            </v-list-item>
          </NuxtLink>
        </v-list>
      </v-menu>
      <NuxtLink
        v-if="!authenticated"
        to="/login"
        style="text-decoration: none"
        class="white--text"
      >
        <v-btn text> Login </v-btn>
      </NuxtLink>
      <v-btn v-else text class="white--text" @click="logout"> Logout </v-btn>
    </v-app-bar>
    <v-main>
      <Nuxt />
    </v-main>
    <v-footer absolute app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
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
