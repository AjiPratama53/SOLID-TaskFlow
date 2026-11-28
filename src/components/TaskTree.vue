<script setup lang="ts">
import type { TaskList } from '../domain/models'
defineProps<{ tasks: TaskList[]; selectedId?: string }>()
defineEmits<{ select: [task: TaskList] }>()
</script>

<template>
  <ul class="task-tree" aria-label="Task hierarchy">
    <li v-for="task in tasks" :key="task.id">
      <button :class="{ selected: selectedId === task.id }" @click="$emit('select', task)">
        <span>{{ task.name }}</span><small>{{ task.status.replaceAll('_', ' ') }}</small>
      </button>
      <TaskTree v-if="task.children.length" :tasks="task.children" :selected-id="selectedId" @select="$emit('select', $event)" />
    </li>
  </ul>
</template>
