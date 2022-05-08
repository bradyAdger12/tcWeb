<template>
  <div
    class="black--text mx-1 mt-1 elevation-4 rounded"
    :style="`background-color: rgba(0, 0, 0, 0.01);
     cursor: grab`"
    @click="openWorkout(workout)"
  >
    <div
      v-if="workout.planned"
      class="pa-1 rounded-t font-weight-medium"
      :style="`background-color: ${
        getHeaderBackgroundColor()
      }; font-size: 13px;`"
    >
      {{ getHeaderText() }}
    </div>
    <div class="pa-1">
      <div class="font-weight-black" style="font-size: 13px">
        {{ workout.name }}
      </div>

      <v-row no-gutters justify="space-between" align="end">
        <v-col cols="auto">
          <div class="font-weight-medium black--text" style="font-size: 13px">
            <div>
              <v-icon size="15" color="grey" class="mr-1"
                >mdi-timer-outline</v-icon
              >{{ formatDuration(workout.duration) }}
            </div>
            <div v-if="workout.is_completed">
              <v-icon size="14" color="grey" class="mr-1">mdi-ruler</v-icon
              >{{ toMiles(workout.length) }}
            </div>
            <div v-if="workout.effort">
              <v-icon size="15" color="grey" class="mr-1"
                >mdi-lightning-bolt</v-icon
              >Effort: {{ workout.effort }}
            </div>
            <div v-if="workout.hr_effort">
              <v-icon size="14" color="grey" class="mr-1">mdi-heart</v-icon
              >hrEffort:
              {{ workout.hr_effort }}
            </div>
          </div>
        </v-col>
        <v-col cols="auto">
          <WorkoutsIcon :activity="workout.activity" />
        </v-col>
      </v-row>
    </div>
    <v-dialog
      v-model="showWorkout"
      width="900"
      scrollable
      @click:outside="showWorkout = false"
    >
      <v-card
        v-if="selectedWorkout && selectedWorkout.is_completed"
        :key="selectedWorkout.id"
      >
        <WorkoutsDetail
          :workoutId="selectedWorkout.id"
          @onDelete="onDeleteWorkout"
          :key="JSON.stringify(selectedWorkout)"
        />
      </v-card>
      <v-card
        v-if="selectedWorkout && !selectedWorkout.is_completed"
        :key="selectedWorkout.id"
        class="white black--text"
      >
        <v-card-title> Add Workout </v-card-title>
        <v-card-text class="black--text">
          <WorkoutsBuilder
            :workout="selectedWorkout"
            :date="getMoment(selectedWorkout.started_at)"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>


<script>
import { toMiles } from "~/tools/conversion";
import { formatDuration } from "~/tools/format_moment";
import moment from "moment";
export default {
  props: {
    currentDates: {
      type: Array,
      required: true,
    },
    workout: {
      type: Object,
      required: true,
    },
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
    getHeaderBackgroundColor() {
       if (this.workout.is_completed) {
        return 'rgba(0, 185, 0, .7)'
      } else if (this.workout.planned && moment().endOf('day').isAfter(moment(this.workout.started_at).endOf('day'))) {
        return 'rgba(255, 00, 0, .7)'
      }
      return 'rgba(0,0,255, .2)'
    },
    getHeaderText() {
      if (this.workout.is_completed) {
        return 'Completed'
      } else if (this.workout.planned && moment().endOf('day').isAfter(moment(this.workout.started_at).endOf('day'))) {
        return 'Not Completed'
      }
      return 'Planned'
    },
    getMoment(date) {
      return moment(date);
    },
    findWorkoutsInDates(workout) {
      const foundDate = _.find(this.currentDates, (item) => {
        if (item.date) {
          return (
            item.date.format("D MMMM YYYY") ==
            moment(workout.started_at).format("D MMMM YYYY")
          );
        }
      });
      if (foundDate) {
        return foundDate.workouts;
      }
      return null;
    },
    onDeleteWorkout() {
      const workouts = this.findWorkoutsInDates(this.selectedWorkout);
      _.remove(workouts, (item) => item.id == this.selectedWorkout.id);
      this.showWorkout = false;
      this.selectedWorkout = false;
      this.$emit("onUpdate", this.workout);
    },
    openWorkout(workout) {
      this.selectedWorkout = workout;
      this.showWorkout = true;
    },
  },
};
</script>