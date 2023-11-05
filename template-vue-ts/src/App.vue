<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
defineOptions({
  name: 'App',
})
</script>

<template>
  <p>
    <router-link to="/">
      index
    </router-link>
    <router-link to="/home">
      home
    </router-link>
    <router-link to="/hello">
      hello
    </router-link>
  </p>
  <router-view />
</template>
