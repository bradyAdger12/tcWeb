<template>
  <v-select
    :items="activities"
    light
    label="Activity"
    :value="activity"
    :append-outer-icon="getIcon()"
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
      activities: ['run', 'ride', 'workout']
    }
  },
  mounted () {
    this.activity = this.currentActivity
  } ,
  methods: {
    getIcon () {
      if (this.currentActivity === 'ride') {
        return 'mdi-bike'
      } else if (this.currentActivity === 'run') {
        return 'mdi-run'
      }
      return 'mdi-dumbbell'
    },
    onActivityChange (e) {
      this.$emit('onActivityChange', e)
    }
  }
}
</script>

