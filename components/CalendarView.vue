<template>
  <div
    v-if="!loading"
    id="calendarView"
    style="min-height: 600px; min-width: 1000px; position: relative"
    class="white black--text pa-2"
  >
    <v-row
      v-if="changingMonth"
      no-gutters
      class="rounded-lg"
      style="
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.4);
        padding-top: 80px;
      "
      justify="center"
    >
      <v-progress-circular indeterminate color="white" size="50" />
    </v-row>
    <v-row justify="center" class="my-7">
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
      <!-- Days of Week header -->
      <v-col cols="auto" :style="`width: ${100 - 100 / numColumns}%`">
        <v-row no-gutters>
          <v-col
            cols="auto"
            class="text-center"
            v-for="item of displayDates"
            :key="item"
            :style="`
          width: ${100 / (numColumns - 1)}%;
          overflow-y: hidden;
       `"
          >
            {{ item }}
          </v-col>
        </v-row>

        <!-- Calendar Days -->
        <v-row no-gutters>
          <v-col
            cols="auto"
            class="date-item"
            v-for="item of currentDates"
            :key="item.date.toString()"
            :style="`
          width: ${100 / (numColumns - 1)}%;
          height: 300px;
          overflow-y: hidden;
          border: 1px solid rgba(100, 100, 100, .2);
       `"
          >
            <div
              :style="`${
                isToday(item.date)
                  ? 'background-color: rgba(200, 0, 0, .3);'
                  : 'background-color: rgba(0, 0, 0, 0.1)'
              }`"
              class="pa-1 font-weight-black"
            >
              {{ isToday(item.date) ? "Today, " : "" }}
              {{ item.date.format("D") }}
            </div>
            <div v-if="item.track">
              <v-card
                class="pa-1 black--text mx-1 mt-1"
                style="background-color: rgba(0, 0, 0, 0.01)"
              >
                <div class="font-weight-black" style="font-size: 13px">
                  {{ item.track.name }}
                </div>
                <div
                  class="font-weight-medium black--text"
                  style="font-size: 13px"
                >
                  <div>
                    {{ formatDuration(item.track.duration) }}
                  </div>
                  <div>
                    {{ toMiles(item.track.length) }}
                  </div>
                  <div v-if="item.track.effort">
                    Effort: {{ item.track.effort }}
                  </div>
                  <div v-if="item.track.hr_effort">
                    hrEffort: {{ item.track.hr_effort }}
                  </div>
                </div>
              </v-card>
            </div>
            <div
              class="add-event pa-2 ma-1 text-center"
              style="border-radius: 5px; background-color: rgba(0, 0, 0, 0.3)"
            >
              <v-icon> mdi-plus </v-icon>
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-col
        cols="auto"
        :style="`margin-top: 24px; width: ${100 / numColumns}%`"
      >
        <div
          v-for="(summary, i) of summaries"
          :key="i"
          style="height: 300px; border: 1px solid rgba(100, 100, 100, 0.2)"
        >
          <div
            class="text-center font-weight-bold pa-1"
            style="background-color: rgba(0, 0, 0, 0.1)"
          >
            Summary
          </div>
          <div class="pa-4 black--text" style="font-size: 13px">
            <div>
              <span class="summary-title">Effort: </span>{{ summary.effort }}
            </div>
            <div>
              <span class="summary-title">hrEffort: </span
              >{{ summary.hrEffort }}
            </div>
            <div>
              <span class="summary-title">Duration: </span
              >{{ formatDuration(summary.duration) }}
            </div>
            <div>
              <span class="summary-title">Distance: </span
              >{{ toMiles(summary.distance) }}
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
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
      today: moment(),
      changingMonth: false,
      numColumns: 8,
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
      await this.buildCalendar();
    },
    isToday(current) {
      return current.format("D MMMM YYYY") == this.today.format("D MMMM YYYY");
    },
    async buildCalendar() {
      this.currentDates = [];
      this.summaries = [];
      const currentDay = moment().set({
        year: this.currentMoment.year(),
        month: this.currentMoment.month(),
        date: this.currentMoment.daysInMonth(),
      });
      while (currentDay.month() == this.currentMoment.month()) {
        this.currentDates.push({ date: moment(currentDay.toString()) });
        currentDay.subtract(1, "day");
      }
      while (currentDay.day() != 0) {
        this.currentDates.push({ date: moment(currentDay.toString()) });
        currentDay.subtract(1, "day");
      }
      this.currentDates.reverse();
      await this.getTracks();
      this.loading = false;
      const dateItem = $(".date-item");
      console.log(dateItem);
    },
    async getTracks() {
      const startsAt = this.currentDates[0];
      const endsAt = this.currentDates[this.currentDates.length - 1];
      try {
        const response = await this.$axios.get(
          this.$axios.defaults.baseURL +
            `/recordings/me?startsAt=${startsAt.date}&endsAt=${endsAt.date}`,
          {
            headers: {
              Authorization: "Bearer " + this.$store.state.auth.access_token,
            },
          }
        );
        let summary = {
          hrEffort: 0,
          effort: 0,
          duration: 0,
          distance: 0,
          tracks: 0,
        };
        for (let item of this.currentDates) {
          const index = this.currentDates.indexOf(item);
          if (index == this.currentDates.length - 1) {
            this.summaries.push(summary);
          } else if (index % 7 == 0 && index != 0) {
            this.summaries.push(summary);
            summary = {
              hrEffort: 0,
              effort: 0,
              duration: 0,
              distance: 0,
              tracks: 0,
            };
          }
          const track = _.find(response.data, (track) => {
            return moment(track.started_at).date() == item.date.date();
          });
          if (track) {
            item.track = track;
            if (track.effort) {
              summary["effort"] += track.effort;
            } else if (track.hr_effort) {
              summary["hrEffort"] += track.hr_effort;
            }
            summary["distance"] += track.length;
            summary["duration"] += track.duration;
            summary["tracks"] += 1;
          }
        }
        this.$forceUpdate();
      } catch (e) {}
    },
  },
};
</script>

<style>
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