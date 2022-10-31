<template>
  <div style="padding-top: 30px; padding-bottom: 100px">
    <v-row justify="center">
      <v-col cols="10" sm="8">
        <v-switch
            v-model="autoSync"
            label="Auto Sync"
            class="ml-4" />
        <v-list two-line subheader>
          <v-subheader class="text-h5 pb-10 pt-3">Strava Activities</v-subheader>
          <div v-if="loading" class="text-center pa-10">
            <v-progress-circular indeterminate />
          </div>
          <v-list-item v-else v-for="activity in activities" :key="activity.id">
            <div class="mr-3">
              <WorkoutIcon :activity="activity.type.toLowerCase()" :size="'2.0em'" />
            </div>
            <v-list-item-content>
              <v-list-item-title style="word-break: break-word">{{
                activity.name 
              }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ formatDate(activity.start_date) }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-btn
              :class="(activity.workoutId ? 'green elevation-0' : '') + `ml-5 ${activity.workoutId ? 'white--text' : ''}`"
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
          <v-col cols="auto" @click="page !== 1 ? page -= 1: null">
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
  </div>
</template>

<script>
import { formatDate } from "~/tools/format_moment.js";
import WorkoutIcon from '../../components/WorkoutIcon.vue';
export default {
    name: "StravaConnect",
    head: {
        title: "Strava",
    },
    data() {
        return {
            code: "",
            loading: true,
            autoSync: false,
            page: 1,
            per_page: 30,
            activities: [],
        };
    },
    computed: {
        me() {
            return this.$store.state.auth.me;
        },
    },
    async mounted() {
        this.autoSync = this.me.strava_enable_auto_sync
        this.code = this.$route.query.code;
        if (!this.code && !this.$route.query.connected) {
            this.$store.dispatch("snackbar/showSnack", {
                text: "Strava authentication failed!",
                color: "red",
                timeout: 3500,
            });
            this.$router.push("/connect");
        }
        else if (this.$route.query.connected) {
            await this.getStravaActivities();
        }
        else {
            await this.getAccessToken();
        }
        this.loading = false;
    },
    watch: {
        autoSync () {
          const payload = { strava_enable_auto_sync: this.autoSync };
          this.$store.dispatch("auth/updateUser", { payload });
        },
        page() {
            this.getStravaActivities();
        },
    },
    methods: {
      viewWorkout (id) {
        this.$router.push(`/workout/${id}`)
      },
        async importActivity(activity) {
            activity.importing = true;
            this.$forceUpdate();
            try {
                const response = await this.$axios.post(this.$axios.defaults.baseURL +
                    `/strava/activity/${activity.id}/import`, null, {
                    headers: {
                        Authorization: "Bearer " + this.$store.state.auth.access_token,
                    },
                });
                if (response && response.data) {
                    activity.workoutId = response.data.id;
                    await this.$store.dispatch("auth/getMe");
                }
            }
            catch (e) {
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
                    const stravaActivities = await this.$axios.get(this.$axios.defaults.baseURL +
                        `/strava/activities?page=${this.page}&per_page=${this.per_page}`, {
                        headers: {
                            Authorization: "Bearer " + this.$store.state.auth.access_token,
                        },
                    });
                    this.activities = stravaActivities.data;
                    for (let activity of this.activities) {
                        activity.importing = false;
                    }
                }
                catch (e) {
                    console.log(e);
                }
                this.loading = false;
            }
        },
        async getAccessToken() {
            try {
                const { data } = await this.$axios.post(`https://www.strava.com/oauth/token?client_id=${process.env.stravaClientId}&client_secret=${process.env.stravaClientSecret}&code=${this.code}&grant_type=authorization_code`);
                if (data && data.access_token) {
                    const payload = { strava_token: data.access_token, strava_owner_id: data.athlete.id };
                    await this.$store.dispatch("auth/updateUser", { payload });
                    await this.getStravaActivities();
                }
            }
            catch (e) { }
        },
    },
    components: { WorkoutIcon }
};
</script>