<template>
  <v-container>
    <div v-if="savedWorkouts.length > 0">
      <p class="text-h3 font-weight-bold mb-5">
        Saved Workouts
      </p>
      <v-row>
        <v-col
          v-for="savedWorkout of savedWorkouts"
          :key="savedWorkout.id"
          cols="2"
          class="mb-3 text-center"
        >
          <SavedWorkout :savedWorkout="savedWorkout" />
        </v-col>
      </v-row>
    </div>
    <p v-else>
      <i>You do not have any saved workouts</i>
    </p>
  </v-container>
</template>


<script>
export default {
  data() {
    return {
      savedWorkouts: [],
      loading: true,
    };
  },
  mounted() {
    this.getSavedWorkouts();
  },
  watch: {
    "$store.state.saved_workouts.saved_workouts"() {
      this.savedWorkouts = [...this.$store.state.saved_workouts.saved_workouts];
    },
  },
  methods: {
    async getSavedWorkouts() {
      const token = this.$store.state.auth.access_token;
      const me = this.me;
      try {
        await this.$store.dispatch("saved_workouts/getSavedWorkouts", {
          me,
          token,
        });
      } catch (e) {}
      this.loading = false;
    },
  },
};
</script>