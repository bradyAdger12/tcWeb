<template>
  <div class="pa-8">
    <FullCalendar id="fullCalendar" ref="fullCalendar" :options="calendarOptions" />

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
      <v-card class="white black--text">
        <v-card-title> Add Workout for {{ addDate.format('MMMM D, YYYY') }} </v-card-title>
        <v-card-text class="black--text">
          <WorkoutsBuilder :date="addDate" @onSuccess="addDialog = false" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
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
        selectedWorkout: null,
        addDialog: false,
        addDate: null,
        addDate: null,
        showWorkout: false,
        calendarOptions: {
          editable: true,
          plugins: [ dayGridPlugin, interactionPlugin ],
          firstDay: 1,
          initialView: 'dayGridMonth',
          eventDrop: this.handleEventDrop,
          eventClick: this.handleEventClick,
          datesSet: this.handleDateSet,
          displayEventTime: false,
          eventDisplay: 'block'
        }
      }
    },
    watch: {
      '$store.state.calendar.workouts' () {
        const workouts = this.$store.state.calendar.workouts
        for (const workout of workouts) {
          if (!this.calendar.getEventById(workout.id)) {
            this.calendar.addEvent({
              id: workout.id,
              title: workout.name,
              classNames: ['event'],
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
          classNames: ['addEvent'],
          editable: false,
          endTime: '23:59:00'
        }
      )
    },
    methods: {
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
      handleDateSet (e) {
        this.calendarStart = e.start
        this.calendarEnd = e.end
        this.getWorkouts()
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
  .fc-day-today {
   background: #1976d233 !important;
  }
  .fc .fc-daygrid-day-number {
    color: white
  }
  .fc .fc-col-header-cell-cushion {
    color: white;
  }
  .addEvent {
    padding: 12px;
  }
</style>