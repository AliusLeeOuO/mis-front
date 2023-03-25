<template>
  <div id="login-layout">
    <div id="layout-left"></div>
    <div id="layout-right">
      <div id="login-block">
        <div id="login-title">
          <h3>登录口罩识别系统账号</h3>
        </div>
        <form autocomplete="off">
          <div class="error-message" v-if="errorMsg !== ''">
            <a-alert type="error" style="height: 50px">{{ errorMsg }}</a-alert>
          </div>
          <div class="input">
            <input
              id="username"
              class="username"
              v-model="loginForm.username"
              autocomplete="off"
              type="text"
              placeholder=" "
              required
            />
            <label for="username">账号</label>
          </div>
          <div class="input">
            <input
              id="password"
              class="password"
              v-model="loginForm.password"
              autocomplete="off"
              type="password"
              placeholder=" "
              required
            />
            <label for="password">密码</label>
          </div>
          <div class="submit-button" @click="postLogin" v-show="!loginLoading">
            登录
          </div>
          <div class="submit-button button-loading" v-show="loginLoading">
            <icon-loading/>
            <span>登录</span>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useMainStore } from "@/stores/main";
import { IconLoading } from "@arco-design/web-vue/es/icon";

import xhr from "@/xhr"
import qs from "qs"
import { AxiosError } from "axios";


const router = useRouter()
const store = useMainStore()

const errorMsg = ref("")
const loginLoading = ref(false)
const loginForm = reactive({
  username: "",
  password: "",
})


async function postLogin() {
  try {
    loginLoading.value = true
    if (loginForm.username === '' || loginForm.password === '') {
      throw new Error("账号或密码不能为空")
    }

    const response = await xhr.post("/user/login", qs.stringify(loginForm))
    if (response.data.code === 0) {
      localStorage.setItem("token", response.data.data.token)
      await store.checkUserInfo()
      await router.push("/currentStatus")
    } else {
      throw new Error(response.data.msg)
    }
    loginLoading.value = false
  } catch (e) {
    if (e instanceof AxiosError) {
      errorMsg.value = e.response?.data.message
    } else {
      errorMsg.value = (e as Error).message
    }
    loginLoading.value = false
  }
}

onMounted(async () => {
  try {
    await store.checkUserInfo()
    await router.push("/currentStatus")
  } catch (e) {
    console.log("未登录")
  }
})
</script>
<style lang="less" scoped>
#login-layout {
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  position: relative;

  & > * {
    height: 100vh;
    overflow: hidden;
  }

  #layout-left {
    position: fixed;
    width: 100vw;
    height: 100vh;
    background-size: cover;
    background-position: left;
  }

  #layout-right {
    background-color: rgba(255, 255, 255, 0.4);
    box-shadow: 3px 3px 6px 3px rgba(0, 0, 0, 0.3);
    display: grid;
    place-items: center;
    width: 100vw;
    position: fixed;
    right: 0;

    #login-block {
      min-width: 480px;
      //padding: 20px 40px;

      #login-title {
        padding-bottom: 50px;
        font-size: 23px;
        margin-top: 16px;

        h3 {
          margin: 0;
          text-align: center;
          font-weight: inherit;
        }
      }

      form {
        .error-message {
          margin-bottom: 20px;
        }

        .input {
          margin-bottom: 30px;
          position: relative;

          input {
            width: 100%;
            border: 0;
            outline: 0;
            border: 0.1rem solid #ccc;
            background-color: #fff;
            padding: 10px 20px;
            transition: 0.2s ease-in-out;
            height: 50px;
            color: #000 !important;

            &:focus,
            &:focus + label {
              border-color: #666666;
              color: #666666;
            }

            &:focus + label,
            &:not(:placeholder-shown) + label {
              font-weight: bold;
              top: 0;
              font-size: 12px;
            }
          }

          > label {
            padding-left: 5px;
            padding-right: 5px;
            transition: 0.2s ease-in-out;
            background-color: #fff;
            position: absolute;
            top: 50%;
            left: 10px;
            transform: translateY(-50%);
            color: #666;
          }
        }

        .submit-button {
          background-color: rgb(var(--primary-6));
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 14px;
          height: 47px;
          cursor: pointer;
          margin-bottom: 15px;

          &:hover {
            background-color: rgb(var(--primary-7));
          }

          span {
            margin-left: 5px;
          }
        }

        .button-loading {
          background-color: #739EFF;
          cursor: not-allowed;
        }
      }
    }
  }
}

.hiddenAlert {
  pointer-events: none;
  bottom: -150px !important;
  opacity: 0;
}

@keyframes showAlert {
  0% {
    bottom: -150px;
  }
  100% {
    bottom: 0;
  }
}

@keyframes hiddenAlert {
  0% {
    display: block;
    bottom: 0;
  }
  99% {
    bottom: -150px;
  }
  100% {
    display: none;
  }
}
</style>
