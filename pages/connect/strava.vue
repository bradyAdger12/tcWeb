<template>
  <div style="padding-top: 30px; padding-bottom: 100px">
    <v-row justify="center">
      <v-col cols="10" sm="8">
        <v-list two-line subheader>
          <v-subheader class="text-h5 py-10">Strava Activities</v-subheader>
          <div v-if="loading" class="text-center pa-10">
            <v-progress-circular indeterminate />
          </div>
          <v-list-item v-else v-for="activity in activities" :key="activity.id">
            <v-list-item-content>
              <v-list-item-title style="word-break: break-word">{{
                activity.name
              }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ formatDate(activity.start_date) }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-btn
              :class="(activity.workoutId ? 'green elevation-0' : '') + ' ml-5'"
              @click="
                activity.workoutId
                  ? viewWorkout(activity.workoutId)
                  : importActivity(activity)
              "
            >
              {{ activity.workoutId ? "View" : "Import" }}

              <v-progress-circular
                v-if="activity.importing"
                indeterminate
                size="15"
                width="2"
                class="ml-2"
              />
            </v-btn>
          </v-list-item>
        </v-list>
        <v-row justify="center" align="center" class="mt-4">
          <v-col cols="auto" @click="page <= 1 ? (page -= 1) : null">
            <v-btn> Prev </v-btn>
          </v-col>
          <v-col cols="auto">
            {{ page }}
          </v-col>
          <v-col cols="auto" @click="page += 1">
            <v-btn> Next </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-dialog v-model="showPrs" width="800" :key="prs.toString()" light>
      <DialogsPRs v-if="prs" :prs="prs" />
    </v-dialog>
    <v-dialog v-model="showWorkout" width="800">
      <v-card v-if="workoutId">
        <WorkoutsDetail
          :workout-id="workoutId"
          :key="workoutId"
          @onDelete="onDelete"
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { formatDate } from "~/tools/format_moment.js";
export default {
  name: "StravaConnect",
  head: {
    title: "Strava",
  },
  data() {
    return {
      code: "",
      loading: true,
      showWorkout: false,
      page: 1,
      showPrs: false,
      prs: [],
      per_page: 30,
      workoutId: null,
      activities: [],
    };
  },
  computed: {
    me() {
      return this.$store.state.auth.me;
    },
  },
  async mounted() {
    this.code = this.$route.query.code;
    if (!this.code && !this.$route.query.connected) {
      this.$store.dispatch("snackbar/showSnack", {
        text: "Strava authentication failed!",
        color: "red",
        timeout: 3500,
      });
      this.$router.push("/connect");
    } else if (this.$route.query.connected) {
      await this.getStravaActivities();
    } else {
      await this.getAccessToken();
    }
    this.loading = false;
  },
  watch: {
    page() {
      this.getStravaActivities();
    },
  },
  methods: {
    onDelete() {
      const found = _.find(
        this.activities,
        (item) => item.workoutId == this.workoutId
      );
      if (found) {
        found.workoutId = null;
        this.showWorkout = false;
      }
    },
    viewWorkout(id) {
      this.showWorkout = true;
      this.workoutId = id;
    },
    async importActivity(activity) {
      activity.importing = true;
      this.$forceUpdate();
      try {
        const response = await this.$axios.post(
          this.$axios.defaults.baseURL +
            `/strava/activity/${activity.id}/import`,
          null,
          {
            headers: {
              Authorization: "Bearer " + this.$store.state.auth.access_token,
            },
          }
        );
        if (response && response.data) {
          activity.workoutId = response.data.id;
          console.log(response.data)
          this.prs = response.data.prs
          console.log(this.prs)
          if (this.prs && this.prs.length > 0) {
            this.showPrs = true;
          }
          await this.$store.dispatch("auth/getMe");
        }
      } catch (e) {
        console.log(e);
      }
      activity.importing = false;
      this.$forceUpdate();
    },
    formatDate: formatDate,
    async getStravaActivities() {
      this.loading = true;
      if (this.me.strava_token) {
        try {
          const stravaActivities = await this.$axios.get(
            this.$axios.defaults.baseURL +
              `/strava/activities?page=${this.page}&per_page=${this.per_page}`,
            {
              headers: {
                Authorization: "Bearer " + this.$store.state.auth.access_token,
              },
            }
          );
          this.activities = stravaActivities.data;
          for (let activity of this.activities) {
            activity.importing = false;
          }
        } catch (e) {
          console.log(e);
        }
        this.loading = false;
      }
    },
    async getAccessToken() {
      try {
        const { data } = await this.$axios.post(
          `https://www.strava.com/oauth/token?client_id=${process.env.STRAVA_CLIENT_ID}&client_secret=${process.env.STRAVA_CLIENT_SECRET}&code=${this.code}&grant_type=authorization_code`
        );
        if (data && data.access_token) {
          const payload = { strava_token: data.access_token };
          await this.$store.dispatch("auth/updateUser", { payload });
          await this.getStravaActivities();
        }
      } catch (e) {}
    },
  },
};
</script>