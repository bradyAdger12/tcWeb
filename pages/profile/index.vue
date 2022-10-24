<template>
  <v-container>
    <div v-if="this.me">
      <v-row justify="center" align="center">
        <v-col cols="11">
          <div class="mt-1">
            <div v-if="authenticated">
              <p class="text-h4 title">Todays Fitness</p>
              <UserTrainingLoad :date="getMoment()" />
            </div>
            <!-- Bests for workout -->
            <div class="py-4">
              <p class="text-h4">All Time Bests</p>
              <WorkoutsBests :bests="me.bests" :is-all-time="true" />
            </div>
            <v-row>
              <v-col cols="auto" sm="5">
                <v-row no-gutters>
                  <v-col cols="7">
                    <p class="text-h4 mr-2">
                      HR Zones <span class="subtitle-1">(bpm)</span>
                    </p>
                  </v-col>
                  <v-col cols="4">
                    <WorkoutsActivityDropdown :currentActivity="selectedActivity" @onActivityChange="(e) => selectedActivity = e" />
                  </v-col>
                </v-row>
                <div v-if="!me.threshold_hr" class="subtitle-2">
                  You must enter your Threshold Heart Rate in order to see your
                  HR zones
                </div>
                <div v-else>
                  <div
                    v-for="zone in hrZones[selectedActivity]"
                    :key="zone.title"
                    :class="
                      getColor(zone.title) + ' rounded mt-3 pa-2 text-center white--text'
                    "
                  >
                    <div class="title">{{ zone.title }}</div>
                    <div>{{ zone.low }} - {{ zone.high }}</div>
                  </div>
                </div>
              </v-col>
              <v-col v-if="selectedActivity === 'ride'" cols="auto" sm="5">
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
                      getColor(zone.title) + ' rounded mt-3 pa-2 text-center white--text'
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
      selectedActivity: 'ride',
      hrZones: {},
      powerZones: [],
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
  },
  computed: {
    authenticated() {
      return this.$store.state.auth.access_token;
    },
    me() {
      return this.$store.state.auth.me;
    },
  },
  methods: {
    getMoment() {
      return moment()
    },
    getColor: getColor,
  },
};
</script>

<style>
.training-load-value {
  font-size: 40px;
  font-weight: bold;
}
</style>