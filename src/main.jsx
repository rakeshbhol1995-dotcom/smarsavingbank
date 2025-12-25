import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer'

window.Buffer = Buffer
window.global = window
window.process = window.process || { env: {} }


import './index.css'
import App from './App.jsx'

import GlobalError from './GlobalError.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalError>
      <App />
    </GlobalError>
  </StrictMode>,
)
