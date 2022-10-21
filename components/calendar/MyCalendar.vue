<template>
  <div>
    <div class="pa-8">
      <v-row no-gutters>
        <v-col class="col-10">
          <div v-if="calendar" class="mb-4">
            <v-row justify="center" align="center">
              <v-col cols="auto">
                <v-btn fab small @click="calendar.prev()">
                  <v-icon class="mdi mdi-arrow-left" />
                </v-btn>
              </v-col>
              <v-col class="font-weight-bold text-h4" cols="auto">
                {{
                  calendar.getDate().toLocaleDateString("en-us", {
                    year: "numeric",
                    month: "long",
                  })
                }}
              </v-col>
              <v-col cols="auto">
                <v-btn fab small @click="calendar.next()">
                  <v-icon class="mdi mdi-arrow-right" />
                </v-btn>
              </v-col>
            </v-row>
          </div>
          <FullCalendar
            id="fullCalendar"
            ref="fullCalendar"
            :options="calendarOptions"
          />
        </v-col>
        <v-col
          v-if="tableRows.length > 0"
          class="col-2"
          :style="`margin-top: 5.3em`"
        >
          <div v-for="(row, i) of tableRows" :key="i">
            <div
              class="text-center pt-2"
              :style="`height: ${row.clientHeight}px; background-color: rgba(200, 200, 200, .2);`"
            >
              <span class="font-weight-bold">Summary</span>
              <div
                v-if="summaries[i] && !loadingSummaries"
                class="pa-2 text-left"
              >
                <div>
                  <span class="summary-title">Duration: </span
                  >{{ formatDuration(summaries[i].summary.total_duration) }}
                </div>
                <div
                  v-for="activity of Object.keys(
                    summaries[i].summary.activity_duration
                  )"
                  :key="`duration_${activity}`"
                >
                  <div v-if="summaries[i].summary.activity_duration[activity] > 0" class="activity_breakdown_container" :style="`background-color: ${getActivityBackgroundColor(activity)}`">
                    <span>
                      {{
                        activity.charAt(0).toUpperCase() +
                        activity.substring(1)
                      }}: </span
                    >{{
                      formatDuration(
                        summaries[i].summary.activity_duration[activity]
                      )
                    }}
                  </div>
                </div>
                <div :class="`${summaries[i].summary.total_duration > 0 ? 'mt-2' : ''}`">
                  <span class="summary-title">Distance: </span
                  >{{ toMiles(summaries[i].summary.total_distance) }}
                </div>
                <div
                  v-for="activity of Object.keys(
                    summaries[i].summary.activity_distance
                  )"
                  :key="`distance_${activity}`"
                >
                  <div v-if="summaries[i].summary.activity_distance[activity] > 0" class="activity_breakdown_container" :style="`background-color: ${getActivityBackgroundColor(activity)}`">
                    <span>
                      {{
                        activity.charAt(0).toUpperCase() +
                        activity.substring(1)
                      }}: </span
                    >{{
                      toMiles(
                        summaries[i].summary.activity_distance[activity]
                      )
                    }}
                  </div>
                </div>
                <div :class="`${summaries[i].summary.total_distance > 0 ? 'mt-2' : ''}`">
                  <span class="summary-title">Stress: </span
                  >{{ summaries[i].summary.effort }}
                </div>
                <div class="text-center mt-5">
                  <div class="blue rounded white--text">
                    Fitness {{ summaries[i].summary.fitness }}
                  </div>
                  <div class="orange rounded white--text mt-2">
                    Fatigue {{ summaries[i].summary.fatigue }}
                  </div>
                  <div
                    :class="`${
                      summaries[i].summary.form < 0 ? 'red' : 'green'
                    } white--text mt-2 rounded`"
                  >
                    Form {{ summaries[i].summary.form }}
                  </div>
                </div>
              </div>
              <div v-else>
                <v-progress-linear indeterminate />
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- View Workout Detail -->
      <v-dialog v-model="showWorkout" width="800">
        <v-card v-if="selectedWorkout">
          <WorkoutsDetail
            :workout-id="selectedWorkout"
            :key="selectedWorkout"
            @onDelete="onDeleteWorkout"
          />
        </v-card>
      </v-dialog>

      <!-- Add New Workout -->
      <v-dialog
        v-model="addDialog"
        width="900"
        @click:outside="addDialog = false"
        scrollable
      >
        <v-card v-if="addDate" class="white black--text" :key="addDate.toISOString()">
          <v-card-title>
            Add Workout for {{ addDate.format("MMMM D, YYYY") }}
          </v-card-title>
          <v-card-text class="black--text">
            <WorkoutsBuilder
              :date="addDate"
              :workout="selectedPlannedWorkout"
              @onSuccess="onSuccessfullAddWorkout"
            />
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
    <v-overlay v-if="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </div>
</template>

<script>
import $ from "jquery";
import { toMiles } from "~/tools/conversion";
import { formatDuration } from "~/tools/format_moment";
import moment from "moment";
import FullCalendar from "@fullcalendar/vue";
import WorkoutIcon from '~/components/WorkoutIcon.vue'
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default {
  components: {
    FullCalendar, // make the <FullCalendar> tag available
  },
  data() {
    return {
      calendar: null,
      calendarStart: null,
      calendarEnd: null,
      loadingSummaries: false,
      loading: true,
      tableRows: [],
      summaries: [],
      selectedWorkout: null,
      selectedPlannedWorkout: null,
      addDialog: false,
      addDate: null,
      showWorkout: false,
      expandRows: true,
      calendarOptions: {
        editable: true,
        plugins: [dayGridPlugin, interactionPlugin],
        headerToolbar: false,
        firstDay: 1,
        eventContent: (e) => {
          const workout = e.event.extendedProps;
          let efforts = "";
          let activity = "";
          let workoutLength = "";
          let workoutHeader = "";
          if (!workout.planned && workout.activity !== 'workout') {
            workoutLength += `
              <div>
                <span class="mdi mdi-ruler" /> ${toMiles(workout.length)}
              </div>
            `;
          } else if (workout.planned) {
            workoutHeader += `
              <div style="width: 100%; background-color: ${
                workout.is_completed ? "green" : "purple"
              }; color: white" class="text-center rounded px-2 py-1">
                ${workout.is_completed ? "completed" : "planned"}
              </div>
            `;
          }
          if (workout.activity) {
            if (workout.activity === "ride") {
              activity += `
                <div>
                  <span class="mdi mdi-bike" style="font-size: 16px" />
                </div>
              `;
            } else if (workout.activity === "run") {
              activity += `
                <div>
                  <span class="mdi mdi-run" style="font-size: 16px" />
                </div>
              `;
            }
            else if (workout.activity === "workout") {
              activity += `
                <div>
                  <span class="mdi mdi-dumbbell" style="font-size: 16px" />
                </div>
              `;
            }
          }
          if (workout.hr_effort || workout.effort) {
            if (workout.effort) {
              efforts += `
                <div>
                  <span class="mdi mdi-lightning-bolt" /> effort: ${workout.effort}
                </div>
              `;
            } else {
            efforts += `
                <div>
                  <span class="mdi mdi-heart" /> hrEffort: ${workout.hr_effort}
                </div>
              `;
            }
          }
          if (e.event.id != "addEvent") {
            return {
              html: `
                <div style="margin-top: 5px; margin-left: 3px; margin-right: 3px; white-space: normal; font-weight: 500;">
                  ${workoutHeader}
                  <div style="padding: 2px">
                    <span>
                      ${e.event.title}
                    </span>
                    <div>
                      ${activity}
                      <div>
                        <span class="mdi mdi-timer-outline" /> ${formatDuration(
                          workout.duration
                        )}
                      </div>
                      ${workoutLength}
                      ${efforts}
                    </div>
                  </div>
                </div>
              `,
            };
          }
        },
        initialView: "dayGridMonth",
        eventDrop: this.handleEventDrop,
        eventClick: this.handleEventClick,
        datesSet: this.handleDateSet,
        contentHeight: "auto",
        displayEventTime: false,
        eventBackgroundColor: "#1976d299",
        eventBorderColor: "#1976d299",
        eventDisplay: "block",
        windowResize: (e) => {
          setTimeout(() => {
            this.tableRows = $(".fc-scrollgrid-sync-table tr");
          }, 100);
        },
        // handleWindowResize: false ()
      },
    };
  },
  watch: {
    "$store.state.calendar.workoutIdToBeRemoved" () {
      const id = this.$store.state.calendar.workoutIdToBeRemoved
      const event = this.calendar.getEventById(id);
      event.remove();
    },
    "$store.state.calendar.workouts"() {
      const workouts = this.$store.state.calendar.workouts;
      for (const workout of workouts) {
        const backgroundColor = this.getActivityBackgroundColor(workout.activity)
        if (!this.calendar.getEventById(workout.id)) {
          this.calendar.addEvent({
            id: workout.id,
            title: workout.name,
            extendedProps: workout,
            description: workout.description,
            backgroundColor,
            borderColor: backgroundColor,
            start: workout.started_at,
          });
        } else if (workout.updatedAt) {
          const event = this.calendar.getEventById(workout.id);
          event.remove();
          this.calendar.addEvent({
            id: workout.id,
            title: workout.name,
            extendedProps: workout,
            description: workout.description,
            backgroundColor,
            borderColor: backgroundColor,
            start: workout.started_at,
          });
        }
      }
    },
  },
  computed: {
    authenticated() {
      return this.$store.state.auth.access_token;
    },
  },
  async mounted() {
    this.loading = true;
    this.calendar = this.$refs.fullCalendar.getApi();
    this.calendar.addEvent({
      id: "addEvent", // recurrent events in this group move together
      daysOfWeek: ["0", "1", "2", "3", "4", "5", "6"],
      title: "+ Add Workout",
      startTime: "23:59:00",
      backgroundColor: "rgba(100, 100, 100, .5)",
      borderColor: "gray",
      classNames: ["addEvent"],
      editable: false,
      endTime: "23:59:00",
    });
    if (this.calendar) {
      await this.updateSummaries();
    }
    this.loading = false;
  },
  methods: {
    toMiles: toMiles,
    formatDuration: formatDuration,
    getActivityBackgroundColor(activity) {
      if (activity == 'run'){
        return '#FE654F'
      } else if (activity == 'cycling' || activity.includes('ride')){
        return '#7798AB'
      }
      return '#6BAB90'
    },
    async updateSummaries() {
      if (this.calendar) {
        this.summaries = [];
        const headers = {
          headers: {
            Authorization: "Bearer " + this.$store.state.auth.access_token,
          },
        };
        let curr = moment(this.calendar.view.activeStart);
        for (let i = 0; i < 6; i++) {
          const first = moment(curr).startOf("day").toISOString();
          const last = curr.add(6, "day").endOf("day").toISOString();
          const summary = await this.$axios.get(
            this.$axios.defaults.baseURL +
              `/workouts/weekly_summary?startDate=${first}&endDate=${last}`,
            headers
          );
          this.summaries.push(summary.data);
          curr.add(1, "day");
        }
      }
    },
    async handleEventDrop(e) {
      const id = parseInt(e.event.id);
      const token = this.authenticated;
      const newDate = e.event.startStr;
      try {
        const workout = await this.$store.dispatch("workouts/getWorkoutById", {
          id,
          token,
        });
        workout.started_at = newDate;
        const payload = workout;
        await this.$store.dispatch("calendar/updateWorkout", {
          id,
          payload,
          token,
        });
        await this.updateSummaries();
      } catch (e) {}
    },
    handleEventClick(e) {
      this.selectedPlannedWorkout = null;
      if (e.event.id === "addEvent") {
        this.addDialog = true;
        this.addDate = moment(e.event.startStr);
      } else if (
        e.event.extendedProps.planned &&
        !e.event.extendedProps.is_completed
      ) {
        this.addDialog = true;
        this.selectedPlannedWorkout = e.event.extendedProps;
        this.addDate = moment(e.event.startStr);
      } else {
        const id = parseInt(e.event.id);
        this.showWorkout = true;
        this.selectedWorkout = id;
      }
    },
    async handleDateSet(e) {
      this.calendarStart = e.start;
      this.calendarEnd = e.end;
      if (this.calendar) {
        this.updateSummaries();
      }
      await this.getWorkouts();
      this.tableRows = $(".fc-scrollgrid-sync-table tr");
    },
    onSuccessfullAddWorkout(e) {
      this.addDialog = false;
      this.updateSummaries();
    },
    onDeleteWorkout(e) {
      const event = this.calendar.getEventById(this.selectedWorkout);
      if (event) {
        event.remove();
        this.updateSummaries();
        this.showWorkout = false;
        this.selectedWorkout = null;
      }
    },
    async getWorkouts() {
      const token = this.authenticated;
      const startDate = this.calendarStart;
      const endDate = this.calendarEnd;
      await this.$store.dispatch("calendar/getCalendar", {
        token,
        startDate,
        endDate,
      });
    },
    handleDateClick: function (arg) {
      alert("date click! " + arg.dateStr);
    },
  },
};
</script>


<style>
.activity_breakdown_container {
  padding: 3px 5px 3px 5px; border-radius: 5px; font-size: 11px; margin-bottom: 2px; color: white
}
.fc-event-time,
.fc-event-title {
  padding: 0 1px;
  white-space: normal;
}
.fc-daygrid-day-frame {
  min-height: 400px !important;
}
.fc-day-today {
  background: #1976d233 !important;
}
.fc .fc-daygrid-day-number {
  color: black;
}
.fc .fc-col-header-cell-cushion {
  color: black;
  cursor: default;
}
.addEvent {
  padding: 8px;
}
</style>