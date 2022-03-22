<template>
  <div>
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
              :class="(activity.trackId ? 'green elevation-0' : '') + ' ml-5'"
              @click="
                activity.trackId
                  ? viewTrack(activity.trackId)
                  : importActivity(activity)
              "
            >
              {{ activity.trackId ? "View" : "Import" }}

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
      </v-col>
    </v-row>
    <v-dialog v-model="showTrack" width="800">
      <v-card v-if="trackId">
        <TracksDetail :track-id="trackId" :key="trackId" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import moment from "moment";
import { formatDate } from '~/tools/format_moment.js'
export default {
  name: "StravaConnect",
  head: {
    title: "Strava",
  },
  data() {
    return {
      code: "",
      loading: true,
      showTrack: false,
      trackId: null,
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
  methods: {
    viewTrack(id) {
      this.showTrack = true
      this.trackId = id
    },
    async importActivity(activity) {
      activity.importing = true;
      this.$forceUpdate();
      const response = await this.$axios.post(
        this.$axios.defaults.baseURL + `/strava/activity/${activity.id}/import`,
        null,
        {
          headers: {
            Authorization: "Bearer " + this.$store.state.auth.access_token,
          },
        }
      );
      activity.importing = false;
      if (response && response.data) {
        activity.trackId = response.data.id
      }
      this.$forceUpdate();
    },
    formatDate: formatDate,
    async getStravaActivities() {
      if (this.me.strava_token) {
        try {
          const stravaActivities = await this.$axios.get(
            this.$axios.defaults.baseURL + "/strava/activities",
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