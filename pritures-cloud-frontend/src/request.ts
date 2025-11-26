import axios from 'axios'
import { message } from 'ant-design-vue'

// 创建 Axios 实例
const myAxios = axios.create({
  baseURL: 'http://localhost:8123/api',
  timeout: 60000,
  withCredentials: true,
})

// 全局请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    console.log('发送请求:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
    })
    return config
  },
  function (error) {
    // Do something with request error
    console.error('请求配置错误:', error)
    return Promise.reject(error)
  },
)

// 全局响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    console.log('收到响应:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    })
    const { data } = response
    // 未登录
    if (data.code === 40100) {
      // 不是获取用户信息的请求，并且用户目前不是已经在用户登录页面，则跳转到登录页面
      if (
        !response.request.responseURL.includes('user/get/login') &&
        !window.location.pathname.includes('/user/login')
      ) {
        message.warning('请先登录')
        window.location.href = `/user/login?redirect=${window.location.href}`
      }
    }
    return response
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    console.error('请求失败:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    })
    if (error.response?.status === 401) {
      message.error('未授权，请重新登录')
      window.location.href = '/user/login'
    } else if (error.response?.status >= 500) {
      message.error('服务器错误，请稍后重试')
    } else {
      message.error('网络请求失败，请检查网络连接')
    }
    return Promise.reject(error)
  },
)

export default myAxios
