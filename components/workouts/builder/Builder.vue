<template>
  <div class="mt-2">
    <p>
      <i>Drag the blocks below to build your workout</i>
    </p>
    <v-row class="ml-1 mt-1">
      <v-col
        v-for="(block, i) of blocks"
        :key="i"
        cols="auto"
        class="rounded white--text text-center mr-2"
        :style="`background-color: ${block.color}; cursor: grab;`"
        :draggable="true"
        @dragend="blockBeingDragged = null"
        @dragstart="dragStart($event, block)"
        >{{ block.type }}
        <div v-if="block.type != 'Intervals'">
          {{ getZoneRange(block.type) }}
        </div></v-col
      >
    </v-row>

    <!-- Blocks Added -->
    <div
      class="mt-12 rounded text-left"
      style="
        height: 250px;
        background-color: rgba(100, 100, 100, 0.2);
        white-space: nowrap;
        overflow-x: scroll;
        overflow-y: hidden;
      "
      align="end"
      @dragover="onDragOver"
      @drop="onDrop($event, addedBlocks.length)"
    >
      <draggable v-model="addedBlocks">
        <div
          v-for="(block, i) of addedBlocks"
          :key="i"
          cols="auto"
          style="display: inline-block; position: relative"
        >
          <v-row no-gutters align="end" style="height: 250px">
            <v-col
              v-if="i == 0"
              cols="auto"
              :style="`
                width: 10px;
                height: 70%;
                background-color: rgba(100, 100, 100, ${
                  blockBeingDragged ? '0.2' : '0.0'
                });
              `"
              class="mx-1 rounded-t-xl"
              @dragover="onDragOver"
              @drop="onDrop($event, i, true)"
            />
            <v-col v-for="index in block.numSets" cols="auto" :key="index">
              <v-row no-gutters style="height: 250px" align="end">
                <v-col
                  v-for="(set, index2) of block.sets"
                  cols="auto"
                  :key="index2"
                  class="elevation-3 rounded-t-lg set"
                  :style="`background-color: ${getColorOfSet(
                    set.value
                  )}; height: ${getHeight(set.value)}%; width: ${getWidth(
                    set.duration
                  )}px; cursor: grab;`"
                >
                  <!-- Overlay Block -->
                  <div
                    v-if="index2 == 0"
                    :style="`
              position: absolute;
              bottom: 35px;
              pointer-events: none;
              height: ${getHeight(set.value) / 2.5}%;
              left: ${i == 0 ? 0 : -7}px;
              z-index: 2;
              width: 100%;
             
            `"
                    class="white--text text-center remove-block"
                  >
                    <div
                      style="
                        background-color: rgba(0, 0, 0, 0.2);
                        display: inline-block;
                      "
                      class="pa-2 rounded"
                    >
                      <v-icon
                        @click="copyBlock(block, i)"
                        style="pointer-events: auto"
                      >
                        mdi-content-copy
                      </v-icon>
                      <v-icon
                        @click="removeBlock(i)"
                        style="pointer-events: auto"
                      >
                        mdi-close-circle
                      </v-icon>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-col>
            <v-col
              cols="auto"
              :style="`
                width: 10px;
                height: 70%;
                background-color: rgba(100, 100, 100, ${
                  blockBeingDragged ? '0.2' : '0.0'
                });
              `"
              class="mx-1 rounded-t-xl"
              @dragover="onDragOver"
              @drop="onDrop($event, i + 1, true)"
            >
            </v-col>
          </v-row>
        </div>
      </draggable>
    </div>

    <!-- Display Total Duration -->
    <div v-if="totalDuration" class="font-weight-bold">
      Duration: {{ formatDuration(totalDuration) }}
    </div>

    <!-- Block Edit -->
    <div class="mt-10">
      <div v-for="(block, i) of addedBlocks.slice().reverse()" :key="i">
        <div style="display: inline-block" class="list-remove-block">
          <v-icon
            color="red"
            class="mr-2"
            @click="removeBlock(addedBlocks.length - 1 - i)"
            >mdi-close-circle</v-icon
          >{{ addedBlocks.length - i }}). {{ block.type }}
          <a
            class="blue--text ml-1"
            style="text-decoration: underline"
            @click="copyBlock(block, addedBlocks.length - 1)"
            >copy</a
          >
        </div>
        <v-row no-gutters class="my-3">
          <v-col v-if="block.numSets > 1" cols="12" class="mt-2">
            <v-select
              dense
              style="width: 10%"
              v-model="block.numSets"
              :items="setsList"
              light
              label="Sets"
              color="black"
            />
          </v-col>
          <v-col
            cols="auto"
            v-for="(set, i) of block.sets"
            :key="i"
            class="mr-2"
          >
            <div style="display: inline-block">
              <div class="mb-3 font-weight-bold">
                {{ set.type }}
              </div>
              <v-text-field
                v-model="set.duration"
                light
                dense
                label="Duration"
                style="display: inline-block"
                class="mr-2"
              />
            </div>
            <v-text-field
              v-model="set.value"
              light
              dense
              label="Target Watts"
              style="display: inline-block"
              @input="updateZoneTitle($event, block)"
            />
          </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import _ from "lodash";
import { getColor } from "~/tools/zone_color";
import { formatDuration } from "../../../tools/format_moment";
import moment from "moment";

export default {
  components: {
    draggable,
  },
  props: {
    date: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      blocks: [],
      addedBlocks: [],
      isPowerZones: true,
      blockBeingDragged: null,
      totalDuration: 0,
      zones: [],
      setsList: [2, 3, 4, 5, 6, 7, 8, 9, 10],
      rules: {
        min: (v) => v > 0 || "1 or more",
      },
    };
  },
  computed: {
    me() {
      return this.$store.state.auth.me;
    },
  },
  watch: {
    addedBlocks: {
      handler(val) {
        let duration = 0;
        for (const block of val) {
          for (let i = 0; i < block.numSets; i++) {
            for (const set of block.sets) {
              duration += moment.duration(set.duration).asSeconds();
            }
          }
        }
        this.totalDuration = duration;
      },
      deep: true,
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    getColor: getColor,
    formatDuration: formatDuration,
    onDragOver(ev) {
      ev.preventDefault();
    },
    copyBlock(block, i) {
      const copy = JSON.parse(JSON.stringify(block));
      this.addedBlocks.splice(i + 1, 0, copy);
    },
    async onDrop(ev, index, canAdd) {
      ev.preventDefault();
      var data = ev.dataTransfer.getData("block");
      if (data && (this.addedBlocks.length == 0 || canAdd)) {
        const block = JSON.parse(data);
        this.addedBlocks.splice(index, 0, block);
      }
    },
    updateZoneTitle(event, block) {
      if (block.type != "Intervals") {
        try {
          for (const zone of this.zones) {
            if (event >= zone.low && event <= zone.high) {
              block.type = zone.title;
            }
          }
        } catch (e) {}
      }
    },
    removeBlock(index) {
      this.addedBlocks.splice(index, 1);
    },
    getWidth(duration) {
      return (moment.duration(duration).asSeconds() / 1800) * 300;
    },
    getHeight(value) {
      const height = (value / this.getMaxValue()) * 70;
      return height < 20 ? height + 10 : height;
    },
    getColorOfSet(value) {
      for (const zone of this.zones) {
        if (zone.high == "MAX") {
          return this.getColor(zone.title);
        } else if (value >= zone.low && value <= zone.high) {
          return this.getColor(zone.title);
        }
      }
    },
    dragStart(ev, block) {
      this.blockBeingDragged = block;
      ev.dataTransfer.setData("block", JSON.stringify(block));
    },
    getMaxValue() {
      let max = 0;
      for (const block of this.addedBlocks) {
        for (const set of block.sets) {
          if (set.value > max) {
            max = set.value;
          }
        }
      }
      return this.addedBlocks.length == 1 || max < 200 ? 200 : max;
    },
    getZoneRange(zone) {
      const found = _.find(this.zones, (item) => {
        return item.title == zone;
      });
      if (found) {
        return found.low + " - " + found.high;
      }
      return "";
    },
    getZoneDefault(zone) {
      const found = _.find(this.zones, (item) => {
        return item.title == zone;
      });
      return found.title == "Recovery"
        ? found?.high - 20
        : Math.round(found?.low + found?.low * 0.03);
    },
    init() {
      this.zones = this.me.power_zones;
      this.blocks = [
        {
          type: "Recovery",

          color: this.getColor("Recovery"),
          numSets: 1,
          sets: [
            { value: this.getZoneDefault("Recovery"), duration: "00:10:00" },
          ],
        },
        {
          type: "Endurance",
          color: this.getColor("Endurance"),
          numSets: 1,
          sets: [
            { value: this.getZoneDefault("Endurance"), duration: "00:10:00" },
          ],
        },
        {
          type: "Tempo",
          color: this.getColor("Tempo"),
          numSets: 1,
          sets: [{ value: this.getZoneDefault("Tempo"), duration: "00:10:00" }],
        },
        {
          type: "Threshold",
          color: this.getColor("Threshold"),
          numSets: 1,
          sets: [
            { value: this.getZoneDefault("Threshold"), duration: "00:10:00" },
          ],
        },
        {
          type: "VO2 Max",
          color: this.getColor("VO2 Max"),
          numSets: 1,
          sets: [
            { value: this.getZoneDefault("VO2 Max"), duration: "00:20:00" },
          ],
        },
        {
          type: "Intervals",
          color: "brown",
          numSets: 2,
          sets: [
            {
              type: "hard",
              value: this.getZoneDefault("VO2 Max"),
              duration: "00:04:00",
            },
            {
              type: "easy",
              value: this.getZoneDefault("Recovery"),
              duration: "00:02:00",
            },
          ],
        },
      ];
      if (this.isPowerZones) {
        this.blocks.splice(5, 0, {
          type: "Anaerobic",
          color: this.getColor("Anaerobic"),
          numSets: 1,
          sets: [
            { value: this.getZoneDefault("Anaerobic"), duration: "00:20:00" },
          ],
        });
      }
    },
  },
};
</script>

<style>
.list-remove-block:hover .set {
  opacity: 0.2;
}
.set {
  opacity: 1;
}
.remove-block {
  display: none;
}
.set:hover .remove-block {
  display: block;
}
</style>