<template>
  <div
    v-if="!loading"
    id="calendarView"
    style="min-height: 600px; min-width: 1000px"
    class="rounded-lg white black--text pa-2"
  >
    <p class="text-center title text-h4 py-5 font-weight-bold">
      <v-icon> mdi-arrow-left</v-icon>{{ currentMoment.format("MMMM")
      }}<v-icon> mdi-arrow-right </v-icon>
    </p>
    <v-row no-gutters>
      <v-col
        cols="auto"
        class="text-center"
        v-for="item of displayDates"
        :key="item"
        :style="`
          width: 14.28%;
          overflow-y: hidden;
       `"
      >
        {{ item }}
      </v-col>
    </v-row>
    <v-row no-gutters style="border: 1px solid grey">
      <v-col
        cols="auto"
        class="date-item"
        v-for="item of currentDates"
        :key="item.date.toString()"
        :style="`
        padding-bottom: 80px;
          width: 14.28%;
          overflow-y: hidden;
          border-right: 1px solid grey;
       `"
      >
        <div
          :style="`${item.date.date() == today.date() ? 'background-color: rgba(200, 0, 0, .3);' : 'background-color: rgba(0, 0, 0, 0.1)'}`"
          class="pa-1 font-weight-black"
        >
          {{ item.date.date() == today.date() ? 'Today, ' : '' }} {{ item.date.format("D") }}
        </div>
        <div v-if="item.track">
          <v-card
            class="pa-1 black--text mx-1 mt-1"
            style="background-color: rgba(0, 0, 0, 0.01)"
          >
            <div class="font-weight-black" style="font-size: 13px">
              {{ item.track.name }}
            </div>
            <div class="font-weight-medium black--text" style="font-size: 13px">
              <div>
                {{ formatDuration(item.track.duration) }}
              </div>
              <div>
                {{ toMiles(item.track.length) }}
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
  </div>
</template>

<script>
import _ from "lodash";
import moment from "moment";
import { toMiles } from "../tools/conversion";
import { formatDuration } from "../tools/format_moment";
export default {
  data() {
    return {
      currentDates: [],
      today: moment(),
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
  watch: {
    currentMoment() {
      console.log(this.currentMoment);
    },
  },
  mounted() {
    this.getDaysArray(
      this.currentMoment.year(),
      this.currentMoment.month(),
      this.currentMoment.daysInMonth()
    );
  },
  methods: {
    toMiles: toMiles,
    formatDuration: formatDuration,
    async getDaysArray(year, month, lastDayInMonth) {
      const currentDay = moment().set({
        year: year,
        month: month,
        date: lastDayInMonth,
      });
      while (currentDay.month() == month) {
        this.currentDates.push({ date: moment(currentDay.toString()) });
        currentDay.subtract(1, "day");
      }
      while (currentDay.day() == 1) {
        this.currentDates.push({ date: moment(currentDay.toString()) });
        currentDay.subtract(1, "day");
      }
      this.currentDates.reverse();
      await this.getTracks();
      this.loading = false;
    },
    async getTracks() {
      const startsAt = this.currentDates[0];
      const endsAt = this.currentDates[this.currentDates.length - 1];
      const response = await this.$axios.get(
        this.$axios.defaults.baseURL + "/recordings/me",
        {
          headers: {
            Authorization: "Bearer " + this.$store.state.auth.access_token,
          },
        },
        { startsAt: startsAt, endsAt: endsAt }
      );
      for (let item of this.currentDates) {
        const track = _.find(response.data, (track) => {
          return moment(track.started_at).date() == item.date.date();
        });
        if (track) {
          item.track = track;
        }
      }
      console.log(this.currentDates);
    },
  },
};
</script>

<style>
.add-event {
  opacity: 0;
}
.date-item:hover .add-event {
  opacity: 1;
}
</style>