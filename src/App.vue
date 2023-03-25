<template>
  <router-view />
</template>
<script setup lang="ts">
import { useMainStore } from "@/stores/main";

const store = useMainStore();

if (localStorage.getItem("token")) {
  store.checkUserInfo()
}
</script>
<style lang="less" scoped>

</style>
