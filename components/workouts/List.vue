<template>
  <div>
    <div v-if="!loading && workouts.length == 0">
      No workouts uploaded yet. Connect with our compatible apps
      <NuxtLink to="/connect" class="black--text">
        <span>here</span>
      </NuxtLink>
      to upload workouts.
    </div>
    <div v-else>
      <v-list two-line>
        <div v-if="loading" class="text-center pa-10">
          <v-progress-circular indeterminate />
        </div>
        <v-list-item
          v-else
          v-for="workout in workouts"
          :key="workout.id"
          @click="viewWorkout(workout)"
          style="cursor: pointer"
        >
          <div class="mr-3">
            <WorkoutIcon
              :activity="workout.activity"
              :size="'2.0em'"
            />
          </div>
          <v-list-item-content>
            <v-list-item-title style="word-break: break-word">{{
              workout.name
            }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ formatDate(workout.started_at) }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
    <v-dialog v-model="showWorkout" width="800">
      <v-card v-if="selectedWorkout">
        <WorkoutsDetail
          :workout-id="selectedWorkout.id"
          :key="selectedWorkout.id"
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { formatDate } from "~/tools/format_moment.js";
export default {
  asyncData() {},
  computed: {
    me() {
      return this.$store.state.auth.me;
    },
  },
  data() {
    return {
      loading: true,
      workouts: [],
      selectedWorkout: null,
      showWorkout: false,
    };
  },
  mounted() {
    this.getWorkouts();
  },
  watch: {
    "$store.state.workouts.workouts": function () {
      this.workouts = this.$store.state.workouts.workouts;
    },
  },
  methods: {
    formatDate: formatDate,
    viewWorkout(workout) {
      this.selectedWorkout = workout;
      this.showWorkout = true;
    },
    async getWorkouts() {
      const token = this.$store.state.auth.access_token;
      const me = this.me;
      try {
        await this.$store.dispatch("workouts/getWorkouts", { me, token });
      } catch (e) {}
      this.loading = false;
    },
  },
};
</script>