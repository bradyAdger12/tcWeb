<template>
  <div>
    <div v-for="zone in zoneNames" :key="zone" style="position: relative">
      <div v-if="workout_zones[zone][`${zone_type}-percentage`] >= 0" class="mt-2">
        {{ zone }}
        {{
          `(${me_zones.find((item) => item.title == zone).low} - ${
            me_zones.find((item) => item.title == zone).high
          })`
        }}
        <div
          class="white--text"
          style="
            background-color: rgba(0, 0, 0, 0.3);
            width: 100%;
            height: 30px;
            position: relative;
          "
        >
          <div
            class="pr-2 text-right"
            style="padding-top: 3px; position: relative; z-index: 2"
          >
            {{ (workout_zones[zone][`${zone_type}-percentage`] * 100).toFixed() }}% /
            {{ formatDuration(workout_zones[zone][`${zone_type}-seconds`]) }}
          </div>
          <div
            class="text-center"
            :style="`position: absolute; top: 0px; width: ${
              workout_zones[zone][`${zone_type}-percentage`] * 100
            }%; background-color: ${getColor(zone)}; height: 30px; z-index: 1`"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate, formatDuration } from "~/tools/format_moment";
import { toMiles } from "~/tools/conversion.js";
import { getColor } from "~/tools/zone_color.js";
export default {
  props: {
    zone_type: {
      type: String,
      required: true
    },
    workout_zones: {
      type: Object,
      required: true,
    },
    me_zones: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      zoneNames: [
        "Recovery",
        "Endurance",
        "Tempo",
        "Threshold",
        "VO2 Max",
        "Anaerobic",
      ]
    };
  },
  methods: {
    getColor: getColor,
    formatDuration: formatDuration,
  },
};
</script>