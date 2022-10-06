<template>
  <div class="pa-8">
    <v-row no-gutters>
      <v-col class="col-10">
        <FullCalendar id="fullCalendar" ref="fullCalendar" :options="calendarOptions" />
      </v-col>
      <v-col v-if="tableRows.length > 0" class="col-2" :style="`margin-top: 6.0em`">
        <div v-for="row,i of tableRows" :key="i">
          <div class="text-center font-bold pt-2" :style="`height: ${row.clientHeight}px; background-color: rgba(200, 200, 200, .2)`">
            Summary
            <div v-if="summaries[i]" class="pa-2 text-left">
              <div>
                <span class="summary-title">Duration: </span
                >{{ formatDuration(summaries[i].summary.duration) }}
              </div>
              <div>
                <span class="summary-title">Distance: </span
                >{{ toMiles(summaries[i].summary.distance) }}
              </div>
              <div>
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
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- View Workout Detail -->
    <v-dialog v-model="showWorkout" width="800">
      <v-card v-if="selectedWorkout">
        <WorkoutsDetail :workout-id="selectedWorkout" :key="selectedWorkout" />
      </v-card>
    </v-dialog>

    <!-- Add New Workout -->
    <v-dialog
      v-model="addDialog"
      width="900"
      @click:outside="addDialog = false"
      scrollable
    >
      <v-card v-if="addDate" class="white black--text">
        <v-card-title> Add Workout for {{ addDate.format('MMMM D, YYYY') }} </v-card-title>
        <v-card-text class="black--text">
          <WorkoutsBuilder :date="addDate" @onSuccess="addDialog = false" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import $ from 'jquery'
  import { toMiles } from "~/tools/conversion";
  import { formatDuration } from "~/tools/format_moment";
  import moment from 'moment'
  import FullCalendar from '@fullcalendar/vue'
  import dayGridPlugin from '@fullcalendar/daygrid'
  import interactionPlugin from '@fullcalendar/interaction'
  
  export default {
    components: {
      FullCalendar // make the <FullCalendar> tag available
    },
    data() {
      return {
        calendar: null,
        calendarStart: null,
        calendarEnd: null,
        tableRows: [],
        summaries: [],
        selectedWorkout: null,
        addDialog: false,
        addDate: null,
        showWorkout: false,
        expandRows: true,
        calendarOptions: {
          editable: true,
          plugins: [ dayGridPlugin, interactionPlugin ],
          firstDay: 1,
          initialView: 'dayGridMonth',
          eventDrop: this.handleEventDrop,
          eventClick: this.handleEventClick,
          datesSet: this.handleDateSet,
          contentHeight: 'auto',
          displayEventTime: false,
          eventDisplay: 'block',
          windowResize: (e) => {
            setTimeout(() => {
              this.tableRows = $('.fc-scrollgrid-sync-table tr')
              console.log(this.tableRows)
            }, 100)
          }
          // handleWindowResize: false
        }
      }
    },
    watch: {
      '$store.state.calendar.workouts' () {
        const workouts = this.$store.state.calendar.workouts
        for (const workout of workouts) {
          if (!this.calendar.getEventById(workout.id)) {
            let classNames = []
            if (workout.planned) {
              classNames = ['planned_workout']
            }
            this.calendar.addEvent({
              id: workout.id,
              title: workout.name,
              classNames: classNames,
              description: workout.description,
              start: workout.started_at,
            })
          }
        }
      }
    },
    computed: {
      authenticated() {
        return this.$store.state.auth.access_token;
      },
    },
    async mounted () {
      this.calendar = this.$refs.fullCalendar.getApi()
      this.calendar.addEvent(
        {
          id: 'addEvent', // recurrent events in this group move together
          daysOfWeek: [ '0', '1', '2', '3', '4', '5', '6'  ],
          title: '+ Add Workout',
          startTime: '23:59:00',
          backgroundColor: 'rgba(100, 100, 100, .5)',
          borderColor: 'gray',
          eventContent: {
            html: '<h1>ok</h1>'
          },
          classNames: ['addEvent'],
          editable: false,
          endTime: '23:59:00'
        }
      )
    },
    methods: {
      toMiles: toMiles,
      formatDuration: formatDuration,
      async getDaysOfWeek(calendar) {
        this.summaries = []
        const headers = {
          headers: {
            Authorization: "Bearer " + this.$store.state.auth.access_token,
          },
        };
        let curr = moment(calendar.view.activeStart)
        for (let i = 0; i < 6; i++) {
         const first = moment(curr).startOf('day').toISOString()
         const last = curr.add(6, 'day').endOf('day').toISOString()
         const summary = await this.$axios.get(
            this.$axios.defaults.baseURL +
              `/workouts/weekly_summary?startDate=${first}&endDate=${last}`,
            headers
          );
          this.summaries.push(summary.data)
          curr.add(1, 'day')
        }
        // while (curr.format('MMMM D YYYY') != moment(calendar.view.currentEnd).format('MMMM D YYYY')) {
        //   curr = curr.set('day', curr.day() + 1)
        //   console.log(curr)
        // }
        // for (let i = 0; i < 6; i++) {
        //   let first = (curr.date() - curr.day()) + 1; // First day is the day of the month - the day of the week
        //   let last = first + 6; // last day is the first day + 6

        //   let firstday = moment(curr.set('date', first)).toISOString()
        //   let lastday = moment(curr.set('date', last)).toISOString()
        //   weeks.push({
        //     first: firstday,
        //     last: lastday
        //   })
        //   curr = moment(lastday).set('day', moment(lastday).day() + 1)
        // }
        // console.log(weeks)
      },
      async handleEventDrop (e) {
        const id = parseInt(e.event.id)
        const token = this.authenticated
        const newDate = e.event.startStr
        try {
        const response = await this.$store.dispatch("workouts/getWorkoutById", { id, token})
        response.started_at = newDate
        const payload = response
        await this.$store.dispatch("calendar/updateWorkout", { id, payload, token })
        } catch (e) {}
      },
      handleEventClick (e) {
        if (e.event.id === 'addEvent') {
          this.addDialog = true
          this.addDate = moment(e.event.startStr)
        } else {
          const id = parseInt(e.event.id)
          this.showWorkout = true
          this.selectedWorkout = id
        }
      },
      async handleDateSet (e) {
        this.calendarStart = e.start
        this.calendarEnd = e.end
        if (this.calendar) {
          this.getDaysOfWeek(this.calendar)
        }
        await this.getWorkouts()
        this.tableRows = $('.fc-scrollgrid-sync-table tr')
      },
      async getWorkouts () {
        const token = this.authenticated;
        const startDate = this.calendarStart
        const endDate = this.calendarEnd
        await this.$store.dispatch("calendar/getCalendar", {
          token,
          startDate,
          endDate
        });
      },
      handleDateClick: function(arg) {
        alert('date click! ' + arg.dateStr)
      }
    }
  }
  </script>


<style>
  .fc-event-time, .fc-event-title {
    padding: 0 1px;
    white-space: normal;
  }
  .fc-daygrid-day-frame {
    min-height: 300px !important;
  }
  .fc-day-today {
   background: #1976d233 !important;
  }
  .fc .fc-daygrid-day-number {
    color: black
  }
  .fc .fc-col-header-cell-cushion {
    color: black;
    cursor: default;
  }
  .addEvent {
    padding: 8px;
  }
  .planned_workout {
    background-color: purple;
    border-color: purple;
  }
</style>