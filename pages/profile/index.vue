<template>
  <div>
    <div v-if="this.me">
      <v-row justify="center" align="center" class="mt-16">
        <v-col cols="12" sm="10">
          <p class="text-h2 font-weight-bold">
            {{ me.display_name }}
          </p>
          <p>
            Below you can find some basic fitness statistics as well as your
            latest workouts
          </p>
          <div class="mt-10">
            <v-row>
              <v-col cols="12" sm="5">
                <div>
                  <p class="text-h4 mr-2">
                    HR Zones <span class="subtitle-1">(bpm)</span>
                  </p>
                </div>
                <div v-if="!me.threshold_hr" class="subtitle-2">
                  You must enter your Threshold Heart Rate in order to see
                  your HR zones
                </div>
                <div v-else>
                  <div
                    v-for="zone in hrZones"
                    :key="zone.title"
                    :class="
                      getZoneColor(zone.title) +
                      ' rounded mt-3 pa-2 text-center'
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
                      getZoneColor(zone.title) +
                      ' rounded mt-3 pa-2 text-center'
                    "
                  >
                    <div class="title">{{ zone.title }}</div>
                    <div>{{ zone.low }} - {{ zone.high }}</div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
          <div class="mt-16">
            <p class="text-h4">My Tracks</p>
            <div class="text-left">
              <Tracks />
            </div>
          </div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
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
    me() {
      return this.$store.state.auth.me;
    },
  },
  methods: {
    getZoneColor(title) {
      switch (title) {
        case "Recovery":
          return "grey";
        case "Endurance":
          return "blue";
        case "Tempo":
          return "green";
        case "Threshold":
          return "orange";
        case "VO2 Max":
          return "red";
        default:
          return "purple";
      }
    },
  },
};
</script>
