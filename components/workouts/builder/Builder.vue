<template>
  <div class="mt-2">
    <v-row>
      <v-col cols="auto" v-if="workout" @click="openDeleteDialog = true">
        <v-btn color="red" class="white--text"> Delete </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn :disabled="isDisabled()" @click="save()"> Save </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="8">
        <v-text-field
          v-model="workoutName"
          class="black--text"
          label="Name"
          @keyup.enter="save"
        />
        <v-text-field
          v-model="description"
          class="black--text"
          label="Description"
          @keyup.enter="save"
        />
        <WorkoutsActivityDropdown
          :currentActivity="activity"
          :key="activity"
          @onActivityChange="(e) => (activity = e)"
        />
      </v-col>
    </v-row>
    <div>
      <v-row align="center">
        <v-col v-if="activity === 'ride'" cols="auto" style="width: 20%">
          <v-select
            v-model="isPower"
            :items="dataTypes"
            light
            label="Build Type"
          />
        </v-col>
        <v-col>
          <v-switch v-model="isPercentage" :label="`%`" />
        </v-col>
        <v-col
          cols="auto"
          v-if="thresholdValue && addedBlocks.length > 0 && isPower"
        >
          <v-menu open-on-hover bottom offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on"> Export </v-btn>
            </template>

            <v-list>
              <v-list-item>
                <a
                  :href="`data:attachment/text,${encodeURI(
                    zwoFile(addedBlocks, thresholdValue, me, workout)
                  )}`"
                  :download="`${
                    workout
                      ? workout.name
                      : 'my_spin_cycle_' + new Date().toString()
                  } (via ${$app_config.title}).zwo`"
                  style="text-decoration: none; color: black"
                >
                  Zwift
                </a>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>

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
          {{ isPercentage && block.type != "Intervals" ? "%" : "" }}
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
                    class="elevation-3 rounded-t-lg set text-center"
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
                          color="white"
                          style="pointer-events: auto"
                        >
                          mdi-content-copy
                        </v-icon>
                        <v-icon
                          @click="removeBlock(i)"
                          color="white"
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
      <v-row class="mt-4" align="center">
        <v-col cols="auto">
          <div v-if="totalDuration" class="font-weight-bold">
            Duration: {{ formatDuration(totalDuration) }}
          </div>
        </v-col>
        <v-col>
          <div v-if="stress" class="font-weight-bold">
            {{ isPower ? "Effort: " : "HR Effort: " }} {{ stress }}
          </div>
        </v-col>
      </v-row>

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
                :value="formatValue(set.value)"
                light
                dense
                :label="`Target ${isPower ? 'Watts' : 'HR'} ${
                  isPercentage ? '%' : ''
                }`"
                style="display: inline-block"
                @input="updateZoneTitle($event, block, set)"
              />
            </v-col>
          </v-row>
        </div>
      </div>
    </div>
    <v-dialog v-model="saveDialog" scrollable light width="600">
      <v-card>
        <WorkoutsBuilderSave
          :isPower="isPower"
          :workout="workout"
          :blocks="addedBlocks"
          :date="date"
          @onSuccess="onSuccessfulSave"
        />
      </v-card>
    </v-dialog>
    <v-dialog v-model="openDeleteDialog" width="400" light>
      <DialogsDeleteWorkout :workout="workout" @onDelete="onDelete" />
    </v-dialog>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import _ from "lodash";
import { getColor } from "~/tools/zone_color";
import { formatDuration } from "~/tools/format_moment";
import { findHRTSS, findTSS } from "~/tools/stress";
import { zwoFile } from "~/tools/export";
import moment from "moment";

export default {
  components: {
    draggable,
  },
  props: {
    workout: {
      type: Object,
      required: false,
      default: null,
    },
    date: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      blocks: [],
      addedBlocks: [],
      isPower: true,
      activity: "ride",
      workoutName: "",
      saving: false,
      description: "",
      isPercentage: false,
      stress: 0,
      thresholdValue: null,
      openDeleteDialog: false,
      blockBeingDragged: null,
      dataTypes: [
        {
          text: "Power",
          value: true,
        },
        {
          text: "Heart Rate",
          value: false,
        },
      ],
      saveDialog: false,
      totalDuration: 0,
      zones: [],
      setsList: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      rules: {
        min: (v) => v > 0 || "1 or more",
      },
    };
  },
  computed: {
    me() {
      return this.$store.state.auth.me;
    },
    authentication() {
      return this.$store.state.auth.access_token;
    },
  },
  watch: {
    activity() {
      this.zones = this.isPower
        ? this.me.power_zones['ride']
        : this.me.hr_zones[this.activity];
      if (this.activity === "ride") {
        this.dataTypes = [
          {
            text: "Power",
            value: true,
          },
          {
            text: "Heart Rate",
            value: false,
          },
        ];
      } else {
        this.thresholdValue = this.me.max_hr;
        this.isPower = false;
        this.dataTypes = [
          {
            text: "Heart Rate",
            value: false,
          },
        ];
      }
    },
    isPower() {
      if (this.activity === "run") {
        this.thresholdValue = this.me.max_hr;
      } else {
        this.thresholdValue = this.isPower
          ? this.me.threshold_power
          : this.me.threshold_hr;
      }
      this.init();
      this.getStress();
    },
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
        this.getStress();
      },
      deep: true,
    },
  },
  mounted() {
    this.workoutName = "New Workout " + this.date.format("MMMM D, YYYY");
    if (this.workout) {
      this.isPower = this.workout.effort ? true : false;
      this.activity = this.workout.activity
      if (this.activity === 'run') {
        this.isPower = false
      }
      this.addedBlocks = JSON.parse(JSON.stringify(this.workout.planned));
      this.workoutName = this.workout.name;
      this.description = this.workout.description;
    }
    this.thresholdValue = this.isPower
      ? this.me.threshold_power
      : this.me.threshold_hr;
    this.init();
  },
  methods: {
    getColor: getColor,
    formatDuration: formatDuration,
    findHRTSS: findHRTSS,
    findTSS: findTSS,
    zwoFile: zwoFile,
    onDelete(e) {
      this.openDeleteDialog = false;
      this.$emit("onClose");
    },
    isDisabled() {
      return this.activity !== "run" && this.addedBlocks == 0;
    },
    async save() {
      this.saving = true;
      try {
        const headers = {
          headers: {
            Authorization: "Bearer " + this.$store.state.auth.access_token,
          },
        };

        if (!this.workout) {
          const response = await this.$axios.post(
            this.$axios.defaults.baseURL + `/workouts/create/planned`,
            {
              name: this.workoutName,
              description: this.description,
              isPower: this.isPower,
              activity: this.activity,
              planned: this.addedBlocks,
              startedAt: this.date.set({ hour: 12 }).toISOString(),
            },
            headers
          );
          const date = moment(this.date);
          const workout = response.data;
          if (workout && date) {
            this.$store.commit("calendar/addWorkout", { workout, date });
            this.$emit("onSuccess");
          }
        } else {
          // Save Workout
          const response = await this.$axios.put(
            this.$axios.defaults.baseURL +
              `/workouts/update/planned/${this.workout.id}`,
            {
              name: this.workoutName,
              description: this.description,
              isPower: this.isPower,
              activity: this.activity,
              planned: this.addedBlocks,
            },
            headers
          );
          if (response?.data) {
            const workout = response.data;
            this.$store.commit("calendar/updateWorkout", { workout });
            this.$emit("onSuccess");
          }
        }
        this.$store.dispatch("snackbar/showSnack", {
          text: "Workout successfully saved!",
          color: "green",
          timeout: 3500,
        });
      } catch (e) {
        console.log(e);
      }
      this.saving = false;
    },
    formatValue(value) {
      value = JSON.parse(JSON.stringify(value));
      if (this.isPercentage) {
        return Math.round((value / this.thresholdValue) * 100);
      }
      return value;
    },
    getStress() {
      const me = this.me;
      const values = [];
      for (const block of this.addedBlocks) {
        for (let i = 0; i < block.numSets; i++) {
          for (const set of block.sets) {
            const duration = moment.duration(set.duration).asSeconds();
            for (let sec = 0; sec < duration; sec++) {
              values.push(parseInt(set.value.toString()));
            }
          }
        }
      }
      if (this.isPower) {
        const duration = this.totalDuration;
        this.stress = this.findTSS({ me, values, duration });
      } else {
        const activity = this.activity
        this.stress = this.findHRTSS({ me, values, activity });
      }
    },
    onSuccessfulSave() {
      this.saveDialog = false;
      this.$emit("onSuccess");
    },
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
    updateZoneTitle(event, block, set) {
      if (this.isPercentage) {
        set.value = Math.round((parseInt(event) / 100) * this.thresholdValue);
      } else {
        set.value = parseInt(event);
      }
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
      duration = moment.duration(duration).asSeconds();
      const max = 800;
      const value = (duration * 100) / 900;
      if (value < 8) {
        return 8;
      } else if (value > max) {
        return max;
      }
      return value;
    },
    getHeight(value) {
      const height = (value / this.getMaxHeightValue()) * 80;
      return height;
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
    getMaxHeightValue() {
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
        if (this.isPercentage) {
          return (
            Math.round((found.low / this.thresholdValue) * 100) +
            " - " +
            (found.high == "MAX"
              ? "MAX"
              : Math.round((found.high / this.thresholdValue) * 100))
          );
        }
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
        : Math.round(found?.low);
    },
    init() {
      this.zones = this.isPower
        ? this.me.power_zones['ride']
        : this.me.hr_zones[this.activity];
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
      if (this.isPower) {
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