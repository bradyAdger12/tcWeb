<template>
  <div class="pa-5 black--text white" style="position: relative">
    <div v-if="loading" class="ma-16 text-center">
      <v-progress-circular indeterminate size="80" />
    </div>
    <div v-else-if="workout">
      <div class="text-h5 text-sm-h2 font-weight-bold">
        {{ workout.name }}
      </div>
      <div class="subtitle-1">
        {{ formatDate(workout.started_at) }}
      </div>
      <div class="mt-3">
        <i>{{ workout.description }}</i>
      </div>
      <div
        style="background-color: rgba(0, 0, 0, 0.1)"
        class="pa-4 mt-4 rounded"
      >
        <v-row>
          <v-col cols="auto" v-for="stat in stats" :key="stat.name">
            <div v-if="stat.value">
              <span class="text-h5 text-sm-h4 font-weight-bold">{{
                stat.value
              }}</span>
              <div>{{ stat.name }}</div>
            </div>
          </v-col>
        </v-row>

        <!-- Bests for workout -->
        <WorkoutsBests :bests="workout.bests" />

        <div class="mt-5">
          <v-row>
            <!-- Heart Rate Zones -->
            <v-col
              v-if="workout.zones.hasHeartRate"
              cols="12"
              :sm="workout.zones.hasWatts ? '6' : '12'"
            >
              <p class="text-h5 text-sm-h4 font-weight-bold">HR Zones</p>
              <ZoneDistribution
                :workout_zones="workout.zones"
                :me_zones="me.hr_zones"
                :zone_type="'hr'"
              />
            </v-col>

            <!-- Power Zones -->
            <v-col
              v-if="workout.zones.hasWatts"
              cols="12"
              :sm="workout.zones.hasHeartRate ? '6' : '12'"
            >
              <p class="text-h5 text-sm-h4 font-weight-bold">Power Zones</p>

              <ZoneDistribution
                :workout_zones="workout.zones"
                :me_zones="me.power_zones"
                :zone_type="'watt'"
              />
            </v-col>
          </v-row>
        </div>
      </div>
      <v-switch light v-model="showZones" :label="`Show zones`"></v-switch>
      <highchart class="mt-4" style="height: 300px" :options="chartOptions" />
      <v-card-actions>
        <v-btn color="blue" @click="openEditDialog = true"> Edit </v-btn>
        <v-btn color="red" @click="openDeleteDialog = true"> Delete </v-btn>
      </v-card-actions>
      <v-dialog v-model="openEditDialog" width="400" light>
        <v-card>
          <v-card-title> Edit Workout </v-card-title>
          <v-card-text>
            <WorkoutsEdit
              :workout="workout"
              @onUpdate="openEditDialog = false"
            />
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model="openDeleteDialog" width="400" light>
        <DialogsDeleteWorkout
          :workout="workout"
          @onDelete="openDeleteDialog = false; $emit('onDelete')"
        />
      </v-dialog>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import { formatDate, formatDuration } from "~/tools/format_moment";
import { toMiles } from "~/tools/conversion.js";
import duration from "format-duration";
import ZoneDistribution from "~/components/workouts/ZoneDistribution.vue";
export default {
  name: "Workout",
  middleware: "auth",
  props: {
    workoutId: {
      type: Number,
      required: true,
    },
  },
  components: { ZoneDistribution },
  data() {
    return {
      chartsOptions: null,
      stats: [],
      loading: true,
      deleting: false,
      updating: false,
      openDeleteDialog: false,
      openEditDialog: false,
      workout: null,
      showZones: false,
    };
  },
  async mounted() {
    await this.getWorkout();
    this.buildStats();
    this.loading = false;
  },
  computed: {
    me() {
      return this.$store.state.auth.me;
    },
    authentication() {
      return this.$store.state.auth.access_token;
    },
  },
  watch: {
    showZones() {
      this.buildChart();
    },
  },
  methods: {
    formatDuration: formatDuration,
    formatDate: formatDate,
    async getWorkout() {
      try {
        const response = await this.$axios.get(
          this.$axios.defaults.baseURL + `/workouts/${this.workoutId}`,
          {
            headers: {
              Authorization: "Bearer " + this.$store.state.auth.access_token,
            },
          }
        );
        this.workout = response.data;
        this.buildChart();
      } catch (e) {
        console.log(e);
      }
    },
    showChartZones(zones) {
      return [
        {
          value: _.find(zones, (item) => item.title == "Recovery")?.high,
          color: "grey",
        },
        {
          value: _.find(zones, (item) => item.title == "Endurance")?.high,
          color: "blue",
        },
        {
          value: _.find(zones, (item) => item.title == "Tempo")?.high,
          color: "green",
        },
        {
          value: _.find(zones, (item) => item.title == "Threshold")?.high,
          color: "orange",
        },
        {
          value: _.find(zones, (item) => item.title == "VO2 Max")?.high,
          color: "red",
        },
      ];
    },
    buildChart() {
      const series = [];
      if (this.workout.streams.heartrate) {
        series.push({
          lineWidth: 1.0,
          name: "Heart Rate",
          color: "red",
          tooltip: {
            valueSuffix: "bpm",
          },
          states: {
            hover: {
              enabled: false,
              lineWidth: 1,
            },
          },
          type: "line",
          zones: !this.showZones ? [] : this.showChartZones(this.me.hr_zones),
          data: this.workout.streams.heartrate.data,
        });
      }
      if (this.workout.streams.watts) {
        series.push({
          lineWidth: 1.0,
          color: "blue",
          name: "Power",
          states: {
            hover: {
              enabled: false,
              lineWidth: 1,
            },
          },
          tooltip: {
            valueSuffix: "watts",
          },
          type: "line",
          zones: !this.showZones
            ? []
            : this.showChartZones(this.me.power_zones),
          data: this.workout.streams.watts.data,
        });
      }
      this.chartOptions = {
        title: {
          text: "",
        },
        tooltip: {
          formatter: function () {
            return `${duration(this.x * 1000)}<br><strong>${this.y}</strong>${
              this.color == "blue" ? "watts" : "bpm"
            }`;
          },
        },
        xAxis: {
          labels: {
            formatter: (e) => {
              return this.formatDuration(e.value);
            },
          },
        },
        series: series,
      };
    },
    buildStats() {
      if (this.workout) {
        console.log;
        this.stats = [
          { name: "Duration", value: formatDuration(this.workout.duration) },
          { name: "Distance", value: toMiles(this.workout.length) },
        ];
        if (this.workout.hr_effort) {
          this.stats.push({ name: "HR Effort", value: this.workout.hr_effort });
        }
        if (this.workout.effort) {
          this.stats.push({ name: "Effort", value: this.workout.effort });
        }
      }
    },
  },
};
</script>