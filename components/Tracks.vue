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
          </v-list-item-content>
          <v-btn class="red rounded white--text" @click="deleteTrack(track)">
            Delete
            <v-progress-circular
              v-if="track.deleting"
              indeterminate
              width="2"
              size="15"
              class="ml-2"
            />
          </v-btn>
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
  watch: {
    "$store.state.tracks.tracks": function () {
      this.tracks = this.$store.state.tracks.tracks;
    },
  },
  methods: {
    formatDate(date) {
      return moment(date).format("MMMM Do YYYY, h:mm:ss a");
    },
    async deleteTrack(track) {
      track.deleting = true;
      this.$forceUpdate();
      const token = this.$store.state.auth.access_token;
      const id = track.id;
      try {
        await this.$store.dispatch("tracks/deleteTrack", { id, token });
      } catch (e) {}
      track.deleting = false;
      this.$forceUpdate();
    },
    async getTracks() {
      const token = this.$store.state.auth.access_token;
      const me = this.me;
      try {
        await this.$store.dispatch("tracks/getTracks", { me, token });
      } catch (e) {}
      this.loading = false;
    },
  },
};
</script>