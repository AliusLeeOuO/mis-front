import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/login"
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/user/login.vue")
    },
    {
      path: "/entry",
      name: "entry",
      component: () => import("../views/entry.vue"),
      children: [
        {
          path: "/entry",
          redirect: "/currentStatus"
        },
        {
          path: "/currentStatus",
          name: "currentStatus",
          component: () => import("../views/public/currentStatus.vue"),
          meta: {
            needLogin: true
          }
        },
        {
          path: "/serviceStatus",
          name: "serviceStatus",
          component: () => import("../views/public/serviceStatus.vue"),
          meta: {
            needLogin: true
          }
        },
        {
          path: "/editProfile",
          name: "editProfile",
          component: () => import("../views/public/editProfile.vue"),
          meta: {
            needLogin: true
          }
        },
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")
  if (to.meta.needLogin && !token) {
    next("/login")
    return
  }
  next()
})

export default router
