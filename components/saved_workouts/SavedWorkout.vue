<template>
  <div class="mx-3">
    <div class="grey lighten-3 rounded">
      <div class="font-weight-medium py-3">
        {{ savedWorkout.name }}
      </div>

      <div
        v-for="(block, i) of savedWorkout.workout"
        :key="i"
        cols="auto"
        style="display: inline-block; position: relative"
      >
        <v-row no-gutters align="end" :style="`height: ${containerHeight}px`">
          <v-col v-for="index in block.numSets" cols="auto" :key="index">
            <v-row no-gutters :style="`height: ${containerHeight}px`" align="end">
              <v-col
                v-for="(set, index2) of block.sets"
                cols="auto"
                :key="index2"
                class="elevation-3 rounded-t-lg set text-center"
                :style="`background-color: ${getColorOfSet(
                  set.value
                )}; height: ${getHeight(set.value)}%; width: ${getWidth(
                  set.duration
                )}px;`"
              >
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </div>
      <div>
        <WorkoutIcon :activity="savedWorkout.activity" size="1.0em" /> | {{ getDuration() }}<span v-if="savedWorkout.tss || savedWorkout.hrTss"> | {{ savedWorkout.tss || savedWorkout.hrTss }} {{ savedWorkout.tss ? 'TSS' : 'hrTSS'}}</span> 
        | <v-btn icon @click.stop="openDeleteDialog = true" x-small>
            <v-icon class="mdi mdi-delete" />
          </v-btn>
      </div>
    </div>
    <v-dialog v-model="openDeleteDialog" width="400" light>
      <DialogsDeleteSavedWorkout :savedWorkout="savedWorkout" @onDelete="openDeleteDialog=false" />
    </v-dialog>
  </div>
</template>


<script>
import moment from "moment";
import { formatDuration } from "~/tools/format_moment";
import { getColor } from "~/tools/zone_color";
export default {
  props: {
    savedWorkout: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      zones: [],
      isPower: true,
      openDeleteDialog: false,
      containerHeight: 100
    };
  },
  mounted() {
    this.zones = this.isPower
      ? this.me.power_zones["ride"]
      : this.me.hr_zones[this.savedWorkout.activity];
  },
  computed: {
    me() {
      return this.$store.state.auth.me;
    },
  },
  methods: {
    getColorOfSet(value) {
      for (const zone of this.zones) {
        if (zone.high == "MAX") {
          return getColor(zone.title);
        } else if (value >= zone.low && value <= zone.high) {
          return getColor(zone.title);
        }
      }
    },
    getDuration() {
      let duration = 0;
      for (const block of this.savedWorkout.workout) {
        for (let i = 0; i < block.numSets; i++) {
          for (const set of block.sets) {
            duration += moment.duration(set.duration).asSeconds();
          }
        }
      }
      return formatDuration(duration);
    },
    getWidth(duration) {
      duration = moment.duration(duration).asSeconds();
      const max = 400;
      const value = (duration * 100) / 2000;
      if (value < 8) {
        return 8;
      } else if (value > max) {
        return max;
      }
      return value;
    },
    getHeight(value) {
      const height = (value / this.getMaxHeightValue()) * 100;
      return height;
    },
    getMaxHeightValue() {
      let max = 0;
      for (const block of this.savedWorkout.workout) {
        for (const set of block.sets) {
          if (set.value > max) {
            max = set.value;
          }
        }
      }
      return this.savedWorkout.workout.length == 1 || max < this.containerHeight ? 200 : max;
    },
  },
};
</script>