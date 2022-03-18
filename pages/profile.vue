<template>
  <div>
    <div v-if="this.me">
      <v-row justify="center" align="center" class="mt-16">
        <v-col cols="12" sm="8">
          <p class="text-h2 font-weight-bold">
            Welcome, {{ me.display_name }}
          </p>
          <p class="subtitle">
            Here are some simple metrics to see where you're at
          </p>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
export default {
  head: {
    title: 'Profile',
  },
  middleware: 'auth',
  name: 'ProfilePage',
  watch: {
    me() {
      if (!this.me) {
        this.$router.push('/')
      }
    }
  },
  computed: {
    me() {
      return this.$store.state.auth.me
    }
  },
}
</script>
