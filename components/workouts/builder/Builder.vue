<template>
  <div>
    <draggable
      v-model="blocks"
      :options="{ group: { name: 'blocks', pull: 'clone', put: false }, sort: false }"
      @change="addBlock"
      :clone="cloneItem"
      draggable=".cell"
      style="display: inline-block"
    >
      <div
        v-for="block in blocks"
        :key="uuid(block)"
        class="cell"
      >
        <WorkoutsBuilderBlock :block="block" style="cursor: grab" />
      </div>
    </draggable>

    <div
      class="mt-4 rounded"
      style="
        height: 150px;
        background-color: rgba(100, 100, 100, 0.2);
        overflow-x: scroll;
        overflow-y: hidden;
        white-space: nowrap;
      "
    >
      <draggable
        v-model="addedBlocks"
        :options="{ group: 'blocks' }"
        style="height: 150px; display: inline-block"
        ghost-class="ghost"
        @change="orderBlocks"
      >
        <div
          v-for="(block, i) in addedBlocks"
          :key="i"
          class="added-cell mr-1"
          style="display: inline-block"
        >
          <WorkoutsBuilderBlock
            :block="block"
            :show-border="false"
            :is-added="true"
            :height="150"
            :key="i"
            style="cursor: grab"
          />
        </div>
      </draggable>
    </div>

    <div class="mt-4">
      <v-row
        no-gutters
        v-for="(block, i) in addedBlocks"
        :key="i"
        align="center"
        class="mt-10"
      >
        <v-icon color="red" class="mr-1" @click="removeBlock(i)">
          mdi-close-circle
        </v-icon>
        <v-col cols="auto"> {{ i + 1 }}). </v-col>
        <v-col cols="auto" class="ml-1 mr-5">
          {{ block.type }}
        </v-col>
        <v-col
          v-if="block.numSets > 1"
          cols="auto"
          class="mr-2"
          style="width: 80px"
        >
          <v-select
            light
            color="black"
            label="sets"
            dense
            :items="[2, 3, 4, 5, 6, 7, 8, 9, 10]"
            v-model="block.numSets"
          />
        </v-col>
        <v-col cols="auto">
          <v-row
            v-for="(set, i) of block.sets"
            :key="i"
            no-gutters
            align="center"
            class="mt-1"
          >
            <v-col cols="auto" class="mr-2">
              {{ set.type }}
            </v-col>

            <v-col cols="auto" class="ml-1" style="height: 40px; width: 80px">
              <v-text-field
                :value="set.duration"
                dense
                label="duration"
                light
                @change="
                  (e) => {
                    set.duration = e;
                  }
                "
              />
            </v-col>
            <v-col cols="auto" class="ml-1" style="height: 40px; width: 80px">
              <v-text-field
                v-model.lazy="set.target"
                label="target"
                dense
                type="number"
                light
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </div>
    <div>
      <v-row justify="end">
        <v-col cols="auto">
          <v-btn @click="createWorkout"> Create </v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import _ from "lodash";
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
      addedBlocks: [],
      rules: {
        min: (v) => v > 0 || "1 or more",
      },
      blocks: [
        {
          type: "warmup",
          numSets: 1,
          sets: [{ target: 100, duration: "00:20:00" }],
        },
        {
          type: "intervals",
          numSets: 3,
          sets: [
            { type: "easy", target: 100, duration: "00:02:00" },
            { type: "hard", target: 174, duration: "00:04:00" },
          ],
        },
        {
          type: "steady",
          numSets: 1,
          sets: [{ target: 150, duration: "00:20:00" }],
        },
      ],
    };
  },
  methods: {
    async createWorkout() {
      const headers = {
        headers: {
          Authorization: "Bearer " + this.$store.state.auth.access_token,
        },
      };

      //Create a planned workout
      await this.$axios.post(
        this.$axios.defaults.baseURL + `/workouts/create/planned`,
        { date: this.date, data: this.addedBlocks },
        headers
      );
    },
    removeBlock(index) {
      this.addedBlocks.splice(index, 1);
    },
    cloneItem(item) {
      let cloneMe = JSON.parse(JSON.stringify(item));
      this.$delete(cloneMe, "uid");
      return cloneMe;
    },
    orderBlocks(e) {
      // if (e.added) {
      //   this.addedBlocks.splice(e.added.newIndex, , JSON.parse(JSON.stringify(e.added.element)))
      // }
      // if (e.added) {
      //   const index = _.findIndex(
      //     this.addedBlocks,
      //     (item) => item.uid == e.added.element.uid
      //   );
      //   if (index != -1) {
      //     this.addedBlocks.splice(
      //       index,
      //       1,
      //       JSON.parse(JSON.stringify(e.added.element))
      //     );
      //   }
      // }
    },
    uuid(e) {
      if (e.uid) return e.uid;

      const key = Math.random().toString(16).slice(2);

      this.$set(e, "uid", key);

      return e.uid;
    },
    addBlock(e) {
      // if (e.removed) {
      //   this.blocks.splice(e.removed.oldIndex, 0, e.removed.element);
      // }
    },
  },
};
</script>