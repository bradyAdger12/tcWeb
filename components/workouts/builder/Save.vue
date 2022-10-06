<template>
  <div>
    <v-card-title> Save Workout </v-card-title>
    <v-card-text>
      <v-text-field v-model="workoutName" label="Name" @keyup.enter="save" />
      <v-text-field v-model="description" label="Description" @keyup.enter="save" />
    </v-card-text>
    <v-card-actions>
      <v-btn @click="save">
        Save
        <v-progress-circular
          v-if="saving"
          size="15"
          width="2"
          class="ml-1"
          indeterminate
        />
      </v-btn>
    </v-card-actions>
  </div>
</template>


<script>
import moment from "moment";
export default {
  props: {
    workout: {
      type: Object,
      required: false,
      default: null,
    },
    isPower: {
      type: Boolean,
      required: true,
    },
    date: {
      type: Object,
      required: true,
    },
    blocks: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      workoutName: "",
      description: "",
      saving: false,
    };
  },
  mounted() {
    if (this.workout) {
      this.workoutName = this.workout.name;
      this.description = this.workout.description;
    }
  },
  methods: {
    async save() {
      this.saving = true;
      try {
        const headers = {
          headers: {
            Authorization: "Bearer " + this.$store.state.auth.access_token,
          },
        };

        if (!this.workout) {
          const response = await this.$axios.post(
            this.$axios.defaults.baseURL + `/workouts/create/planned`,
            {
              name: this.workoutName,
              description: this.description,
              isPower: this.isPower,
              planned: this.blocks,
              startedAt: this.date.set({ hour: 12 }).toISOString(),
            },
            headers
          );
          const date = moment(this.date);
          const workout = response.data;
          if (workout && date) {
            this.$store.commit("calendar/addWorkout", { workout, date });
            this.$emit("onSuccess");
          }
        } else {
          // Save Workout
          const response = await this.$axios.put(
            this.$axios.defaults.baseURL + `/workouts/update/planned/${this.workout.id}`,
            {
              name: this.workoutName,
              description: this.description,
              isPower: this.isPower,
              planned: this.blocks,
            },
            headers
          );
          if (response?.data) {
            const workout = response.data
            this.$store.commit('calendar/updateWorkout', { workout })
            this.$emit("onSuccess");
          }
        }
        this.$store.dispatch("snackbar/showSnack", {
          text: "Workout successfully saved!",
          color: "green",
          timeout: 3500,
        });
      } catch (e) {
        console.log(e);
      }
      this.saving = false;
    },
  },
};
</script>