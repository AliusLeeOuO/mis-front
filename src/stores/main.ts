import { reactive } from 'vue'
import { defineStore } from 'pinia'
import xhr from "@/xhr";
import router from "@/router";
import { Message } from '@arco-design/web-vue'

type userData = {
  id: number
  name: string
}

export const useMainStore = defineStore('main', () => {
  const userData: userData = reactive({} as userData)

  async function checkUserInfo() {
    try {
      if (!localStorage.getItem("token")) {
        throw new Error("未登录")
      }
      const res = await xhr.post("/user/checkLogin")
      if (res.data.code === 0) {
        userData.id = res.data.data.id
        userData.name = res.data.data.username
        return Promise.resolve(res.data.data)
      } else {
        throw new Error(res.data.msg)
      }
    } catch (e) {
      userData.id = 0
      userData.name = ""
      localStorage.removeItem("token")
      return Promise.reject(e)
    }
  }

  async function logout() {
    localStorage.removeItem("token")
    await router.push("/login")
    Message.success("退出登录成功！")
  }

  return {userData, checkUserInfo, logout}
})
