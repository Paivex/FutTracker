import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashBoardView.vue'
import JogadoresView from '../views/JogadoresView.vue'
import JogosView from '../views/JogosView.vue'
import ClassificacaoView from '../views/ClassificacaoView.vue'
import TopsView from '../views/TopsView.vue'
import PremiosView from '../views/PremiosView.vue'
import JogoPage from '../views/JogoPage.vue'
import JogadorPage from '../views/JogadorPage.vue'
import PerfilView from '../views/PerfilView.vue'
import LigasView from '../views/LigasView.vue'
import MainLayout from '../views/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    { path: '/ligas', name: 'ligas', component: LigasView, meta: { requiresAuth: true } },
    { path: '/perfil', name: 'perfil', component: PerfilView, meta: { requiresAuth: true } },

    // Rotas internas com menu (precisam de liga selecionada)
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true, requiresLiga: true },
      children: [
        { path: '', name: 'dashboard', component: DashboardView },
        { path: 'jogadores', name: 'jogadores', component: JogadoresView },
        { path: 'jogos', name: 'jogos', component: JogosView },
        { path: 'classificacao', name: 'classificacao', component: ClassificacaoView },
        { path: 'tops', name: 'tops', component: TopsView },
        { path: 'premios', name: 'premios', component: PremiosView },
        { path: 'jogos/:id', name: 'jogo', component: JogoPage },
        { path: 'jogador/:id', name: 'jogador', component: JogadorPage },
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const liga = localStorage.getItem('ligaSelecionada')

  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }

  if (to.path === '/login' && token) {
    return next('/ligas')
  }

  if (to.meta.requiresLiga && !liga) {
    return next('/ligas')
  }

  next()
})

export default router