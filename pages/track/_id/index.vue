<template>
  <div class="ma-10">
    <div v-if="loading" class="ma-16 text-center">
      <v-progress-circular indeterminate size="80" />
    </div>
    <div v-else-if="track">
      <p class="text-h2 font-weight-bold">
        {{ track.name }}
      </p>
      <div style="background-color: rgba(255, 255, 255, 0.05)" class="pa-4">
        <v-row justify="space-between">
          <v-col cols="auto" v-for="stat in stats" :key="stat.name">
            <div v-if="stat.value">
              <span class="text-h4 font-weight-bold">{{ stat.name }}</span>
              <div>{{ stat.value }}</div>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="auto">
            <div v-for="time in timeRanges" :key="time">
              <div v-if="track.stats.bests.heartrate[time]">
                {{ time }} : {{ track.stats.bests.heartrate[time] }} bpm
              </div>
            </div>
          </v-col>
          <v-col cols="auto">
            <div v-for="time in timeRanges" :key="time">
              <div v-if="track.stats.bests.watts[time]">
                {{ time }} : {{ track.stats.bests.watts[time] }} bpm
              </div>
            </div>
          </v-col>
        </v-row>

        <div class="mt-5">
          <v-row>
            <!-- Heart Rate Zone -->
            <v-col v-if="track.stats.zones.hasHeartRate" cols="12" sm="6">
              <p class="text-h4 font-weight-bold">HR Data</p>
              <div
                v-for="zone in zoneNames"
                :key="zone"
                style="position: relative"
              >
                <div
                  v-if="track.stats.zones[zone]['hr-percentage'] >= 0"
                  class="mt-2"
                >
                  {{ zone }}
                  <div
                    style="
                      background-color: rgba(255, 255, 255, 0.05);
                      width: 100%;
                      height: 30px;
                      position: relative;
                    "
                  >
                    <div
                      class="pr-2 text-right"
                      style="padding-top: 3px; position: relative; z-index: 2"
                    >
                      {{ track.stats.zones[zone]["hr-percentage"] * 100 }}%
                    </div>
                    <div
                      class="text-center"
                      :style="`position: absolute; top: 0px; width: ${
                        track.stats.zones[zone]['hr-percentage'] * 100
                      }%; background-color: ${getColor(
                        zone
                      )}; height: 30px; z-index: 1`"
                    ></div>
                  </div>
                </div>
              </div>
            </v-col>

            <!-- Power Zones -->
            <v-col v-if="track.stats.zones.hasWatts" cols="12" sm="6">
              <p class="text-h4 font-weight-bold">Power Data</p>

              <div
                v-for="zone in zoneNames"
                :key="zone"
                style="position: relative"
              >
                <div
                  class="mt-2"
                  v-if="track.stats.zones[zone]['watt-percentage'] >= 0"
                >
                  {{ zone }}
                  <div
                    style="
                      background-color: rgba(255, 255, 255, 0.05);
                      width: 100%;
                      height: 30px;
                      position: relative;
                    "
                  >
                    <div
                      class="pr-2 text-right"
                      style="padding-top: 3px; position: relative; z-index: 2"
                    >
                      {{ track.stats.zones[zone]["watt-percentage"] * 100 }}%
                    </div>
                    <div
                      class="text-center"
                      :style="`position: absolute; top: 0px; width: ${
                        track.stats.zones[zone]['watt-percentage'] * 100
                      }%; background-color: ${getColor(zone)}; height: 30px;`"
                    ></div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import { formatDate, formatDuration } from "../../../tools/format_moment";
import { toMiles } from "~/tools/conversion.js";
import { getColor } from "../../../tools/zone_color";
export default {
  name: "Track",
  middleware: "auth",
  head: {
    title: "Track",
  },
  async asyncData({ route, $axios, store }) {
    let track = null;
    let loading = true;
    const id = route.params.id;
    try {
      const response = await $axios.get(
        $axios.defaults.baseURL + `/recordings/${id}`,
        {
          headers: { Authorization: "Bearer " + store.state.auth.access_token },
        }
      );
      track = response.data;
    } catch (e) {
      console.log(e);
    }
    loading = false;
    return { track, loading };
  },
  data() {
    return {
      stats: [],
      zoneNames: [
        "Recovery",
        "Endurance",
        "Tempo",
        "Threshold",
        "VO2 Max",
        "Anaerobic",
      ],
      timeRanges: [
        "1hr",
        "20min",
        "10min",
        "5min",
        "2min",
        "1min",
        "30sec",
        "5sec",
      ],
    };
  },
  mounted() {
    this.buildStats();
  },
  computed: {
    me() {
      return this.$store.state.auth.me;
    },
    authentication() {
      return this.$store.state.auth.access_token;
    },
  },
  methods: {
    getColor: getColor,
    buildStats() {
      if (this.track) {
        this.stats = [
          { name: "Date", value: formatDate(this.track.started_at) },
          { name: "Duration", value: formatDuration(this.track.duration) },
          { name: "Distance", value: toMiles(this.track.length) },
        ];
        if (this.track.hr_effort) {
          this.stats.push({ name: "HR Effort", value: this.track.hr_effort });
        }
        if (this.track.effort) {
          this.stats.push({ name: "Effort", value: this.track.effort });
        }
      }
    },
  },
};
</script>