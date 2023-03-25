import axios from "axios"

export const baseURL = "https://api.qtxd.xyz/mis"
// export const baseURL = "http://localhost:33333"

const xhr = axios.create({
  // baseURL: "https://api.qtxd.xyz/mis",
  baseURL,
  timeout: 3000,
})

xhr.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default xhr
