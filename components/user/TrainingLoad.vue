<template>
  <div>
    <div v-if="!loading">
      <div v-if="trainingLoad" class="mb-10">
        <v-row>
          <v-col cols="auto">
            <v-avatar class="blue white--text" size="150">
              <div>
                <span class="training-load-value">{{
                  trainingLoad.fitness
                }}</span>
                <p>Fitness</p>
              </div>
            </v-avatar>
          </v-col>
          <v-col cols="auto">
            <v-avatar class="orange white--text" size="150">
              <div>
                <span class="training-load-value">{{
                  trainingLoad.fatigue
                }}</span>
                <p>Fatigue</p>
              </div>
            </v-avatar>
          </v-col>
          <v-col cols="auto">
            <v-avatar
              :class="`${trainingLoad.form < 0 ? 'red' : 'green'} white--text`"
              size="150"
            >
              <div>
                <span class="training-load-value">{{ trainingLoad.form }}</span>
                <p>Form</p>
              </div>
            </v-avatar>
          </v-col>
        </v-row>
      </div>
    </div>
    <div v-else style="width: 20%">
      <v-progress-linear indeterminate size="64" />
    </div>
  </div>
</template>


<script>
import moment from "moment";
export default {
  props: {
    date: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      trainingLoad: null,
      loading: true,
    };
  },
  mounted() {
    this.getTrainingLoad();
  },
  methods: {
    async getTrainingLoad() {
      this.loading = true;
      try {
        const response = await this.$axios.get(
          this.$axios.defaults.baseURL +
            `/users/me/training_load?date=${this.date.toISOString()}`,
          {
            headers: {
              Authorization: "Bearer " + this.$store.state.auth.access_token,
            },
          }
        );
        this.trainingLoad = response.data;
      } catch (e) {}
      this.loading = false
    },
  },
};
</script>