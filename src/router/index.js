import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/administrativo/Home.vue'
import Index from '../views/Index.vue'
import erro500 from '../views/errors/erro500.vue'
import erroToken from '../views/errors/erroToken.vue'
// import Reset from '../views/Reset.vue'
import store from '@/store'
import Historico from '../views/administrativo/Historico.vue'
import GerIndicadores from '../components/gerenciamentoIndicadores/GerenciamentoIndicadores.vue'
import GerenciamentoDeTelas from '../components/telas/GerenciamentoDeTelas.vue'
import GerenciamentoDeDashboard from '../components/dashboard/GerenciamentoDashboard.vue'
import BkupBanco from '../views/administrativo/BkupBanco.vue'
import FerramentasAdmin from '../views/administrativo/FerramentasAdmin.vue'
import AdmUser from '../components/areaAdministrativa/AdmUser.vue'
import AdmSecoes from '../components/areaAdministrativa/AdmSecoes.vue'

Vue.use(VueRouter)
const routes = [
  {
    path: '',
    name: 'index',
    component: Index,
    meta: {
      publica: true
    }
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    meta: {
      logado: true
    }
  },
  {
    path: '/admuser',
    name: 'admuser',
    component: AdmUser,
    meta: {
      logado: true
    }
  },
  {
    path: '/admsecoes',
    name: 'admsecoes',
    component: AdmSecoes,
    meta: {
      logado: true
    }
  },
  {
    path: '/ferramentas',
    name: 'ferramentasAdm',
    component: FerramentasAdmin,
    meta: {
      logado: true
    }
  },
  {
    path: '/historico',
    name: 'historico',
    component: Historico,
    meta: {
      logado: true
    }
  },
  {
    path: '/telas',
    name: 'telas',
    component: GerenciamentoDeTelas,
    meta: {
      logado: true
    }
  },
  {
    path: '/gerenciadasboard',
    name: 'gerenciaDash',
    component: GerenciamentoDeDashboard,
    meta: {
      logado: true
    }
  },
  {
    path: '/gerindicadores',
    name: 'gerindicadores',
    component: GerIndicadores,
    meta: {
      logado: true
    }
  },
  {
    path: '/erro500',
    name: 'erro500',
    component: erro500,
    meta: {
      logado: true
    }
  },
  {
    path: '/erroToken',
    name: 'erroToken',
    component: erroToken,
    meta: {
      logado: true
    }
  },
  {
    path: '*',
    component: Index
  },
  {
    path: '/reset',
    name: 'reset',
    meta: {
      logado: true
    },
    // component: Reset
    component: () => import(/* webpackChunkName: "Reset" */ '../views/administrativo/Reset.vue')
  },
  {
    path: '/bkupbanco',
    name: 'BkupBanco',
    component: BkupBanco,
    meta: {
      logado: true
    }
  }
]
const router = new VueRouter({
  routes,
  mode: 'history'
})
router.beforeEach((routeTo, routeFrom, next) => {
  if (!routeTo.meta.publica && !store.state.token) {
    return next({name: 'index'})
  }

  if (routeTo.meta.logado && Object.values(store.state.usuarioLogado).length === 0) {
    return next({name: 'index'})
  }

  if (routeTo.meta.publica && store.state.token) {
    return next({name: 'home'})
  }

  next()
})
export default router
