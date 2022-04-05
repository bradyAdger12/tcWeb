<template>
  <div style="display: inline-block">
    <v-icon
      v-if="activity == 'ride' || activity == 'virtualride'"
      :color="color"
      :size="size"
    >
      mdi-bike
    </v-icon>
    <v-icon v-if="activity == 'run'" :color="color" :size="size">
      mdi-run
    </v-icon>
  </div>
</template>


<script>
export default {
  props: {
    color: {
      type: String,
      required: false,
      default: "grey",
    },
    size: {
      type: Number,
      required: false,
      default: 17,
    },
    activity: {
      type: String,
      required: true,
    },
  },
};
</script>