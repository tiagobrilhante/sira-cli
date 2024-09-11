import axios from 'axios'
import store from '@/store'
import router from '../router'
import config from './config'

const leBase = config.baseURL
const http = axios.create({
  baseURL: leBase,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Accept': 'application/json',
    'Content-type': 'application/json'
  }

})

http.interceptors.response.use(
  response => response,
  error => {
    const {status} = error.response
    if (status === 401 || status === 403) {
      if (router.currentRoute.name !== 'login') {
        store.commit('DESLOGAR_USUARIO')
        router.push({name: 'index'})
      }
    }
    if (status === 500) {
      if (error.response.data.message === 'Expired token') {
        router.push({name: 'erroToken'}).catch(err => {
          if (err.name !== 'NavigationDuplicated') {
            throw err
          }
        })
        setTimeout(() => {
          store.commit('DESLOGAR_USUARIO')
          router.push({name: 'index'}).catch(err => {
            if (err.name !== 'NavigationDuplicated') {
              throw err
            }
          })
        }, 3000)
      } else {
        router.push({
          name: 'erro500',
          params: {error: error.response.data.message}
        }).catch(err => {
          if (err.name !== 'NavigationDuplicated') {
            throw err
          }
        })
      }
    }
    return Promise.reject(error)
  }
)

http.interceptors.request.use(function (config) {
  const token = store.state.token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}, function (erro) {
  return Promise.reject(erro)
})

export default http
