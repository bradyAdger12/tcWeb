<template>
  <v-card v-if="workout">
    <v-card-title> Delete Workout? </v-card-title>
    <v-card-text>
      Are you sure you want to delete <strong>{{ workout.name }}</strong
      >?
    </v-card-text>
    <v-card-actions>
      <v-btn @click="deleteWorkout">
        Yes
        <v-progress-circular
          v-if="deleting"
          size="15"
          indeterminate
          width="2"
          class="ml-1"
        />
      </v-btn>
      <v-btn @click="$emit('onClose')"> No </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    workout: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      deleting: false,
    };
  },
  computed: {
    authentication() {
      return this.$store.state.auth.access_token;
    },
  },
  methods: {
    async deleteWorkout() {
      const id = this.workout.id;
      const token = this.authentication;
      const workout = this.workout;
      this.deleting = true;
      try {
        this.$store.commit("calendar/removeWorkout", {
          id
        });
        await this.$store.dispatch("workouts/deleteWorkout", {
          id,
          token,
          workout,
        });
        this.$store.dispatch("snackbar/showSnack", {
          text: "Workout successfully deleted!",
          color: "green",
          timeout: 3500,
        });
        this.$emit("onDelete");
      } catch (e) {
        console.log(e);
      }
      this.deleting = false;
    },
  },
};
</script>