<template>
  <div class="edit-profile">
    <nav>
      <div class="edit-profile-title">
        我的信息
      </div>
      <div>
        <a-button theme='light' type='primary' @click="store.logout">退出登录</a-button>
      </div>
    </nav>
    <main>
      <div class="edit-profile-left">
        <a-avatar :size="80" :style="{ backgroundColor: '#3370ff' }">
          <IconUser />
        </a-avatar>
        <div class="nickname">{{ store.userData.name }}</div>
      </div>
      <div class="edit-profile-right">
        暂无功能
      </div>
    </main>
  </div>
</template>
<script lang="ts" setup>
import { useMainStore } from "@/stores/main";
import { IconUser } from "@arco-design/web-vue/es/icon";

const store = useMainStore()
</script>
<style lang="less" scoped>
@max-container-width: 980px;

.edit-profile {
  nav {
    display: flex;
    justify-content: space-between;
    align-content: center;
    max-width: 980px;
    margin: 0 auto 5px;
    height: 50px;
    border-bottom: 1px solid #ccc;

    & > div {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .edit-profile-title {
      font-size: 18px;
      font-weight: bold;
    }
  }

  main {
    max-width: @max-container-width;
    margin: 60px auto 80px;
    display: flex;
    justify-content: space-between;
    align-content: center;

    .edit-profile-left {
      flex-basis: 300px;

      .nickname {
        margin-top: 25px;
        font-weight: bold;
        font-size: 20px;
      }
    }

    .edit-profile-right {
      flex: 1;
    }
  }
}

</style>
