<template>
  <v-app dark>
    <Snackbar />
    <v-navigation-drawer
      v-model="drawer"
      :clipped="true"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="true" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

      <NuxtLink to="/" style="text-decoration: none" class="white--text ml-8">
        <v-toolbar-title v-text="title" />
      </NuxtLink>
      <v-spacer />
      <v-btn v-if="authenticated" text>
        <NuxtLink
          to="/connect"
          style="text-decoration: none"
          class="white--text"
        >
          Connect Apps
        </NuxtLink>
      </v-btn>
      <v-btn v-if="!authenticated" text>
        <NuxtLink to="/login" style="text-decoration: none" class="white--text">
          Login
        </NuxtLink>
      </v-btn>
      <v-btn v-else text class="white--text" @click="logout"> Logout </v-btn>
    </v-app-bar>
    <v-main>
      <v-container class="mb-16">
        <Nuxt />
      </v-container>
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
      this.buildDrawer()
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
