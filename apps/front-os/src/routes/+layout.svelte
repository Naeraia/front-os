<script>
import "../app.css";
import { inject } from '@vercel/analytics';
import { dev } from '$app/environment';
import { webVitals } from '$lib/vitals';
import { browser } from '$app/environment';
import { page } from '$app/stores';

inject({ mode: dev ? 'development' : 'production' })

let analyticsId = import.meta.env.VERCEL_ANALYTICS_ID;

$: if (browser && analyticsId) {
  webVitals({
    path: $page.url.pathname,
    params: $page.params,
    analyticsId
  })
}
</script>

<slot />