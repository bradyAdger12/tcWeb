<template>
  <div>
    <CalendarView />
  </div>
</template>

<script>
import CalendarView from "../components/CalendarView.vue"
export default {
  name: "Calendar",
  middleware: 'auth',
  components: {
    CalendarView,
  },
  head: {
    title: "Calendar",
  },
};
</script>