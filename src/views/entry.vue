<template>
  <v-header></v-header>
  <div class="main">
    <router-view />
  </div>
</template>

<script lang="ts" setup>
import VHeader from "@/components/public/header.vue"
</script>

<style lang="less" scoped>
  .main {
    margin-top: 60px;
    margin-bottom: 30px;
  }
</style>
