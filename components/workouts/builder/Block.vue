<template>
  <div v-if="block && loaded">
    <div>
      <v-row
        no-gutters
        align="end"
        :style="`
          border: ${showBorder ? '1px solid rgba(100, 100, 100, 0.2)' : ''};
          height: ${height}px;
          ${!isAdded ? 'width: 100px;' : ''}
          position: relative
        `"
      >
        <v-col v-for="index in block.numSets" :key="index">
          <v-row no-gutters :style="`height: ${height}px;`" align="end">
            <v-col
              :cols="isAdded ? 'auto' : 'full'"
              v-for="(set, i) in block.sets"
              :key="i"
              :style="`background-color: ${getZoneColor(
                set.target
              )}; height: ${getHeight(set.target)}%; ${
                isAdded ? 'width: ' + getWidth(set.duration) + 'px' : ''
              }`"
          />
          </v-row>
        </v-col>
      </v-row>
    </div>
  </div>
</template>


<script>
import { getColor } from "~/tools/zone_color.js";
import { formatDuration } from "~/tools/format_moment";
import moment from "moment";
export default {
  props: {
    showBorder: {
      type: Boolean,
      required: false,
      default: true,
    },
    isAdded: {
      type: Boolean,
      required: false,
      default: false,
    },
    height: {
      type: Number,
      required: false,
      default: 50,
    },
    block: {
      type: Object,
      required: true,
    },
  },
  computed: {
    me() {
      return this.$store.state.auth.me;
    },
  },
  mounted() {
    this.zones = this.me.hr_zones;
    this.init();
  },
  data() {
    return {
      loaded: false,
      zones: null,
    };
  },
  methods: {
    getColor: getColor,
    formatDuration: formatDuration,
    getWidth(duration) {
      duration = moment.duration(duration).asSeconds();
      return duration / 6.4;
    },
    init() {
      let duration = 0;
      for (let i = 0; i < this.block.numSets; i++) {
        for (const set of this.block.sets) {
          duration += moment.duration(set.duration).asSeconds();
        }
      }
      this.block.duration = duration;
      this.loaded = true;
    },
    getHeightOfBlock() {
      let max = 0;
      for (const set of this.block.sets) {
        if (this.getHeight(set.target) > max) {
          max = this.getHeight(set.target) * 1.55;
        }
      }
      return max;
    },
    getHeight(target) {
      return (target / 400) * 100;
    },
    getZoneColor(target) {
      if (this.zones) {
        for (const zone of this.zones) {
          if (target >= zone.low && target <= zone.high) {
            return this.getColor(zone.title);
          }
        }
      }
      return "red";
    },
  },
};
</script>