<template>
  <v-row justify="center" align="center" class="mt-16">
    <v-col cols="12">
      <p class="text-h1 font-weight-bold">Welcome to {{ $app_config.title }}</p>
      <p class="subtitle">
        A simple and easy to use training app to help you reach your goals
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
      <div v-if="authenticated">
        <Calendar />
      </div>
    </v-col>
  </v-row>
</template>

<script>
export default {
  head: {
    titleTemplate: "My Spin Cycle",
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
</style>