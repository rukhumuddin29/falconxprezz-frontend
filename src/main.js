import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Divider from 'primevue/divider'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'

import App from './App.vue'
import router from './router'

import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: Aura,
  },
})
app.use(ToastService)

app.component('Toast', Toast)
app.component('Button', Button)
app.component('Card', Card)
app.component('Divider', Divider)
app.component('InputText', InputText)
app.component('Password', Password)

app.mount('#app')
