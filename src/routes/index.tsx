import { lazy, onMount, Show } from 'solid-js'
import { createStore } from 'solid-js/store'
import shuffle from 'lodash.shuffle'

import { ImageDef, Settings } from '~/types'
import { clamp, createLocalStore, getName } from '~/utils'
import ImagesSelector from '~/components/ImagesSelector'

const Slideshow = lazy(() => import('~/components/Slideshow'))
const ImagesGrid = lazy(() => import('~/components/ImagesGrid'))

export default function Home() {
  onMount(() => {
    ImagesGrid.preload()
    Slideshow.preload()
  })

  const [state, setState] = createStore({
    images: [] as ImageDef[],
    position: 0,
    mode: 'select' as 'select' | 'show',
  })
  const [settings, setSettings] = createLocalStore<Settings>(
    'slideshow:settings',
    {
      autoplay: true,
      autoplayInterval: 5000,
      imageFillMode: 'contain',
      animation: 'slide-fade',
      loop: true,
      shuffleLoop: false,
    }
  )

  const setPosition = (position: number) => {
    const numImages = state.images.length
    if (settings.loop && (position < 0 || position >= numImages)) {
      const actualPosition = (position + numImages) % numImages
      if (settings.shuffleLoop) {
        const currentImageName = getName(state.images[state.position])
        let shuffled = shuffle(state.images)
        while (getName(shuffled[actualPosition]) === currentImageName) {
          shuffled = shuffle(state.images)
        }
        setState(state => ({
          images: shuffle(state.images),
          position: actualPosition,
        }))
      } else {
        setState('position', actualPosition)
      }
      return
    }
    setState('position', clamp(position, 0, numImages))
  }

  return (
    <main class="flex h-full flex-col bg-base-300 p-4 lg:p-8">
      <Show when={state.mode === 'select'}>
        <ImagesSelector
          value={state.images}
          onChange={newImages => setState('images', newImages)}
          onStart={from => {
            setState({
              position: clamp(from?.index ?? 0, 0, state.images.length - 1),
              mode: 'show',
            })
          }}
        />
      </Show>

      <Show when={state.mode === 'show'}>
        <Slideshow
          position={state.position}
          onPositionChange={setPosition}
          settings={settings}
          onSettingsChange={setSettings}
          images={state.images}
          onExitSlideshow={() => setState('mode', 'select')}
        />
      </Show>
    </main>
  )
}
