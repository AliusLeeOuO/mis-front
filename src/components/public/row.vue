<template>
  <div class="row">
    <div class="row-title">
      <slot name="title"></slot>
    </div>
    <div class="row-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>

</script>
<style lang="less" scoped>
  .row {
    margin: 20px 0;
    .row-title {
      font-size: 25px;
      margin-bottom: 10px;
    }
  }
</style>
