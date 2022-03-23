<template>
  <div
    v-if="!loading"
    id="calendarView"
    style="
      min-height: 600px;
      min-width: 1000px;
      position: relative;
      padding-top: 98px;
    "
    class="white black--text"
  >
    <!-- Month loading circle -->
    <v-row
      v-if="changingMonth"
      no-gutters
      class="rounded-lg"
      style="
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 3;
        background-color: rgba(0, 0, 0, 0.4);
        padding-top: 80px;
      "
      justify="center"
    >
      <v-progress-circular indeterminate color="white" size="50" />
    </v-row>

    <!-- Floating Date Header -->
    <v-card
      id="floating-header"
      transition="scroll-y-reverse-transition"
      class="rounded-0 white black--text"
      style="min-width: 1000px"
    >
      <!-- Month Selection -->
      <v-row justify="center" class="my-2">
        <v-col cols="auto">
          <v-icon class="black--text mr-2" @click="backMonth()">
            mdi-arrow-left</v-icon
          >
        </v-col>
        <v-col cols="2" class="text-center">
          <div style="display: inline" class="font-weight-bold text-h5">
            {{ currentMoment.format("MMMM YYYY") }}
          </div>
        </v-col>
        <v-col cols="auto">
          <v-icon class="black--text ml-2" @click="forwardMonth()">
            mdi-arrow-right
          </v-icon>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col
          cols="auto"
          class="text-center"
          v-for="item of displayDates"
          :key="item"
          :style="`
          width: ${100 / numColumns}%;
          overflow-y: hidden;
       `"
        >
          {{ item }}
        </v-col>
      </v-row>
    </v-card>
    <!-- End Floating Header -->

    <!-- Calendar Days -->
    <v-row id="calendar" no-gutters>
      <v-col
        cols="auto"
        class="date-item"
        v-for="(item, i) of items"
        :key="i"
        :style="`
          width: ${100 / numColumns}%;
          padding-bottom: 80px;
          min-height: 220px;
          overflow-y: hidden;
          border: 1px solid rgba(100, 100, 100, .2);
       `"
      >
        <div v-if="item.summary">
          <div
            style="background-color: rgba(0, 0, 0, 0.1)"
            class="pa-1 font-weight-black text-center"
          >
            Summary
          </div>
          <div class="pa-2">
            <div>
              <span class="summary-title">Duration: </span
              >{{ formatDuration(item.summary.duration) }}
            </div>
            <div>
              <span class="summary-title">Distance: </span
              >{{ toMiles(item.summary.distance) }}
            </div>
            <div>
              <span class="summary-title">Stress: </span
              >{{ item.summary.effort }}
            </div>
            <div class="text-center mt-5">
              <div>
                <span class="summary-title">Fitness </span
                ><span class="blue--text">{{ item.summary.fitness }}</span>
              </div>
              <div>
                <span class="summary-title">Fatigue </span
                ><span class="orange--text">{{ item.summary.fatigue }}</span>
              </div>
              <div>
                <span class="summary-title">Form </span
                ><span
                  :class="`${item.summary.form < 0 ? 'red' : 'green'}--text`"
                  >{{ item.summary.form }}</span
                >
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div
            :style="`${
              isToday(item.date)
                ? 'background-color: rgba(200, 0, 0, .3);'
                : 'background-color: rgba(0, 0, 0, 0.1)'
            }; ${isAfterToday(item.date) ? 'color: grey' : ''}`"
            class="pa-1 font-weight-black"
          >
            {{ isToday(item.date) ? "Today, " : "" }}
            {{ item.date.format("D") }}
            {{
              currentMoment.month() != item.date.month()
                ? " - " + item.date.format("MMMM")
                : ""
            }}
          </div>

          <!-- Workout View -->
          <div v-for="workout of item.workouts" :key="workout.id">
            <v-card
              class="pa-1 black--text mx-1 mt-1"
              style="background-color: rgba(0, 0, 0, 0.01)"
              @click="openWorkout(workout)"
            >
              <div class="font-weight-black" style="font-size: 13px">
                {{ workout.name }}
              </div>
              <div
                class="font-weight-medium black--text"
                style="font-size: 13px"
              >
                <div>
                  <v-icon size="15" color="grey" class="mr-1"
                    >mdi-timer-outline</v-icon
                  >{{ formatDuration(workout.duration) }}
                </div>
                <div>
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
                  >hrEffort: {{ workout.hr_effort }}
                </div>
              </div>
            </v-card>
          </div>
          <div class="add-event ma-2">
            <v-btn
              block
              class="pa-2 text-center"
              style="border-radius: 5px; background-color: rgba(0, 0, 0, 0.3)"
              @click="add(item.date)"
            >
              <v-icon> mdi-plus </v-icon>
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-dialog v-model="addDialog" width="900" @click:outside="addDialog = false">
      <v-card class="white black--text">
        <v-card-title>
          Add Workout
        </v-card-title>
        <v-card-text class="black--text">
          Ability to add a workout coming soon...
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showWorkout" width="900" @click:outside="showWorkout = false">
      <v-card v-if="selectedWorkout" :key="selectedWorkout.id">
        <WorkoutDetail :workoutId="selectedWorkout.id" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import _ from "lodash";
import moment from "moment";
import $ from "jquery";
import { toMiles } from "../tools/conversion";
import { formatDuration } from "../tools/format_moment";
import debounce from "~/tools/debounce.js";
export default {
  data() {
    return {
      currentDates: [],
      items: [],
      today: moment(),
      changingMonth: false,
      addDialog: false,
      refs: null,
      numColumns: 8,
      selectedWorkout: null,
      showWorkout: false,
      summaries: [],
      displayDates: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      currentMoment: moment(),
      loading: true,
    };
  },
  mounted() {
    this.buildCalendar();
  },
  methods: {
    add(date) {
      this.addDialog = true
    },
    openWorkout(workout) {
      this.selectedWorkout = workout;
      this.showWorkout = true;
    },
    hasRef(ref) {
      return ref && ref[0];
    },
    async backMonth() {
      this.currentMoment = this.currentMoment.subtract(1, "month");
      this.changeMonth();
    },
    async forwardMonth() {
      this.currentMoment = this.currentMoment.add(1, "month");
      this.changeMonth();
    },
    toMiles: toMiles,
    formatDuration: formatDuration,
    async changeMonth() {
      this.today = moment();
      this.changingMonth = true;
      await this.buildCalendar();
      this.changingMonth = false;
    },
    isToday(current) {
      return current.format("D MMMM YYYY") == this.today.format("D MMMM YYYY");
    },
    isAfterToday(current) {
      return current.isAfter(this.today);
    },
    isSameDate(workoutDate, calendarDate) {
      return (
        moment(workoutDate).format("D MMMM YYYY") ==
        calendarDate.format("D MMMM YYYY")
      );
    },
    async buildCalendar() {
      this.currentDates = [];
      this.summaries = [];
      const currentDay = moment().set({
        year: this.currentMoment.year(),
        month: this.currentMoment.month(),
        date: this.currentMoment.daysInMonth(),
      });

      const lastDayOfMonth = moment().set({
        year: this.currentMoment.year(),
        month: this.currentMoment.month(),
        date: this.currentMoment.daysInMonth(),
      });

      //End on sunday
      while (lastDayOfMonth.day() != 0) {
        lastDayOfMonth.add(1, "day");
        this.currentDates.push({
          date: moment(lastDayOfMonth.toString()),
          workouts: [],
        });
      }
      this.currentDates.reverse();

      //Get all days for current month
      while (currentDay.month() == this.currentMoment.month()) {
        this.currentDates.push({
          date: moment(currentDay.toString()),
          workouts: [],
        });
        currentDay.subtract(1, "day");
      }

      //Backworkout to the previous monday to start the week
      while (currentDay.day() != 0) {
        this.currentDates.push({
          date: moment(currentDay.toString()),
          workouts: [],
        });
        currentDay.subtract(1, "day");
      }

      this.currentDates.reverse();
      await this.getWorkouts();
      this.loading = false;
    },
    async getWorkouts() {
      const startsAt = this.currentDates[0];
      const endsAt = this.currentDates[this.currentDates.length - 1];
      try {
        const response = await this.$axios.get(
          this.$axios.defaults.baseURL +
            `/workouts/me/calendar?startsAt=${startsAt.date.set({
              hour: 0,
              minute: 0,
              seconds: 0,
            })}&endsAt=${endsAt.date.set({
              hour: 23,
              minute: 59,
              seconds: 59,
            })}`,
          {
            headers: {
              Authorization: "Bearer " + this.$store.state.auth.access_token,
            },
          }
        );
        console.log(response)
        for (let item of response.data.dates) {
          if (item.date) {
            item.date = moment(item.date.toString());
          }
        }
        this.items = response.data.dates;
      } catch (e) {}
    },
  },
};
</script>

<style>
#floating-header {
  position: fixed;
  top: 63px;
  left: 0;
  z-index: 2;
  width: 100%;
  transition: top 0.3s;
}
.summary-title {
  color: rgba(100, 100, 100);
  font-size: 12px;
}
.add-event {
  opacity: 0;
}
.date-item:hover .add-event {
  opacity: 1;
}
</style>