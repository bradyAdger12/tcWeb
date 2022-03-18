<template>
  <v-row justify="center" align="center" class="mt-16">
    <v-col cols="12" sm="6">
      <p class="text-h1 font-weight-bold">
        Welcome to {{ $app_config.title }}
      </p>
      <p class="subtitle">
        A simple and easy to use training app to help you reach your goals
      </p>
    </v-col>
  </v-row>
</template>

<script>
export default {
  head: {
    titleTemplate: 'Training Club',
  },
  name: 'IndexPage',
  computed: {
    me() {
      return this.$store.state.auth.me
    }
  },
}
</script>
