import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import App from './App.tsx';
import './components/mdtext.scss';
// import { mockAPI } from './mocks/API';
import './styles/noFocus.css';
import typeReflectionAndSubmit from './mocks/reflectionHelper.ts';

if (import.meta.env.DEV) {
  // mockAPI();
  (window as any).typeReflectionAndSubmit = typeReflectionAndSubmit;
}

const DISABLE_FOCUS_STYLES = true;

if (DISABLE_FOCUS_STYLES) {
  document.documentElement.classList.add('no-focus-styles');
} else {
  document.documentElement.classList.remove('no-focus-styles');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>,
);
