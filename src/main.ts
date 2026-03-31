import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { setupPinia } from './stores'

const app = createApp(App)
const pinia = setupPinia()

app.use(pinia)
app.mount('#app')
