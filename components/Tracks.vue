<template>
  <div>
    <div v-if="!loading && tracks.length == 0">
      No tracks uploaded yet. Connect with our compatible apps
      <NuxtLink to="/connect" class="white--text">
        <span>here</span>
      </NuxtLink>
      to upload tracks.
    </div>
    <div v-else>
      <v-list two-line>
        <div v-if="loading" class="text-center pa-10">
          <v-progress-circular indeterminate />
        </div>
        <v-list-item v-else v-for="track in tracks" :key="track.id">
          <v-list-item-content>
            <v-list-item-title style="word-break: break-word">{{
              track.name
            }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ formatDate(track.started_at) }}
            </v-list-item-subtitle>
            <!-- <div class="mt-3">
              <div v-if="track.hr_effort">HRS: {{ track.hr_effort }}</div>
            </div> -->
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script>
import moment from "moment";
export default {
  asyncData() {},
  computed: {
    me() {
      return this.$store.state.auth.me;
    },
  },
  data() {
    return {
      loading: true,
      tracks: [],
    };
  },
  mounted() {
    this.getTracks();
  },
  methods: {
    formatDate(date) {
      return moment(date).format("MMMM Do YYYY, h:mm:ss a");
    },
    async getTracks() {
      try {
        const response = await this.$axios.get(
          this.$axios.defaults.baseURL + "/recordings/me",
          {
            headers: {
              Authorization: "Bearer " + this.$store.state.auth.access_token,
            },
          }
        );
        this.tracks = response.data;
      } catch (e) {}
      this.loading = false;
    },
  },
};
</script>