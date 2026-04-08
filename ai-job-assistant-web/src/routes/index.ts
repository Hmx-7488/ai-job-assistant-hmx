import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '../views/Login.vue'
import AnalysisView from '../views/AnalysisView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: Login },
  {path: '/analysis', component: AnalysisView}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
