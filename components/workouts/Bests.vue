<template>
  <v-row>
    <v-col cols="auto">
      <div v-for="time in timeRanges" :key="time">
        <div v-if="bests.heartrate.hasOwnProperty(time)">
          <v-icon size="13" color="grey" class="mr-1">mdi-heart</v-icon
          >{{ time }} : {{ bests.heartrate[time] }} bpm
        </div>
      </div>
    </v-col>
    <v-col cols="auto">
      <div v-for="time in timeRanges" :key="time">
        <div v-if="bests.watts.hasOwnProperty(time)">
          <v-icon size="15" color="grey" class="mr-1">mdi-lightning-bolt</v-icon
          >{{ time }} : {{ bests.watts[time] }} watts
        </div>
      </div>
    </v-col>
  </v-row>
</template>


<script>
export default {
  props: {
    bests: {
      type: Object,
      required: true,
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
};
</script>