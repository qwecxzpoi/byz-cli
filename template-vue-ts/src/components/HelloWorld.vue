<script setup lang="ts">
import { useState } from '../store'

const state = useState()
</script>

<template>
  <button type="button" @click="state.add">
    count is: {{ state.data }}
  </button>
</template>
