<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getLogs } from '@/utils/action-logger'
import type { LogEntry } from '@/types'

const logs = ref<LogEntry[]>([])

function loadLogs() {
  logs.value = getLogs()
}

function formatTimestamp(date: Date): string {
  return date.toLocaleString()
}

function formatDetails(log: LogEntry): string {
  if (log.metadata) {
    return `${log.details} | ${JSON.stringify(log.metadata)}`
  }
  return log.details
}

onMounted(() => {
  loadLogs()
})

const getIconName = (status: LogEntry['status']) => {
  switch (status) {
    case 'success':
      return 'tabler:check'
    case 'info':
      return 'tabler:info-circle'
    case 'error':
      return 'tabler:x'
    default:
      return 'tabler:help-circle'
  }
}

const getIconColor = (status: LogEntry['status']) => {
  switch (status) {
    case 'success':
      return 'text-green-500'
    case 'info':
      return 'text-yellow-500'
    case 'error':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}
</script>

<template>
  <div>
    <p>Total Logs: {{ logs.length }}</p>

    <div v-if="logs.length === 0">
      <p>No logs available</p>
    </div>

    <table v-else>
      <thead>
        <tr class="*:px-1 *:py-0.5 *:text-left">
          <th></th>
          <th>Timestamp</th>
          <th>Action</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(log, index) in logs"
          :key="index"
          class="even:bg-muted *:px-1 *:py-0.5 *:align-top *:text-sm"
        >
          <td>
            <UIcon
              :name="getIconName(log.status)"
              class="size-5"
              :class="getIconColor(log.status)"
            />
          </td>
          <td>{{ formatTimestamp(log.timestamp) }}</td>
          <td>{{ log.action }}</td>
          <td>{{ formatDetails(log) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
