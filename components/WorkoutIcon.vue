<template>
  <span :class="`mdi mdi-${getActivity()}`" :style="`font-size: ${size}`"></span>
</template>


<script>
export default {
  props: {
    size: {
      type: String,
      required: false,
      default: '3em'
    },
    activity: {
      type: String,
      required: true,
    },
  },
  methods: {
    getActivity() {
      if (this.activity.includes("ride")) {
        return "bike";
      } else if (this.activity === "run") {
        return "run";
      }
      return "dumbbell";
    },
  },
};
</script>