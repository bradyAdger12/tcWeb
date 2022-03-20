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
                {{ time }} : {{ track.stats.bests.watts[time] }} watts
              </div>
            </div>
          </v-col>
        </v-row>

        <div class="mt-5">
          <v-row>
            <!-- Heart Rate Zones -->
            <v-col v-if="track.stats.zones.hasHeartRate" cols="12" sm="6">
              <p class="text-h4 font-weight-bold">HR Data</p>
              <ZoneDistribution
                :track_zones="track.stats.zones"
                :me_zones="me.hr_zones"
                 :zone_type="'hr'"
              />
            </v-col>

            <!-- Power Zones -->
            <v-col v-if="track.stats.zones.hasWatts" cols="12" sm="6">
              <p class="text-h4 font-weight-bold">Power Data</p>

              <ZoneDistribution
                :track_zones="track.stats.zones"
                :me_zones="me.power_zones"
                :zone_type="'watt'"
              />
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
import ZoneDistribution from "../../../components/tracks/ZoneDistribution.vue";
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
  components: { ZoneDistribution },
  data() {
    return {
      stats: [],
      timeRanges: [
        "1hr",
        "20min",
        "10min",
        "5min",
        "2min",
        "1min",
        "30sec",
        "5sec",
        "max"
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
    formatDuration: formatDuration,
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