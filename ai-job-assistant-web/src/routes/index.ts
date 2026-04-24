import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '../views/Login.vue'
import AnalysisView from '../views/AnalysisView.vue'
import ChatView from '../views/ChatView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: Login },
  {path: '/analysis', component: AnalysisView},
  {path: '/chat', component: ChatView}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
