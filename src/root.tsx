// @refresh reload
import { Suspense } from 'solid-js'
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from 'solid-start'
import { Toaster } from 'solid-toast'
import './root.css'

const META = {
  title: 'slidy - simple image slideshows',
  description: 'simple image slideshow app',
  image: `https://soorria.com/api/og?${new URLSearchParams({
    subtitle: 'simple image slideshows',
    title: 'slidy.soorria.com',
  })}`,
}

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <Title>{META.title}</Title>
        <Meta name="description" content={META.description} />
        <Meta name="image" content={META.image} />
        <Meta property="og:url" content={'https://slidy.soorria.com'} />
        <Meta property="og:type" content="website" />
        <Meta property="og:image" content={META.image} />
        <Meta property="og:image:width" content="1200" />
        <Meta property="og:image:height" content="630" />
        <Meta property="og:description" content={META.description} />
        <Meta property="og:locale" content="en_AU" />
        <Meta name="twitter:card" content="summary_large_image" />
        <Meta name="twitter:creator" content="@soorriously" />
        <Meta name="twitter:site" content="@soorriously" />
        <Meta name="twitter:title" content={META.title} />
        <Meta name="twitter:alt" content={META.title} />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <Routes>
              <FileRoutes />
            </Routes>
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  'background-color': 'hsl(var(--n))',
                  color: 'hsl(var(--nc))',
                },
              }}
            />
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  )
}
