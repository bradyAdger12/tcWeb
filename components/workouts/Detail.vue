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

        <v-row>
          <v-col cols="auto">
            <div v-for="time in timeRanges" :key="time">
              <div v-if="workout.bests.heartrate[time]">
                <v-icon size="13" color="grey" class="mr-1">mdi-heart</v-icon
                >{{ time }} : {{ workout.bests.heartrate[time] }} bpm
              </div>
            </div>
          </v-col>
          <v-col cols="auto">
            <div v-for="time in timeRanges" :key="time">
              <div v-if="workout.bests.watts[time]">
                <v-icon size="15" color="grey" class="mr-1"
                  >mdi-lightning-bolt</v-icon
                >{{ time }} : {{ workout.bests.watts[time] }} watts
              </div>
            </div>
          </v-col>
        </v-row>

        <div class="mt-5">
          <v-row>
            <!-- Heart Rate Zones -->
            <v-col
              v-if="workout.zones.hasHeartRate"
              cols="12"
              :sm="workout.zones.hasWatts ? '6' : '12'"
            >
              <p class="text-h5 text-sm-h4 font-weight-bold">HR Data</p>
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
              <p class="text-h5 text-sm-h4 font-weight-bold">Power Data</p>

              <ZoneDistribution
                :workout_zones="workout.zones"
                :me_zones="me.power_zones"
                :zone_type="'watt'"
              />
            </v-col>
          </v-row>
        </div>
      </div>
      <highchart
        class="mt-4"
        style="height: 300px"
        :options="chartOptions"
        :update="['options.title', 'options.series']"
      />
      <v-card-actions>
        <v-btn color="blue"> Edit </v-btn>
        <v-btn color="red" @click="openDeleteDialog = true"> Delete </v-btn>
      </v-card-actions>
      <v-dialog v-model="openDeleteDialog" width="400" light>
        <v-card>
          <v-card-title> Delete Workout? </v-card-title>
          <v-card-text>
            Are you sure you want to delete <strong>{{ workout.name }}</strong
            >?
          </v-card-text>
          <v-card-actions>
            <v-btn @click="deleteWorkout">
              Yes
              <v-progress-circular
                v-if="deleting"
                size="15"
                indeterminate
                width="2"
                class="ml-1"
              />
            </v-btn>
            <v-btn @click="openDeleteDialog = false"> No </v-btn>
          </v-card-actions>
        </v-card>
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
      workout: null,
      timeRanges: [
        "1hr",
        "20min",
        "10min",
        "5min",
        "2min",
        "1min",
        "30sec",
        "5sec",
        "max",
      ],
    };
  },
  async mounted() {
    await this.getWorkout();
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
  methods: {
    formatDuration: formatDuration,
    formatDate: formatDate,
    async deleteWorkout() {
      // const id = this.workoutId;
      // const token = this.authentication;
      // this.deleting = true;
      try {
        // await this.$store.dispatch("workouts/deleteWorkout", { id, token });
        // this.$store.dispatch("snackbar/showSnack", {
        //   text: "Workout successfully deleted!",
        //   color: "green",
        //   timeout: 3500,
        // });
        this.openDeleteDialog = false;
        this.$emit("onDelete");
      } catch (e) {}
      this.deleting = false;
    },
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
      } catch (e) {
        console.log(e);
      }
    },
    buildStats() {
      if (this.workout) {
        this.stats = [
          { name: "Duration", value: formatDuration(this.workout.duration) },
          { name: "Distance", value: toMiles(this.workout.length) },
        ];
        if (this.workout.hr_effort) {
          this.push({ name: "HR Effort", value: this.workout.hr_effort });
        }
        if (this.workout.effort) {
          this.push({ name: "Effort", value: this.workout.effort });
        }
      }
    },
  },
};
</script>