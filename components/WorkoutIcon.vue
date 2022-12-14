<template>
  <span :class="`mdi ${activityReference[activity].icon}`" :style="`font-size: ${size}`"></span>
</template>


<script>
import { activityReference } from '~/tools/activities'
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
  data () {
    return {
      activityReference
    }
  }
};
</script>