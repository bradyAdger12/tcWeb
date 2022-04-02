<template>
  <div>
    <div v-if="loading" class="text-center pa-16">
      <v-progress-circular size="50" indeterminate />
    </div>
    <div
      v-else
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
        <v-row justify="center" align="center" class="my-2">
          <v-col cols="auto" class="text-center">
            <div class="font-weight-bold text-h5">
              {{ monthInView.format("MMMM YYYY") }}
            </div>
          </v-col>
          <v-col cols="auto">
            <v-btn light x-small @click="scrollToToday()">
              scroll to today
            </v-btn>
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col
            cols="auto"
            :class="`text-center ${
              item == 'Summary' ? 'font-weight-bold' : ''
            }`"
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
          overflow-y: hidden;
          border: 1px solid rgba(100, 100, 100, .2);
       `"
        >
          <div v-if="item.summary" style="min-height: 250px">
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
          <div
            v-else
            :id="`date-${item.date.format('D-MMMM-YYYY')}`"
            style="min-height: 250px"
            class="pb-14"
            @drop="onDrop"
            @dragover="onDragOver"
          >
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

            <div
              v-for="workout of item.workouts"
              :key="workout.id"
              :draggable="true"
              @dragend="workoutBeingDragged = null"
              @dragstart="dragStart($event, workout)"
            >
              <CalendarCell
                :workout="workout"
                :current-dates="currentDates"
                @onUpdate="onUpdate"
              />
            </div>

            <div class="add-event ma-2">
              <v-btn
                block
                class="pa-2 text-center"
                :draggable="false"
                :style="`border-radius: 5px; background-color: rgba(0, 0, 0, 0.3); ${
                  workoutBeingDragged ? 'display: none; height: 30px' : ''
                }`"
                @click="addWorkout(item.date)"
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
        scrollable
        :key="addDialog"
      >
        <v-card class="white black--text">
          <v-card-title> Add Workout </v-card-title>
          <v-card-text class="black--text">
            <WorkoutsBuilder :date="addDate" @onSuccess="addDialog = false"  />
          </v-card-text>
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
      monthElements: [],
      today: moment(),
      monthInView: moment(),
      addDialog: false,
      loading: true,
      refreshing: false,
      workoutBeingDragged: null,
      numColumns: 8,
      addDate: null,
      loadingMore: {},
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
    };
  },
  destroyed() {
    window.removeEventListener("scroll", this.listenToScrollEvents);
  },
  computed: {
    authenticated() {
      return this.$store.state.auth.access_token;
    },
  },
  watch: {
    "$store.state.calendar.dates": function () {
      this.currentDates = this.$store.state.calendar.dates;
    },
    "$store.state.calendar.dateToAddPlannedWorkout": async function () {
      const date = this.$store.state.calendar.dateToAddPlannedWorkout;
      if (date) {
        await this.updateSummaries(date, date);
      }
    },
  },
  async mounted() {
    await this.buildCalendar(this.today);
    this.scrollToToday();
    setTimeout(() => {
      window.addEventListener("scroll", this.listenToScrollEvents);
      this.listenToDrag();
    }, 1000);
  },
  methods: {
    toMiles: toMiles,
    formatDuration: formatDuration,
    getMoment(date) {
      return moment(date);
    },
    onDragOver(ev) {
      ev.preventDefault();
    },
    async onDrop(ev) {
      if (ev.target.id) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("workout");
        const workout = JSON.parse(data);
        const date = moment(ev.target.id).endOf("day");
        await this.moveWorkout(workout, date);
      }
    },
    dragStart(ev, workout) {
      this.workoutBeingDragged = workout;
      ev.dataTransfer.setData("workout", JSON.stringify(workout));
    },
    async onUpdate(e) {
      await this.updateSummaries(moment(e.started_at), moment(e.started_at));
    },
    scrollToToday() {
      window.removeEventListener("scroll", this.listenToScrollEvents);
      const id = $(`#date-${this.today.format("D-MMMM-YYYY")}`);
      $("html, body").animate({ scrollTop: id.offset().top - 250 }, "slow");
      setTimeout(() => {
        window.addEventListener("scroll", this.listenToScrollEvents);
      }, 1000);
    },
    listenToDrag() {
      var stop = true;
      $(".cell").on("drag", function (e) {
        if (e.originalEvent.clientY < 150 && stop) {
          stop = false;
          window.scrollTo({ top: window.scrollY - 400, behavior: "smooth" });
          setTimeout(() => {
            stop = true;
          }, 1000);
        }

        if (e.originalEvent.clientY > $(window).height() - 150 && stop) {
          stop = false;
          window.scrollTo({ top: window.scrollY + 400, behavior: "smooth" });
          setTimeout(() => {
            stop = true;
          }, 1000);
        }
      });

      $(".cell").on("dragend", function (e) {
        stop = true;
      });
    },
    async listenToScrollEvents(e) {
      // detect bottom
      this.monthHeaderListener(window.scrollY);
      if (!this.refreshing) {
        if (
          Math.round($(window).scrollTop()) ==
          Math.round($(document).height() - $(window).height())
        ) {
          try {
            this.loadingMore = { bottom: true };
            const fromDate = moment(
              this.currentDates[this.currentDates.length - 2].date
            );
            await this.buildCalendar(fromDate, false, false);
            this.loadingMore = { bottom: false };
          } catch (e) {
            console.log(e);
          }
        }

        //detect top
        else if ($(window).scrollTop() == 0) {
          this.loadingMore = { top: true };
          const fromDate = moment(this.currentDates[0].date);
          await this.buildCalendar(fromDate, false, true);
          window.scrollTo(0, 1390);
          this.loadingMore = { top: false };
        }
      }
    },
    monthHeaderListener(scrollTop) {
      for (let month of this.monthElements) {
        if (month) {
          const monthStartElement = $(`#date-${month.format("D-MMMM-YYYY")}`);
          if (monthStartElement[0]) {
            if (
              scrollTop >
              monthStartElement[0].offsetTop -
                monthStartElement[0].clientHeight -
                100
            ) {
              this.monthInView = month;
            }
          }
        }
      }
    },
    getStartOfWeek(date) {
      return date
        .subtract(date.day() == 0 ? 6 : date.day() - 1, "days")
        .startOf("day");
    },
    getEndOfWeek(date) {
      return date
        .add(date.day() == 0 ? 0 : 7 - date.day(), "days")
        .endOf("day");
    },
    async updateSummaries(oldDate, newDate) {
      let oldWeekStart = this.getStartOfWeek(moment(oldDate.toString()));
      let oldWeekEnd = this.getEndOfWeek(moment(oldDate.toString()));
      let newWeekStart = this.getStartOfWeek(moment(newDate.toString()));
      let newWeekEnd = this.getEndOfWeek(moment(newDate.toString()));
      const headers = {
        headers: {
          Authorization: "Bearer " + this.$store.state.auth.access_token,
        },
      };

      //Get summary for the week where the workout was moved from
      const oldWeekSummary = await this.$axios.get(
        this.$axios.defaults.baseURL +
          `/workouts/weekly_summary?startDate=${oldWeekStart.toISOString()}&endDate=${oldWeekEnd.toISOString()}`,
        headers
      );

      //Find the currently stored summary for the week the workout is being moved from
      const oldWeekFound = _.find(this.currentDates, (item) => {
        if (item.date) {
          return (
            moment(item.date).format("D MMMM YYYY") ==
            oldWeekEnd.format("D MMMM YYYY")
          );
        }
      });

      if (oldWeekFound && oldWeekSummary.data) {
        const index = this.currentDates.indexOf(oldWeekFound);
        if (index) {
          this.currentDates[index + 1] = oldWeekSummary.data;
        }
      }

      //Get summary for the week where the workout was moved to
      const newWeekSummary = await this.$axios.get(
        this.$axios.defaults.baseURL +
          `/workouts/weekly_summary?startDate=${newWeekStart.toISOString()}&endDate=${newWeekEnd.toISOString()}`,
        headers
      );

      //Find the currently stored summary for the week the workout is being moved to
      const newWeekFound = _.find(this.currentDates, (item) => {
        if (item.date) {
          return (
            moment(item.date).format("D MMMM YYYY") ==
            newWeekEnd.format("D MMMM YYYY")
          );
        }
      });

      if (newWeekFound && newWeekSummary.data) {
        const index = this.currentDates.indexOf(newWeekFound);
        if (index) {
          this.currentDates[index + 1] = newWeekSummary.data;
        }
      }
      this.$forceUpdate();
    },
    async moveWorkout(workout, date) {
      try {
        date = moment(date.toString());
        const newDate = moment(workout.started_at)
          .set({
            year: date.year(),
            month: date.month(),
            date: date.date(),
          })
          .local();
        const token = this.authenticated;
        const oldDate = moment(workout.started_at);
        await this.$store.dispatch("calendar/moveWorkout", {
          workout,
          token,
          newDate,
          oldDate,
        });
        this.refreshing = true;
        await this.updateSummaries(moment(oldDate), moment(newDate));
      } catch (e) {
        console.log(e);
      }
      this.refreshing = false;
    },

    getDayHeaderColor(date) {
      date = moment(date.toString()).set({ hour: 2 });
      const startOfWeek = this.getStartOfWeek(moment(this.today.toString()));
      const endOfWeek = this.getEndOfWeek(moment(this.today.toString()));
      if (this.isToday(date)) {
        return "rgba(200, 0, 0, .5);";
      }
      if (date.isBetween(startOfWeek, endOfWeek)) {
        return "rgba(200, 0, 0, .3);";
      }
      return "rgba(0, 0, 0, .1)";
    },
    addWorkout(date) {
      this.addDate = date;
      this.addDialog = true;
    },
    isToday(current) {
      return current.format("D MMMM YYYY") == this.today.format("D MMMM YYYY");
    },
    isAfterToday(current) {
      return current.isAfter(this.today);
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
      await this.getWorkouts(startDate, endDate, isPrepend, isInitialLoad);
      this.getMonthElements();
      this.loading = false;
    },
    getMonthElements() {
      const currentDate = moment(this.currentDates[0].date.toString());
      const endDate = moment(
        this.currentDates[this.currentDates.length - 2].date.toString()
      );
      const difference = Math.abs(currentDate.diff(endDate, "months")) + 1;
      this.monthElements = [];
      for (let i = 0; i < difference; i++) {
        this.monthElements.push(
          moment(currentDate.subtract(currentDate.date() - 1, "days"))
        );
        currentDate.add(1, "months");
      }
    },
    async getWorkouts(startDate, endDate, isPrepend = false) {
      const token = this.authenticated;
      try {
        await this.$store.dispatch("calendar/getCalendar", {
          token,
          startDate,
          endDate,
          isPrepend,
        });
      } catch (e) {}
    },
  },
};
</script>

<style>
.html {
  scroll-behavior: smooth;
}
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