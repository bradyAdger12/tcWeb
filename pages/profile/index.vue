<template>
  <v-container>
    <div v-if="this.me">
      <v-row justify="center" align="center" class="my-16">
        <v-col cols="11">
          <div class="mt-10">
            <div v-if="trainingLoad" class="mb-10">
              <v-row>
                <v-col cols="auto">
                  <v-avatar class="blue" size="150">
                    <div>
                      <span class="training-load-value">{{
                        trainingLoad.fitness
                      }}</span>
                      <p>Fitness</p>
                    </div>
                  </v-avatar>
                </v-col>
                <v-col cols="auto">
                  <v-avatar class="orange" size="150">
                    <div>
                      <span class="training-load-value">{{
                        trainingLoad.fatigue
                      }}</span>
                      <p>Fatigue</p>
                    </div>
                  </v-avatar>
                </v-col>
                <v-col cols="auto">
                  <v-avatar
                    :class="`${trainingLoad.form < 0 ? 'red' : 'green'}`"
                    size="150"
                  >
                    <div>
                      <span class="training-load-value">{{
                        trainingLoad.form
                      }}</span>
                      <p>Form</p>
                    </div>
                  </v-avatar>
                </v-col>
              </v-row>
            </div>
            <!-- Bests for workout -->
            <div class="py-4">
              <p class="text-h4">All Time Bests</p>
              <WorkoutsBests :bests="me.bests" :is-all-time="true" />
            </div>
            <v-row>
              <v-col cols="12" sm="5">
                <div>
                  <p class="text-h4 mr-2">
                    HR Zones <span class="subtitle-1">(bpm)</span>
                  </p>
                </div>
                <div v-if="!me.threshold_hr" class="subtitle-2">
                  You must enter your Threshold Heart Rate in order to see your
                  HR zones
                </div>
                <div v-else>
                  <div
                    v-for="zone in hrZones"
                    :key="zone.title"
                    :class="
                      getColor(zone.title) + ' rounded mt-3 pa-2 text-center'
                    "
                  >
                    <div class="title">{{ zone.title }}</div>
                    <div>{{ zone.low }} - {{ zone.high }}</div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="5">
                <div>
                  <p class="text-h4 mr-2">
                    Power Zones <span class="subtitle-1">(watts)</span>
                  </p>
                </div>
                <div v-if="!me.threshold_power" class="subtitle-2">
                  You must enter your Functional Threshold Power in order to see
                  your power zones
                </div>
                <div v-else>
                  <div
                    v-for="zone in powerZones"
                    :key="zone.title"
                    :class="
                      getColor(zone.title) + ' rounded mt-3 pa-2 text-center'
                    "
                  >
                    <div class="title">{{ zone.title }}</div>
                    <div>{{ zone.low }} - {{ zone.high }}</div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import { getColor } from "../../tools/zone_color";
import moment from "moment";
export default {
  name: "ProfilePage",
  head: {
    title: "Profile",
  },
  middleware: "auth",
  data() {
    return {
      hrZones: [],
      powerZones: [],
      trainingLoad: null,
    };
  },
  watch: {
    me() {
      if (!this.me) {
        this.$router.push("/");
      }
    },
  },
  mounted() {
    this.hrZones = this.me.hr_zones;
    this.powerZones = this.me.power_zones;
    this.getTrainingLoad();
  },
  computed: {
    me() {
      return this.$store.state.auth.me;
    },
  },
  methods: {
    getColor: getColor,
    async getTrainingLoad() {
      try {
        const response = await this.$axios.get(
          this.$axios.defaults.baseURL +
            `/users/me/training_load?date=${moment().toISOString()}`,
          {
            headers: {
              Authorization: "Bearer " + this.$store.state.auth.access_token,
            },
          }
        );
        this.trainingLoad = response.data;
      } catch (e) {}
    },
  },
};
</script>

<style>
.training-load-value {
  font-size: 40px;
  font-weight: bold;
}
</style>