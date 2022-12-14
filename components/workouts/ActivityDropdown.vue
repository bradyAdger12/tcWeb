<template>
  <v-select
    :items="activities"
    light
    label="Activity"
    :value="activity"
    :append-outer-icon="activityReference[currentActivity].icon"
    @change="onActivityChange"
  />
</template>


<script>
import { activityReference } from '~/tools/activities'
export default {
  props: {
    currentActivity: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      activity: 'ride',
      activityReference: activityReference,
      activities: Object.keys(activityReference)
    }
  },
  mounted () {
    this.activity = this.currentActivity
  } ,
  methods: {
    onActivityChange (e) {
      this.$emit('onActivityChange', e)
    }
  }
}
</script>

