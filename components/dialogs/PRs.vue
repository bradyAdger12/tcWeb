<template>
  <v-card v-if="prs">
    <v-card-title> You have new PRs! </v-card-title>
    <v-card-text>
      <div class="mb-10">
        <div v-for="(pr, i) of prs" :key="i" class="mb-3">
          <div v-if="!pr.time">
            <span class="font-weight-light">{{ pr.name }}</span>
            <v-icon size="15">{{
              pr.type == "watts" ? "mdi-lightning-bolt" : "mdi-heart"
            }}</v-icon>
            <div class="text-h5">
              {{ pr.value }} {{ pr.type == "watts" ? "watts" : "bpm" }}
            </div>
          </div>
        </div>
      </div>
      <div v-for="(pr, i) of prs" :key="i" class="mb-5">
        <div v-if="pr.time">
          <span class="font-weight-light">{{ pr.time }}</span>
          <v-icon size="15">{{
            pr.type == "watts" ? "mdi-lightning-bolt" : "mdi-heart"
          }}</v-icon>
          <div class="text-h5">
            {{ pr.value }} {{ pr.type == "watts" ? "watts" : "bpm" }}
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    prs: {
      type: Array,
      required: true,
    },
  },
  computed: {
    authentication() {
      return this.$store.state.auth.access_token;
    },
  },
};
</script>