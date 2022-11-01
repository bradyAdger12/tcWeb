<template>
  <div>
    <div class="pa-8" style="min-width: 1200px">
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
                v-if="summaries[i + 1] && !loadingSummaries"
                class="pa-2 text-left"
              >
                <div>
                  <span class="summary-title">Duration: </span
                  >{{ formatDuration(summaries[i + 1].total_duration) }}
                </div>
                <div
                  v-for="activity of Object.keys(
                    summaries[i + 1].activity_duration
                  )"
                  :key="`duration_${activity}`"
                >
                  <div v-if="summaries[i + 1].activity_duration[activity] > 0" class="activity_breakdown_container" :style="`background-color: ${getActivityBackgroundColor(activity)}`">                   
                   <span style="margin-right: 1px"><WorkoutIcon :activity="activity" size="14px" /></span> 
                    {{
                      formatDuration(
                        summaries[i + 1].activity_duration[activity]
                      )
                    }}
                    <span class="activity_load_difference">{{ getActivityLoadDifference(i, activity, 'activity_duration') }}</span>
                  </div>
                </div>
                <div :class="`${summaries[i + 1].total_duration > 0 ? 'mt-2' : ''}`">
                  <span class="summary-title">Distance: </span
                  >{{ toMiles(summaries[i + 1].total_distance) }}
                </div>
                <div
                  v-for="activity of Object.keys(
                    summaries[i + 1].activity_distance
                  )"
                  :key="`distance_${activity}`"
                >
                  <div v-if="summaries[i + 1].activity_distance[activity] > 0" class="activity_breakdown_container" :style="`background-color: ${getActivityBackgroundColor(activity)}`">
                    <span style="margin-right: 1px"><WorkoutIcon :activity="activity" size="14px" /></span>
                    {{
                      toMiles(
                        summaries[i + 1].activity_distance[activity]
                      )
                    }}
                    <span class="activity_load_difference">{{ getActivityLoadDifference(i, activity, 'activity_distance') }}</span>
                  </div>
                </div>
                <div :class="`${summaries[i + 1].total_distance > 0 ? 'mt-2' : ''}`">
                  <span class="summary-title">Stress: </span
                  >{{ summaries[i + 1].effort }}
                </div>
                <div class="text-center mt-5">
                  <div class="blue rounded white--text">
                    Fitness {{ summaries[i + 1].fitness }} <span style="font-size: 10px">{{ getFitnessDifference(i, 'fitness')  }}</span>
                  </div>
                  <div class="orange rounded white--text mt-2">
                    Fatigue {{ summaries[i + 1].fatigue }} <span style="font-size: 10px">{{ getFitnessDifference(i, 'fatigue')  }}</span>
                  </div>
                  <div
                    :class="`${
                      summaries[i + 1].form < 0 ? 'red' : 'green'
                    } white--text mt-2 rounded`"
                  >
                    Form {{ summaries[i + 1].form }} <span style="font-size: 10px">{{ getFitnessDifference(i, 'form') }}</span>
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

      <!-- Add New Workout -->
      <v-dialog
        v-model="addDialog"
        width="900"
        @click:outside="addDialog = false"
        scrollable
      >
        <v-card v-if="addDate" class="white black--text" :key="new Date().toString()">
          <v-card-title>
            {{ selectedPlannedWorkout ? `Edit ${selectedPlannedWorkout.name}` : `Add Workout for ${addDate.format("MMMM D, YYYY")}` }}
          </v-card-title>
          <v-card-text class="black--text">
            <WorkoutsBuilder
              :date="addDate"
              :workout="selectedPlannedWorkout"
              @onSuccess="onSuccessfullAddWorkout"
              @onClose="addDialog = false; updateSummaries()"
            />
          </v-card-text>
        </v-card>
      </v-dialog>

       <!-- Dates Fitness Load -->
       <v-dialog
        v-model="showTrainingLoad"
        width="600"
        @click:outside="showTrainingLoad = false"
      >
        <v-card v-if="dateSelected" class="white black--text" :key="dateSelected.toString()">
          <v-card-title>
            {{ 'Training load for ' + dateSelected.format('MMMM D, YYYY')}}
          </v-card-title>
          <v-card-text class="black--text">
            <UserTrainingLoad :date="dateSelected" />
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
      dateSelected: null,
      addDialog: false,
      showTrainingLoad: false,
      addDate: null, 
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
          if (workout.activity !== 'workout' && workout.length) {
            workoutLength += `
              <div>
                <span class="mdi mdi-ruler" /> ${toMiles(workout.length)}
              </div>
            `;
          } if (workout.planned) {
            workoutHeader += `
              <div style="width: 100%; background-color: ${
                workout.is_completed ? "white" : "white"
              }; color: ${this.getActivityBackgroundColor(workout.activity)}" class="text-center rounded px-2 py-1">
                ${workout.is_completed ? "completed" : "planned"} ${workout.is_completed ? '<span class="mdi mdi-check-circle-outline text-sm"></span>' : ''}
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
        dateClick: this.handleDateClick,
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
      event?.remove();
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
    this.loading = false;
    if (this.calendar) {
      await this.updateSummaries();
    }

  },
  methods: {
    toMiles: toMiles,
    formatDuration: formatDuration,
    getActivityLoadDifference (index, activity, metric) {
      const previousWeek = this.summaries[index][metric][activity]
      const thisWeek = this.summaries[index + 1][metric][activity]
      if (previousWeek && thisWeek) {
        const difference = thisWeek - previousWeek
        const percentDifference = ((difference / previousWeek) * 100)
        return `(${percentDifference > 0 ? '+' : ''}${percentDifference.toFixed(0)}%)`
      }
      return ''
    },
    getFitnessDifference (index, metric) {
      const previousWeek = this.summaries[index][metric]
      const thisWeek = this.summaries[index + 1][metric]
      if (thisWeek !== undefined && previousWeek !== undefined) {
        const change = thisWeek - previousWeek
        return `${change >= 0 ? '+' : '-'}${change}`
      }
      return ''
    },
    getActivityBackgroundColor(activity) {
      if (activity == 'run'){
        return '#FE654F'
      } else if (activity == 'ride'){
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
        let curr = moment(this.calendar.view.activeStart).subtract(7, 'days');
        for (let i = 0; i < 7; i++) {
          const first = moment(curr).startOf("day").toISOString();
          const last = curr.add(6, "day").endOf("day").toISOString();
          const summary = await this.$axios.get(
            this.$axios.defaults.baseURL +
              `/workouts/weekly_summary?startDate=${first}&endDate=${last}`,
            headers
          );
          this.summaries.push(summary.data.summary);
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
        this.$router.push('/workout/' + e.event.extendedProps.id)
      }
    },
    async handleDateSet(e) {
      this.calendarStart = e.start;
      this.calendarEnd = e.end;
      if (this.calendar) {
        this.updateSummaries();
      }
      this.loading = true
      await this.getWorkouts();
      this.loading = false
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
    handleDateClick (arg) {
      const formattedDate = moment(arg.date).endOf('day')
      this.showTrainingLoad = true
      this.dateSelected = formattedDate
    },
  },
};
</script>


<style>
.activity_load_difference {
  font-size: 10px;
}
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