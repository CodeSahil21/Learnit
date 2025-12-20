// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { Toaster } from '@/components/ui/sonner'
import { store } from '@/app/store'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <App />
      <Toaster />
    </Provider>

)
