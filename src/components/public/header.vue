<template>
  <header class="header-pc">
    <div class="header-layout">
      <router-link to="/currentStatus" class="header-left">
        <img
          src="@/assets/img/header/logo.svg"
          alt="logo">
        <span>口罩识别平台</span>
      </router-link>
      <nav>
        <router-link to="/currentStatus" class="nav-item">
          <img src="@/assets/img/header/currentStatus.svg" class="unselect-img" alt="currentStatus">
          <img src="@/assets/img/header/currentStatus_selected.svg" class="select-img" alt="currentStatus">
          <span>当前状态</span>
        </router-link>
        <router-link to="/serviceStatus" class="nav-item">
          <img src="@/assets/img/header/serviceStatus.svg" class="unselect-img" alt="serviceStatus">
          <img src="@/assets/img/header/serviceStatus_selected.svg" class="select-img" alt="serviceStatus">
          <span>服务状态</span>
        </router-link>
      </nav>
      <div class="header-right">
        <a-dropdown>
          <div class="user-info">
            <a-avatar :size="32" :style="{ backgroundColor: '#3370ff' }">
              <IconUser />
            </a-avatar>
            <span class="username">{{ store.userData.name }}</span>
          </div>
          <template #content>
<!--            <a-doption @click="toEditProfile">编辑资料</a-doption>-->
            <a-doption @click="store.logout">退出登录</a-doption>
          </template>
        </a-dropdown>
      </div>
    </div>
  </header>
</template>
<script lang="ts" setup>
import { IconUser, IconTool } from "@arco-design/web-vue/es/icon";
import { useMainStore } from "@/stores/main";
import { useRouter } from "vue-router";

const store = useMainStore()
const router = useRouter()

function toEditProfile() {
  router.push("/editProfile")
}

</script>
<style lang="less" scoped>
header {
  height: 55px;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 255;
  background-color: #fff;
}

.header-pc {
  display: flex;
  justify-content: center;
  align-items: center;

  .header-layout {
    width: 100%;
    height: 100%;
    max-width: 1440px;
    padding-left: 20px;
    padding-right: 20px;
    display: flex;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      cursor: pointer;
      margin-right: 30px;
      text-decoration: none;
      color: inherit;

      img {
        height: 36px;
        margin-right: 8px;
      }

      span {
        font-size: 18px;
        line-height: 24px;
        font-weight: 600;
        display: inline-flex;
        white-space: nowrap;
        text-overflow: ellipsis;
        transition: opacity 0.2s cubic-bezier(0.5, -0.1, 1, 0.4);
        opacity: 1;
      }
    }

    nav {
      flex: 1;
      height: 100%;
      display: flex;
      align-items: center;

      .nav-item {
        height: 100%;
        margin-left: 10px;
        margin-right: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        text-decoration: none;
        color: #727477;

        span {
          font-weight: bold;
          padding-left: 3px;
          transform: translateY(2px);
        }

        img {
          width: 25px;
        }
        .select-img {
          display: none;
        }

        &.router-link-active {
          color: #000;
          .unselect-img {
            display: none;
          }
          .select-img {
            display: block;
          }
        }
      }
    }

    .header-right {
      cursor: pointer;
      .user-info {
        display: flex;
        justify-content: center;
        align-items: center;
        .username {
          margin-left: 5px;
          font-size: 18px;
        }
      }

    }
  }
}
</style>
