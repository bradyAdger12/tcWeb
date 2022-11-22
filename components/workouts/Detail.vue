<template>
  <v-container>
    <div class="black--text white" style="position: relative">
      <div v-if="workout">
        <div v-if="workout.planned" class="mb-3">
          <span
            :class="`white--text ${
              workout.is_completed ? 'green' : 'purple'
            } rounded-lg pa-2 d-inline`"
          >
            {{ workout.is_completed ? "Completed Workout" : "Planned Workout" }}
          </span>
        </div>
        <WorkoutIcon :activity="workout.activity" size="3em" />
        <div class="text-h2 text-sm-h2" style="font-weight: 800">
          {{ workout.name }}
          <v-btn icon @click="openEditDialog = true">
            <v-icon class="mdi mdi-pencil" />
          </v-btn>
          <v-btn icon @click="openDeleteDialog = true">
            <v-icon class="mdi mdi-delete" />
          </v-btn>
        </div>
        <div class="subtitle-1">
          {{ formatDate(workout.started_at) }}
        </div>
        <div class="mt-3">
          <i>{{ workout.description }}</i>
        </div>
        <div class="mt-4">
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
          <div v-if="!workout.planned">
            <WorkoutsBests :bests="workout.bests" :key="workout.id" />
          </div>

          <div class="mt-5">
            <v-row>
              <!-- Heart Rate Zones -->
              <v-col
                v-if="workout.zones && workout.zones.hasHeartRate"
                cols="12"
                :sm="workout.zones.hasWatts ? '6' : '12'"
              >
                <p class="text-h5 text-sm-h4 font-weight-bold">HR Zones</p>
                <ZoneDistribution
                  :workout_zones="workout.zones"
                  :me_zones="me.hr_zones"
                  :activity="workout.activity"
                  :zone_type="'hr'"
                />
              </v-col>

              <!-- Power Zones -->
              <v-col
                v-if="workout.zones && workout.zones.hasWatts"
                cols="12"
                :sm="workout.zones.hasHeartRate ? '6' : '12'"
              >
                <p class="text-h5 text-sm-h4 font-weight-bold">Power Zones</p>
                <ZoneDistribution
                  :workout_zones="workout.zones"
                  :me_zones="me.power_zones"
                  :activity="workout.activity"
                  :zone_type="'watt'"
                />
              </v-col>
            </v-row>
          </div>
        </div>
        <v-switch
          v-if="workout.zones"
          light
          v-model="showZones"
          :label="`Show zones`"
        ></v-switch>
        <v-row v-if="wattAvg || hrAvg">
          <v-col v-if="timespan" cols="auto">
            <strong>Timespan: </strong>{{ timespan }}
          </v-col>
          <v-col v-if="wattAvg" cols="auto">
            <strong>Power Avg: </strong>{{ wattAvg }}w
          </v-col>
          <v-col v-if="hrAvg" cols="auto">
            <strong>HR Avg: </strong> {{ hrAvg }}bpm
          </v-col>
        </v-row>
        <highchart
          v-if="workout.zones"
          class="mt-4"
          style="height: 300px"
          :options="chartOptions"
        />
        <v-dialog v-model="openEditDialog" width="400" light>
          <v-card>
            <v-card-title> Edit Workout </v-card-title>
            <v-card-text>
              <WorkoutsEdit :workout="workout" @onUpdate="onUpdatedWorkout" />
            </v-card-text>
          </v-card>
        </v-dialog>
        <v-dialog v-model="openDeleteDialog" width="400" light>
          <DialogsDeleteWorkout
            :workout="workout"
            @onDelete="openDeleteDialog = false"
            @onClose="openDeleteDialog = false"
          />
        </v-dialog>
      </div>
    </div>
  </v-container>
</template>

<script>
import _ from "lodash";
import { formatDate, formatDuration } from "~/tools/format_moment";
import { toMiles } from "~/tools/conversion.js";
import duration from "format-duration";
import ZoneDistribution from "~/components/workouts/ZoneDistribution.vue";
import WorkoutIcon from "../WorkoutIcon.vue";
export default {
  name: "Workout",
  middleware: "auth",
  props: {
    workout: {
      type: Object,
      required: true,
    },
  },
  components: { ZoneDistribution, WorkoutIcon },
  data() {
    return {
      chartOptions: null,
      stats: [],
      hrAvg: null,
      wattAvg: null,
      timespan: null,
      deleting: false,
      updating: false,
      openDeleteDialog: false,
      openEditDialog: false,
      showZones: false,
    };
  },
  async mounted() {
    this.buildChart();
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
  watch: {
    showZones() {
      this.buildChart();
    },
  },
  methods: {
    formatDuration: formatDuration,
    formatDate: formatDate,
    onUpdatedWorkout(e) {
      this.workout = e;
      this.openEditDialog = false;
    },
    average (array) {
      return array.reduce((a, b) => a + b) / array.length;
    },
    showChartZones(zones) {
      const activityZones = zones[this.workout.activity];
      return [
        {
          value: _.find(activityZones, (item) => item.title == "Recovery")
            ?.high,
          color: "grey",
        },
        {
          value: _.find(activityZones, (item) => item.title == "Endurance")
            ?.high,
          color: "blue",
        },
        {
          value: _.find(activityZones, (item) => item.title == "Tempo")?.high,
          color: "green",
        },
        {
          value: _.find(activityZones, (item) => item.title == "Threshold")
            ?.high,
          color: "orange",
        },
        {
          value: _.find(activityZones, (item) => item.title == "VO2 Max")?.high,
          color: "red",
        },
      ];
    },
    buildChart() {
      const series = [];
      if (this.workout.streams?.heartrate) {
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
      if (this.workout.streams?.watts) {
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
        chart: {
        zoomType: 'x',
        events: { 
          selection: (event) => {
            if (event.resetSelection) {
              this.hrAvg = null
              this.wattAvg = null
              this.timespan = null
            }
            if (event?.xAxis) {
              const min = Math.round(event.xAxis[0].min)
              const max = Math.round(event.xAxis[0].max)
              this.timespan = `${this.formatDuration(min)} - ${this.formatDuration(max)}`
              const hrData = this.workout.streams.heartrate?.data
              const wattData = this.workout.streams.watts?.data
              if (hrData) {
                const hrArray = hrData.slice(min, max)
                this.hrAvg = Math.round(hrArray.reduce((a, b) => a + b) / hrArray.length)
              } if (wattData) {
                const wattArray = wattData.slice(min, max)
                this.wattAvg = Math.round(wattArray.reduce((a, b) => a + b) / wattArray.length)
              }
            }
          },
        }
      },
        tooltip: {
          formatter: function () {
            const name = this.point.series.name
            return `${duration(this.x * 1000)}<br><strong>${this.y}</strong>${
              name === 'Power' ? "watts" : "bpm"
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
        this.stats = [
          { name: "Duration", value: formatDuration(this.workout.duration) },
        ];
        if (this.workout.activity !== "workout") {
          this.stats.push({
            name: "Distance",
            value: toMiles(this.workout.length),
          });
        }
        if (this.workout.activity === "run") {
          const pace = new Date(
            (this.workout.duration / (this.workout.length * 0.000621371)) * 1000
          )
            .toISOString()
            .substring(14, 19);
          this.stats.push({ name: "Pace", value: pace });
        }
        if (this.workout.hr_effort) {
          this.stats.push({ name: "hrTSS", value: this.workout.hr_effort });
        }
        if (this.workout.effort) {
          this.stats.push({ name: "Effort", value: this.workout.effort });
        }
      }
    },
  },
};
</script>