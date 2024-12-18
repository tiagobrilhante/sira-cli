import Vuex from 'vuex'
import Vue from 'vue'
import http from '@/http'
import VuexPersistence from 'vuex-persist'

Vue.use(Vuex)

const estado = {
  token: null,
  usuarioLogado: {},
  emAtualizacao: false
}

const mutations = {
  DEFINIR_USUARIO_LOGADO (state, {token, usuarioLogado}) {
    state.token = token
    state.usuarioLogado = usuarioLogado
    state.emAtualizacao = false
  },
  DESLOGAR_USUARIO (state) {
    state.token = null
    state.usuarioLogado = {}
    state.emAtualizacao = false
  },
  ATUALIZAR_CONTEUDO (state) {
    state.emAtualizacao = true
  },
  PARA_ATUALIZAR_CONTEUDO (state) {
    state.emAtualizacao = false
  }
}

const actions = {
  efetuarLogin ({commit}, usuarioLogado) {
    return new Promise((resolve, reject) => {
      http.post('/login', usuarioLogado)
        .then(response => {
          commit('DEFINIR_USUARIO_LOGADO', {
            token: response.data.access_token,
            usuarioLogado: response.data.user
          })
          resolve(response.data)
        })
        .catch(err => {
          if (err.response && err.response.status === 401) {
            console.error('Credenciais Inválidas')
          } else {
            console.error('An error occurred:', err.message)
          }
          reject(err)
        })
    })
  },
  atualizarUsuarioLogado ({ commit, state }, usuarioLogado) {
    commit('DEFINIR_USUARIO_LOGADO', {
      token: state.token,
      usuarioLogado: usuarioLogado
    })
  }
}

const getters = {
  usuarioEstaLogado: state => Boolean(state.token),
  usuarioResetado: state => {
    if (state.usuarioLogado.reset === 1) {
      return false
    } else {
      return true
    }
  },
  usuarioLogado: state => {
    return state.usuarioLogado
  },
  paginaEmAtulizacao: state => Boolean(state.emAtualizacao)
}

const vuexLocal = new VuexPersistence({
  storage: window.sessionStorage
})

const store = new Vuex.Store({
  state: estado,
  mutations,
  actions,
  plugins: [vuexLocal.plugin],
  getters
})

// Add event listener to clear Vuex state on page refresh
window.addEventListener('beforeunload', () => {
  store.commit('DESLOGAR_USUARIO')
})

export default store
