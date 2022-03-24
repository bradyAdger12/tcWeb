<template>
  <div>
    <CalendarView />
  </div>
</template>

<script>
export default {
  name: "Calendar",
  middleware: 'auth',
  head: {
    title: "Calendar",
  },
};
</script>