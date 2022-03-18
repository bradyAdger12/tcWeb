<template>
  <div>
    <div v-if="this.me">
      <v-row justify="center" align="center" class="mt-16">
        <v-col cols="12" sm="8">
          <p class="text-h2 font-weight-bold">
            Welcome to {{ $app_config.title }}, {{ me.display_name }}
          </p>
          <p>
            Below you can find some basic fitness statistics as well as your
            latest workouts
          </p>
          <div class="mt-16">
            <p class="text-h4">My Tracks</p>
            <div class="text-left">
              <Tracks />
            </div>
          </div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
export default {
  head: {
    title: "Profile",
  },
  middleware: "auth",
  name: "ProfilePage",
  watch: {
    me() {
      if (!this.me) {
        this.$router.push("/");
      }
    },
  },
  computed: {
    me() {
      return this.$store.state.auth.me;
    },
  },
};
</script>
