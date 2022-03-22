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

    <!-- Month Selection -->
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

    <!-- Days of Week header -->
    <v-row no-gutters>
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
            :ref="'week-' + item.week"
            v-for="(item, i) of currentDates"
            :key="i"
            :style="`
          width: ${100 / (numColumns - 1)}%;
          padding-bottom: 80px;
          min-height: 220px;
          overflow-y: hidden;
          border: 1px solid rgba(100, 100, 100, .2);
       `"
          >
            <div>
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

              <!-- Track View -->
              <div v-for="track of item.tracks" :key="track.id">
                <v-card
                  class="pa-1 black--text mx-1 mt-1"
                  style="background-color: rgba(0, 0, 0, 0.01)"
                  @click="openTrack(track)"
                >
                  <div class="font-weight-black" style="font-size: 13px">
                    {{ track.name }}
                  </div>
                  <div
                    class="font-weight-medium black--text"
                    style="font-size: 13px"
                  >
                    <div>
                      <v-icon size="15" color="grey" class="mr-1"
                        >mdi-timer-outline</v-icon
                      >{{ formatDuration(track.duration) }}
                    </div>
                    <div>
                      <v-icon size="14" color="grey" class="mr-1"
                        >mdi-ruler</v-icon
                      >{{ toMiles(track.length) }}
                    </div>
                    <div v-if="track.effort">
                      <v-icon size="15" color="grey" class="mr-1"
                        >mdi-lightning-bolt</v-icon
                      >Effort: {{ track.effort }}
                    </div>
                    <div v-if="track.hr_effort">
                      <v-icon size="14" color="grey" class="mr-1"
                        >mdi-heart</v-icon
                      >hrEffort: {{ track.hr_effort }}
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
            </div>
          </v-col>
        </v-row>
      </v-col>

      <!-- Summary -->
      <v-col
        v-if="refs"
        cols="auto"
        :style="`width: ${100 / numColumns}%; padding-top: 24px;`"
      >
        <div
          v-for="(summary, i) of summaries"
          :key="i"
          :style="` height: ${
            hasRef(refs['week-' + (i + 1)])
              ? refs['week-' + (i + 1)][0].clientHeight + 2
              : 0
          }px;   border-top: 1px solid rgba(100, 100, 100, 0.2);  border-bottom: 1px solid rgba(100, 100, 100, 0.2);`"
        >
          <div
            style="background-color: rgba(0, 0, 0, 0.1)"
            class="pa-1 font-weight-black text-center"
          >
            Summary
          </div>
          <div class="pa-2">
            <div>
              <span class="summary-title">Duration: </span
              >{{ formatDuration(summary.duration) }}
            </div>
            <div>
              <span class="summary-title">Distance: </span
              >{{ toMiles(summary.distance) }}
            </div>
            <div>
              <span class="summary-title">Effort: </span>{{ summary.effort }}
            </div>
            <div>
              <span class="summary-title">hrEffort: </span
              >{{ summary.hrEffort }}
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-dialog v-model="showTrack" width="900" @click:outside="showTrack = null">
      <v-card v-if="selectedTrack" :key="selectedTrack.id">
        <TracksDetail :trackId="selectedTrack.id" />
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
      today: moment(),
      changingMonth: false,
      refs: null,
      numColumns: 8,
      selectedTrack: null,
      showTrack: false,
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
  updated() {
    this.refs = this.$refs;
    delete this.refs["week-undefined"];
  },
  mounted() {
    this.buildCalendar();
  },
  methods: {
    openTrack(track) {
      this.selectedTrack = track;
      this.showTrack = true;
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
      await this.buildCalendar();
    },
    isToday(current) {
      return current.format("D MMMM YYYY") == this.today.format("D MMMM YYYY");
    },
    isAfterToday(current) {
      return current.isAfter(this.today);
    },
    isSameDate(trackDate, calendarDate) {
      return (
        moment(trackDate).format("D MMMM YYYY") ==
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
          tracks: [],
        });
      }
      this.currentDates.reverse();

      //Get all days for current month
      while (currentDay.month() == this.currentMoment.month()) {
        this.currentDates.push({
          date: moment(currentDay.toString()),
          tracks: [],
        });
        currentDay.subtract(1, "day");
      }

      //Backtrack to the previous monday to start the week
      while (currentDay.day() != 0) {
        this.currentDates.push({
          date: moment(currentDay.toString()),
          tracks: [],
        });
        currentDay.subtract(1, "day");
      }

      this.currentDates.reverse();
      console.log(this.currentDates);
      await this.getTracks();
      this.loading = false;
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
        let week = 1;
        for (let item of this.currentDates) {
          const index = this.currentDates.indexOf(item);
          if (index % 7 == 0 && index != 0) {
            week += 1;
          }
          item.week = week;
          if (index % 7 == 0 && index != 0) {
            summary["summary"] = true;
            this.summaries.push(summary);
            summary = {
              hrEffort: 0,
              effort: 0,
              duration: 0,
              distance: 0,
              tracks: 0,
            };
          }
          const tracks = _.filter(response.data, (track) => {
            return this.isSameDate(track.started_at, item.date);
          });
          for (let track of tracks) {
            item.tracks.push(track);
            if (track.effort) {
              summary["effort"] += track.effort;
            }
            if (track.hr_effort) {
              summary["hrEffort"] += track.hr_effort;
            }
            summary["distance"] += track.length;
            summary["duration"] += track.duration;
            summary["tracks"] += 1;
          }
          if (index == this.currentDates.length - 1) {
            summary["summary"] = true;
            this.summaries.push(summary);
          }
        }
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