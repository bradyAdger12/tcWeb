<template>
  <v-card v-if="savedWorkout">
    <v-card-title> Delete Saved Workout? </v-card-title>
    <v-card-text>
      Are you sure you want to delete <strong>{{ savedWorkout.name }}</strong
      >?
    </v-card-text>
    <v-card-actions>
      <v-btn @click="deleteSavedWorkout">
        Yes
        <v-progress-circular
          v-if="deleting"
          size="15"
          indeterminate
          width="2"
          class="ml-1"
        />
      </v-btn>
      <v-btn @click="$emit('onDelete')"> No </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    savedWorkout: {
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
    async deleteSavedWorkout() {
      const id = this.savedWorkout.id;
      const token = this.authentication;
      this.deleting = true;
      try {
        await this.$store.dispatch("saved_workouts/deleteSavedWorkout", {
          id,
          token
        });
        this.$store.dispatch("snackbar/showSnack", {
          text: "Workout successfully deleted!",
          color: "green",
          timeout: 3500,
        });
        this.$emit('onDelete')
      } catch (e) {
        console.log(error)
      }
      this.deleting = false;
    },
  },
};
</script>