import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import JogadoresView from '../views/JogadoresView.vue'
import JogosView from '../views/JogosView.vue'
import ClassificacaoView from '../views/ClassificacaoView.vue'
import TopsView from '../views/TopsView.vue'
import PremiosView from '../views/PremiosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView},
    { path: '/jogadores', name: 'jogadores', component: JogadoresView },
    { path: '/jogos', name: 'jogos', component: JogosView },
    { path: '/classificacao', name: 'classificacao', component: ClassificacaoView },
    { path: '/tops', name: 'tops', component: TopsView },
    { path: '/premios', name: 'premios', component: PremiosView } 
   
  ]
})

export default router