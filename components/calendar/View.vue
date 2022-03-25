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
    <!-- Floating Date Header -->
    <v-card
      id="floating-header"
      transition="scroll-y-reverse-transition"
      class="rounded-0 white black--text"
      style="min-width: 1000px"
    >
      <!-- Month Selection -->
      <v-row justify="center" class="my-2">
        <v-col cols="2" class="text-center">
          <div style="display: inline" class="font-weight-bold text-h5">
            {{ monthInView.format("MMMM YYYY") }}
          </div>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col
          cols="auto"
          :class="`text-center ${item == 'Summary' ? 'font-weight-bold' : ''}`"
          v-for="item of displayFloatingHeaders"
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
        v-for="(item, i) of currentDates"
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
          <div style="background-color: rgba(0, 0, 0, 0.1)" />
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
              <div class="blue rounded white--text">
                Fitness {{ item.summary.fitness }}
              </div>
              <div class="orange rounded white--text mt-2">
                Fatigue {{ item.summary.fatigue }}
              </div>
              <div
                :class="`${
                  item.summary.form < 0 ? 'red' : 'green'
                } white--text mt-2 rounded`"
              >
                Form {{ item.summary.form }}
              </div>
            </div>
          </div>
        </div>
        <div v-else :id="`date-${item.date.format('D-MMMM-YYYY')}`">
          <div
            :style="`background-color: ${getDayHeaderColor(item.date)}; ${
              isAfterToday(item.date) ? 'color: grey' : ''
            }`"
            :class="`pa-1 font-weight-black`"
          >
            {{ isToday(item.date) ? "Today, " : "" }}
            {{
              item.date.month() != monthInView.month() &&
              (item.date.date() == item.date.daysInMonth() ||
                item.date.date() == 1)
                ? item.date.format("MMMM D")
                : item.date.format("D")
            }}
          </div>

          <!-- Workout View -->

          <draggable
            v-model="item.workouts"
            draggable=".cell"
            group="workouts"
            ghost-class="ghost"
            @change="dragChange($event, item.date)"
          >
            <div
              v-for="workout of item.workouts"
              :key="workout.id"
              class="cell"
              @click="openWorkout(workout)"
            >
              <CalendarCell :workout="workout" />
            </div>
          </draggable>

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
    <v-dialog
      v-model="addDialog"
      width="900"
      @click:outside="addDialog = false"
    >
      <v-card class="white black--text">
        <v-card-title> Add Workout </v-card-title>
        <v-card-text class="black--text">
          Ability to add a workout coming soon...
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="showWorkout"
      width="900"
      @click:outside="showWorkout = false"
    >
      <v-card v-if="selectedWorkout" :key="selectedWorkout.id">
        <WorkoutsDetail :workoutId="selectedWorkout.id" />
      </v-card>
    </v-dialog>
    <div
      v-if="loadingMore && (loadingMore.bottom || loadingMore.top)"
      :style="`position: fixed; z-index: 2; ${
        loadingMore.top ? 'top: 0' : 'bottom: 0'
      }; left: 0; width: 100%; ${
        loadingMore.top ? 'padding-top: 180px' : 'padding-bottom: 100px'
      }`"
      class="text-center"
    >
      <v-avatar
        style="
          background-color: rgba(100, 100, 100, 0.4);
          height: 50px;
          width: 50px;
        "
        class="rounded-circle elevation-4"
      >
        <v-progress-circular indeterminate color="blue" />
      </v-avatar>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import _ from "lodash";
import moment from "moment";
import { toMiles } from "~/tools/conversion";
import { formatDuration } from "~/tools/format_moment";
import $ from "jquery";
export default {
  components: {
    draggable,
  },
  data() {
    return {
      currentDates: [],
      items: [],
      today: moment(),
      addDialog: false,
      refs: null,
      showWorkout: false,
      selectedWorkout: null,
      numColumns: 8,
      loadingMore: {},
      monthInView: moment(),
      monthElements: [],
      displayFloatingHeaders: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
        "Summary",
      ],
      currentMoment: moment(),
      loading: true,
      refreshing: false,
    };
  },
  async mounted() {
    await this.buildCalendar(this.today);
    const id = $(`#date-${this.today.format("D-MMMM-YYYY")}`);
    $("html, body").animate({ scrollTop: id.offset().top - 250 }, "slow");
    setTimeout(() => {
      this.listenToScrollEvents();
    }, 1000);
  },
  methods: {
    toMiles: toMiles,
    formatDuration: formatDuration,
    listenToScrollEvents() {
      const _this = this;
      $(window).scroll(async function () {
        // detect bottom
        _this.monthHeaderListener(window.scrollY);
        if (!_this.refreshing) {
          if (
            $(window).scrollTop() ==
            $(document).height() - $(window).height()
          ) {
            _this.loadingMore = { bottom: true };
            const fromDate = moment(
              _this.currentDates[_this.currentDates.length - 2].date
            );
            await _this.buildCalendar(fromDate, false, false);
            _this.loadingMore = { bottom: false };
          }

          //detect top
          else if ($(window).scrollTop() == 0) {
            _this.loadingMore = { top: true };
            const fromDate = moment(_this.currentDates[0].date);
            await _this.buildCalendar(fromDate, false, true);
            window.scrollTo(0, 1390);
            _this.loadingMore = { top: false };
          }
        }
      });
    },
    monthHeaderListener(scrollTop) {
      for (let month of this.monthElements) {
        if (month) {
          const monthStartElement = $(
            `#date-${month.format("D-MMMM-YYYY")}`
          );
          if (monthStartElement[0]) {
            if (
              scrollTop >
              monthStartElement[0].offsetTop - monthStartElement[0].clientHeight - 100
            ) {
              this.monthInView = month;
            }
          }
        }
      }
    },
    dragChange(e, date) {
      if (e.added) {
        const newDate = date;
        const workout = e.added.element;
        if (newDate && workout) {
          try {
            this.updateWorkout(workout, newDate);
          } catch (e) {
            console.log(e);
          }
        }
      }
    },
    async updateWorkout(workout, date) {
      try {
        date = moment(date.toString());
        const newDate = moment(workout.started_at)
          .set({
            year: date.year(),
            month: date.month(),
            date: date.date(),
          })
          .local();
        await this.$axios.put(
          this.$axios.defaults.baseURL + `/workouts/${workout.id}`,
          { started_at: newDate.toISOString() },
          {
            headers: {
              Authorization: "Bearer " + this.$store.state.auth.access_token,
            },
          }
        );
        const startDate = this.currentDates[0].date;
        const endDate = this.currentDates[this.currentDates.length - 2].date;
        this.refreshing = true;
        await this.getWorkouts(startDate, endDate); // rebuild calendar to update summaries
        this.refreshing = false;
      } catch (e) {
        console.log(e);
      }
    },
    openWorkout(workout) {
      this.selectedWorkout = workout;
      this.showWorkout = true;
    },
    getCurrentWeekDates(date) {
      const getDay = date.day();
      const startOfWeek = moment(
        moment(date.toString()).subtract(getDay, "days").toString()
      );
      const endOfWeek = moment(
        moment(date.toString())
          .add(7 - getDay, "days")
          .toString()
      );
      return { startOfWeek, endOfWeek };
    },
    getDayHeaderColor(date) {
      const { startOfWeek, endOfWeek } = this.getCurrentWeekDates(this.today);
      if (this.isToday(date)) {
        return "rgba(200, 0, 0, .5);";
      }
      if (date.isBetween(startOfWeek, endOfWeek)) {
        return "rgba(200, 0, 0, .3);";
      }
      return "rgba(0, 0, 0, .1)";
    },
    add(date) {
      this.addDialog = true;
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
    async buildCalendar(fromDate, isInitialLoad = true, isPrepend = false) {
      let startDate = null;
      let endDate = null;

      if (isInitialLoad) {
        startDate = moment(fromDate.toString()).subtract(2, "month");
        endDate = moment(fromDate.toString()).add(2, "month");
      } else if (isPrepend) {
        startDate = moment(fromDate.toString()).subtract(30, "day");
        endDate = moment(fromDate.toString()).subtract(1, "day");
      } else {
        startDate = moment(fromDate.toString()).add(1, "day");
        endDate = moment(fromDate.toString()).add(30, "day");
      }

      if (isPrepend || isInitialLoad) {
        while (startDate.day() != 1) {
          startDate.subtract(1, "day");
        }
      }

      if (isInitialLoad || !isPrepend) {
        while (endDate.day() != 0) {
          endDate.add(1, "day");
        }
      }
      await this.getWorkouts(startDate, endDate, isPrepend);
      this.getMonthElements();
      this.loading = false;
    },
    getMonthElements() {
      const currentDate = moment(this.currentDates[0].date.toString());
      const endDate = moment(
        this.currentDates[this.currentDates.length - 2].date.toString()
      );
      const difference = Math.abs(currentDate.diff(endDate, 'months')) + 1
      this.monthElements = [];
      for (let i = 0; i < difference; i++) {
        this.monthElements.push(moment(currentDate.subtract(currentDate.date() - 1, 'days')));
        currentDate.add(1, 'months')
      }
    },
    async getWorkouts(startDate, endDate, isPrepend = false) {
      if (startDate && endDate) {
        startDate = startDate.set({
          hour: 0,
          minute: 0,
          seconds: 0,
        });
        endDate = endDate.set({
          hour: 23,
          minute: 59,
          seconds: 59,
        });
        try {
          const response = await this.$axios.get(
            this.$axios.defaults.baseURL +
              `/workouts/me/calendar?startsAt=${startDate.toISOString()}&endsAt=${endDate.toISOString()}&calendar_cache=true`,
            {
              headers: {
                Authorization: "Bearer " + this.$store.state.auth.access_token,
              },
            }
          );
          const datesToAdd = [];
          if (this.refreshing) {
            this.currentDates = [];
          }
          for (let item of response.data.dates) {
            if (item.date) {
              item.date = moment(item.date.toString());
            }
            if (isPrepend) {
              datesToAdd.push(item);
            } else {
              this.currentDates.push(item);
            }
          }
          if (isPrepend) {
            datesToAdd.reverse();
            for (let date of datesToAdd) {
              this.currentDates.unshift(date);
            }
          }
        } catch (e) {}
      }
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