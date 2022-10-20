<template>
  <v-row>
    <v-col cols="auto">
      <div v-for="time in timeRanges" :key="time">
        <div v-if="bests && bests.heartrate.hasOwnProperty(time) && bests.heartrate[time] > 0">
          <v-icon size="13" color="grey" class="mr-1">mdi-heart</v-icon
          >{{ time }} : {{ bests.heartrate[time] }} bpm
           <v-icon small color="#FCC201">
            {{ isBest(time, "heartrate") ? "mdi-trophy-variant" : "" }}
          </v-icon>
        </div>
      </div>
    </v-col>
    <v-col cols="auto">
      <div v-for="time in timeRanges" :key="time">
        <div v-if="bests && bests.watts.hasOwnProperty(time) && bests.watts[time] > 0">
          <v-icon size="15" color="grey" class="mr-1">mdi-lightning-bolt</v-icon
          >{{ time }} : {{ bests.watts[time] }} watts
          <v-icon small color="#FCC201">
            {{ isBest(time, "watts") ? "mdi-trophy-variant" : "" }}
          </v-icon>
        </div>
      </div>
    </v-col>
  </v-row>
</template>


<script>
export default {
  props: {
    isAllTime: {
      type: Boolean,
      require: false,
      default: false,
    },
    bests: {
      type: Object,
      required: false,
    },
  },
  computed: {
    me() {
      return this.$store.state.auth.me;
    },
  },
  data() {
    return {
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
  methods: {
    isBest(key, type) {
      if (this.bests[type][key] >= this.me.bests[type][key] && !this.isAllTime) {
        return true;
      }
      return false;
    },
  },
};
</script>