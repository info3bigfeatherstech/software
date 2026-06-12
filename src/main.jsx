import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux";
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import { store } from "./REDUX_FEATURES/STORE/store";
import OfflineProvider from './offline/components/OfflineProvider';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <OfflineProvider>
          <App />
        </OfflineProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
