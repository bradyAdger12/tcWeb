<template>
  <v-card
    class="pa-1 black--text mx-1 mt-1"
    style="background-color: rgba(0, 0, 0, 0.01)"
    @click="openWorkout(workout)"
  >
    <div class="font-weight-black" style="font-size: 13px">
      {{ workout.name }}
    </div>
    <div class="font-weight-medium black--text" style="font-size: 13px">
      <div>
        <v-icon size="15" color="grey" class="mr-1">mdi-timer-outline</v-icon
        >{{ formatDuration(workout.duration) }}
      </div>
      <div>
        <v-icon size="14" color="grey" class="mr-1">mdi-ruler</v-icon
        >{{ toMiles(workout.length) }}
      </div>
      <div v-if="workout.effort">
        <v-icon size="15" color="grey" class="mr-1">mdi-lightning-bolt</v-icon
        >Effort: {{ workout.effort }}
      </div>
      <div v-if="workout.hr_effort">
        <v-icon size="14" color="grey" class="mr-1">mdi-heart</v-icon>hrEffort:
        {{ workout.hr_effort }}
      </div>
    </div>
  </v-card>
</template>


<script>
import { toMiles } from "~/tools/conversion";
import { formatDuration } from "~/tools/format_moment";
export default {
  props: {
    workout: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedWorkout: null,
      showWorkout: false,
    };
  },
  methods: {
    toMiles: toMiles,
    formatDuration: formatDuration,
    openWorkout(workout) {
      this.selectedWorkout = workout;
      this.showWorkout = true;
    },
  },
};
</script>