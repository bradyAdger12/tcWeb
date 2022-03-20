import moment from "moment";
import duration from 'format-duration'

export function formatDate(date, format) {
  return moment(date).format(format ?? "MMMM Do YYYY, h:mm:ss a");
}

export function formatDuration(seconds) {
  return duration(seconds * 1000)
}