<template>
  <div>
    <div v-if="!loading && workouts.length == 0">
      No workouts uploaded yet. Connect with our compatible apps
      <NuxtLink to="/connect" class="white--text">
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
          @click="viewTrack(workout)"
          style="cursor: pointer"
        >
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
    <v-dialog v-model="showTrack" width="800">
      <v-card v-if="selectedTrack">
        <TracksDetail :workout-id="selectedTrack.id" :key="selectedTrack.id" />
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
      selectedTrack: null,
      showTrack: false,
    };
  },
  mounted() {
    this.getTracks();
  },
  watch: {
    "$store.state.workouts.workouts": function () {
      this.workouts = this.$store.state.workouts.workouts;
    },
  },
  methods: {
    formatDate: formatDate,
    viewTrack(workout) {
      this.selectedTrack = workout;
      this.showTrack = true;
    },
    // async deleteTrack(workout) {
    //   workout.deleting = true;
    //   this.$forceUpdate();
    //   const token = this.$store.state.auth.access_token;
    //   const id = workout.id;
    //   try {
    //     await this.$store.dispatch("workouts/deleteTrack", { id, token });
    //   } catch (e) {}
    //   workout.deleting = false;
    //   this.$forceUpdate();
    // },
    async getTracks() {
      const token = this.$store.state.auth.access_token;
      const me = this.me;
      try {
        await this.$store.dispatch("workouts/getTracks", { me, token });
      } catch (e) {}
      this.loading = false;
    },
  },
};
</script>