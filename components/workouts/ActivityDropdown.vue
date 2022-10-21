<template>
  <v-select
    :items="activities"
    light
    label="Activity"
    :value="activity"
    @change="onActivityChange"
  />
</template>


<script>
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
      activities: ['run', 'ride']
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

