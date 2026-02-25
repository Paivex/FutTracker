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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    { path: '/', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/perfil', name: 'perfil', component: PerfilView, meta: { requiresAuth: true } },
    { path: '/ligas', name: 'ligas', component: LigasView, meta: { requiresAuth: true } },
    { path: '/jogadores', name: 'jogadores', component: JogadoresView, meta: { requiresAuth: true } },
    { path: '/jogos', name: 'jogos', component: JogosView, meta: { requiresAuth: true } },
    { path: '/classificacao', name: 'classificacao', component: ClassificacaoView, meta: { requiresAuth: true } },
    { path: '/tops', name: 'tops', component: TopsView, meta: { requiresAuth: true } },
    { path: '/premios', name: 'premios', component: PremiosView, meta: { requiresAuth: true } },
    { path: '/jogos/:id', name: 'jogo', component: JogoPage, meta: { requiresAuth: true } },
    { path: '/jogador/:id', name: 'jogador', component: JogadorPage, meta: { requiresAuth: true } }
  ]
})

// Guard de autenticação
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    // Se a rota requer autenticação e não há token, redireciona para login
    next('/login')
  } else if (to.path === '/login' && token) {
    // Se já está autenticado e tenta acessar login, vai para dashboard
    next('/')
  } else {
    next()
  }
})

export default router