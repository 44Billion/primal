/* @refresh reload */
import { render } from 'solid-js/web';

import './index.scss';
import App from './App';
import { Router } from '@solidjs/router';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(
    import.meta.env.MODE === 'production' ? '/imageCacheWorker.js' : '/imageCacheWorker.js?dev-sw=1',
    { scope: '/'}
  );
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SW_ACTIVATED') {
      // New SW just took control — we might be running stale code
      const url = new URL(window.location.href);
      url.searchParams.set('_sw', Date.now().toString());
      window.location.replace(url.toString());
    }
  });
}

render(() => <App />, document.getElementById('root') as HTMLElement);
