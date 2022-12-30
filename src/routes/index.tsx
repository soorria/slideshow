import { createDropzone } from '@soorria/solid-dropzone'
import {
  Accessor,
  createEffect,
  createMemo,
  createSignal,
  FlowComponent,
  For,
  type JSX,
  JSXElement,
  onCleanup,
  onMount,
  Show,
  VoidComponent,
} from 'solid-js'
import { createStore, SetStoreFunction } from 'solid-js/store'
import { toast } from 'solid-toast'
import autoAnimate, { AnimationController } from '@formkit/auto-animate'
import {
  createSortable,
  SortableProvider,
  DragDropProvider,
  DragDropSensors,
  useDragDropContext,
} from '@thisbeyond/solid-dnd'
import shuffle from 'lodash.shuffle'
import { Portal } from 'solid-js/web'
import * as popover from '@zag-js/popover'
import { normalizeProps, useMachine } from '@zag-js/solid'
import ms from 'ms'

import {
  ArrowsIn,
  ArrowsOut,
  ChevronLeftIcon,
  ChevronRightIcon,
  GridIcon,
  HeartIcon,
  PauseIcon,
  PlayIcon,
  SettingsIcon,
  ShuffleIcon,
  TrashIcon,
} from '~/components/icons'

type ImageDef = { file?: File; url: string }
declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      sortable: boolean
    }
    interface ExplicitAttributes {}
  }
}

const getName = (image: ImageDef) => image.file?.name ?? image.url
const clamp = (num: number, min: number, max: number) =>
  Math.max(Math.min(num, max), min)

const ImagesSelector: VoidComponent<{
  value: ImageDef[]
  onChange: (images: ImageDef[]) => void
  onStart: (from?: { image: ImageDef; index: number }) => void
}> = props => {
  const dropzone = createDropzone({
    onDrop(accepted, rejected) {
      if (rejected.length) {
        toast.error('only image files are allowed')
      }
      const existingFiles = new Set(props.value.map(i => getName(i)))
      props.onChange([
        ...props.value,
        ...accepted
          .filter(f => !existingFiles.has(f.name))
          .map(file => ({
            file,
            url: URL.createObjectURL(file),
          })),
      ])
    },
    accept: 'image/*',
    get noClick() {
      return props.value.length > 0
    },
  })

  const [gridRef, setGridRef] = createSignal<HTMLDivElement | null>(null)
  let animation: AnimationController
  createEffect(() => {
    const grid = gridRef()
    if (!grid) return

    animation = autoAnimate(grid)

    onCleanup(() => {
      animation.disable()
    })
  })

  return (
    <div
      {...dropzone.getRootProps()}
      class="rounded-box relative flex-1 overflow-hidden border-2 border-primary bg-base-100"
      classList={{
        'cursor-pointer': props.value.length === 0,
      }}
    >
      <Show when={props.value.length === 0}>
        <div class="absolute inset-0 grid place-items-center bg-base-100 p-4 text-center text-3xl">
          click or drop images here to get started
        </div>
        <div
          class="absolute inset-x-0 bottom-4 flex flex-col justify-center bg-base-100 text-center text-sm text-base-content"
          onClick={event => {
            event.stopPropagation()
          }}
        >
          <a
            href="https://soorria.com/?ref=Utils"
            target="_blank"
            rel="noopener noreferrer"
            class="focus-outline group link-hover link rounded-btn inline-block px-2"
          >
            Made with{' '}
            <span class="relative inline-block h-5 w-5 align-middle">
              <HeartIcon class="absolute inset-0 fill-current text-primary" />
              <HeartIcon class="absolute inset-0 fill-current text-secondary group-hover:animate-ping" />
            </span>{' '}
            by <span class="underline group-hover:no-underline">Soorria</span>
          </a>
          <a
            href="https://github.com/soorria/slideshow"
            target="_blank"
            rel="noopener noreferrer"
            class="focus-outline group link-hover link rounded-btn inline-block px-2"
          >
            <span class="underline group-hover:no-underline">Source</span> on
            GitHub
          </a>
          <a
            href="https://soorria.com/#contact"
            target="_blank"
            rel="noopener noreferrer"
            class="focus-outline group link-hover link rounded-btn inline-block px-2"
          >
            Feedback &amp; Suggestions
          </a>
        </div>
      </Show>
      <div
        class="absolute inset-0 grid place-items-center bg-base-100 text-center text-3xl transition-opacity"
        classList={{
          'opacity-0 pointer-events-none': !dropzone.isDragActive,
          'opacity-100': dropzone.isDragActive,
        }}
      >
        <div class="space-y-4">
          <p>drop files here</p>
          {/* <span class="flex items-center gap-2 text-base">
            <span class="text-success">
              {dropzone.dragging.acceptedFiles.length} accepted
            </span>
            {' / '}
            <span class="text-error">
              {dropzone.dragging.fileRejections.length} rejected
            </span>
          </span> */}
        </div>
      </div>
      <input id="images-input" {...dropzone.getInputProps()} />
      <Show when={props.value.length > 0}>
        <div class="flex max-h-full min-h-full flex-col space-y-4 overflow-y-auto px-4">
          <div class="sticky top-0 z-10 flex items-center justify-between bg-base-100/30 py-4 backdrop-blur">
            <h1 class="text-2xl font-bold sm:text-3xl">
              {props.value.length} files uploaded
            </h1>

            <label
              for="images-input"
              class="cursor-pointer text-sm hocus:underline"
            >
              click or drop to add more files
            </label>
          </div>
          <DragDropProvider
            onDragStart={() => {
              animation.disable()
            }}
            onDragEnd={({ draggable, droppable }) => {
              if (!droppable) return

              const fromIndex = props.value.findIndex(
                i => getName(i) === draggable.id
              )
              const toIndex = props.value.findIndex(
                i => getName(i) === droppable.id
              )

              const copy = [...props.value]
              copy.splice(toIndex, 0, copy.splice(fromIndex, 1)[0])

              props.onChange(copy)

              requestAnimationFrame(() => {
                animation.enable()
              })
            }}
          >
            <DragDropSensors>
              <SortableProvider ids={props.value.map(i => getName(i))}>
                <div
                  ref={setGridRef}
                  class="grid gap-4"
                  style={{
                    'grid-template-columns':
                      'repeat(auto-fill, minmax(300px, 1fr))',
                  }}
                >
                  <For each={props.value}>
                    {(image, index) => {
                      const sortable = createSortable(getName(image), image)
                      const ctx = useDragDropContext()

                      return (
                        <div
                          use:sortable
                          class="group relative aspect-video overflow-hidden rounded"
                          classList={{
                            'z-50': sortable.isActiveDraggable,
                            // only animate movement when something is being dragged, but it's not the item being dragged
                            'transition-transform':
                              !!ctx?.[0].active.draggable &&
                              !sortable.isActiveDraggable,
                          }}
                          // data-index={index()}
                        >
                          <img
                            class="block h-full w-full object-cover transition group-hocus-within:scale-100 motion-safe:scale-110"
                            src={image.url}
                            loading="lazy"
                            decoding="async"
                          />

                          <div class="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-base-100/50 opacity-0 transition group-hocus-within:opacity-100" />
                          <div class="absolute inset-0 bg-gradient-to-bl from-transparent via-transparent to-base-100/75 opacity-0 transition group-hocus-within:opacity-100" />
                          <div
                            class="absolute inset-x-0 bottom-0 flex items-center gap-2 p-2 opacity-0 transition group-hocus-within:translate-y-0 group-hocus-within:opacity-100 motion-safe:translate-y-2"
                            classList={{
                              // prevent button presses when being dragged
                              'pointer-events-none': sortable.isActiveDraggable,
                            }}
                          >
                            <button
                              class="btn-outline btn btn-error btn-square btn-sm"
                              onClick={() => {
                                props.onChange(
                                  props.value.filter(
                                    i => getName(image) !== getName(i)
                                  )
                                )
                              }}
                              aria-label={`Delete image named ${getName(
                                image
                              )}`}
                            >
                              <TrashIcon class="h-4 w-4" />
                            </button>

                            <div class="flex-1" />

                            <button
                              class="btn btn-primary btn-square btn-sm"
                              onClick={() => {
                                props.onStart({ image: image, index: index() })
                              }}
                              aria-label={`Start slideshow from image named ${getName(
                                image
                              )}`}
                            >
                              <PlayIcon class="h-4 w-4 fill-current" />
                            </button>
                          </div>
                        </div>
                      )
                    }}
                  </For>
                </div>
              </SortableProvider>
            </DragDropSensors>
          </DragDropProvider>

          <div class="flex-1" />
          <div class="sticky bottom-0 z-10 flex items-center gap-4 bg-base-100/30 py-4 backdrop-blur">
            <button
              class="btn-outline btn btn-error gap-2 bg-base-100/30"
              onClick={() => props.onChange([])}
            >
              <TrashIcon class="h-6 w-6" />
              delete all images
            </button>

            <div class="flex-1" />

            <button
              class="group btn btn-secondary gap-2"
              onClick={() => props.onChange(shuffle(props.value))}
            >
              <ShuffleIcon class="h-6 w-6 fill-current transition-transform group-hover:-translate-x-0.5 group-active:!translate-x-0.5 group-active:-scale-y-100" />
              shuffle images
            </button>

            <button
              class="btn btn-primary gap-2"
              onClick={() => props.onStart()}
            >
              <PlayIcon class="h-6 w-6 fill-current" />
              start slideshow
            </button>
          </div>
        </div>
      </Show>
    </div>
  )
}

type Settings = {
  autoplay: boolean
  autoplayInterval: number
  loop: boolean
  shuffleLoop: boolean
  imageFillMode: ImageFillMode
  animation: SlideshowAnimation | null
}

const Slideshow: VoidComponent<{
  position: number
  onPositionChange: (position: number) => void
  settings: Settings
  onSettingsChange: SetStoreFunction<Settings>
  onExitSlideshow: () => void
  images: ImageDef[]
}> = props => {
  const prevPosition = createPreviousMemo(() => props.position)

  const toggleFullscreen = () => {
    if (!!document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      slideContainerRef()?.requestFullscreen({
        navigationUI: 'hide',
      })
    }
  }

  const canPrev = () => props.settings.loop || props.position > 0
  const canNext = () =>
    props.settings.loop || props.position < props.images.length - 1

  const isMouseInactive = useIsMouseInactive()
  const settingsPopover = createPopover({
    id: 'show-settings',
    portalled: true,
    positioning: {
      placement: 'top',
      overflowPadding: 16,
    },
  })
  const [slideContainerRef, setSlideContainerRef] =
    createSignal<HTMLElement | null>(null)

  const [slideRef, setSlideRef] = createSignal<HTMLElement | null>(null)
  createEffect(() => {
    const slideRootEl = slideRef()
    if (!slideRootEl) return

    const animation = autoAnimate(
      slideRootEl,
      (el, action, _oldCoords, _newCoords) => {
        let keyframes = [] as Keyframe[]

        const animation = props.settings.animation

        if (animation === 'fade') {
          if (action === 'add') {
            keyframes = [{ opacity: 0 }, { opacity: 1 }]
          }
          if (action === 'remove') {
            keyframes = [{ opacity: 1 }, { opacity: 0 }]
          }
        } else if ((['slide', 'slide-fade'] as any[]).includes(animation)) {
          const curr = props.position
          const prev = prevPosition()
          const shouldFade = animation === 'slide-fade'
          keyframes = (() => {
            if (prev === undefined) {
              return []
            }

            const parentWidth = slideRootEl.getBoundingClientRect().width
            const translateXAmount = parentWidth ? `${parentWidth}px` : '100%'
            console.log({ curr, prev, action, translateXAmount })

            const lastPossibleIndex = props.images.length - 1
            const isForward =
              (curr > prev ||
                // from last image to first
                (curr === 0 && prev === lastPossibleIndex)) &&
              // from first image to last
              !(prev === 0 && curr === lastPossibleIndex)
            if (action === 'add') {
              const translateX = `${isForward ? '' : '-'}${translateXAmount}`
              return [
                {
                  transform: `translate3d(${translateX}, 0, 0)`,
                  opacity: shouldFade ? 0 : 1,
                },
                { transform: `translate3d(0, 0, 0)`, opacity: 1 },
              ]
            }
            if (action === 'remove') {
              const translateX = `${isForward ? '-' : ''}${translateXAmount}`
              return [
                { transform: `translate3d(0, 0, 0)`, opacity: 1 },
                {
                  transform: `translate3d(${translateX}, 0, 0)`,
                  opacity: shouldFade ? 0 : 1,
                },
              ]
            }

            return []
          })()
        }

        return new KeyframeEffect(el, keyframes, {
          duration: 150,
          easing: 'ease-in-out',
        })
      }
    )

    onCleanup(() => {
      animation.disable()
    })
  })

  createEffect(() => {
    const keydownListener = (event: KeyboardEvent) => {
      const blockShortcutEl = (event.target as Element)?.closest(
        'input,select,textarea,[data-prevent-shortcut]'
      )
      if (blockShortcutEl) return

      if (['ArrowDown', 'ArrowRight'].includes(event.key)) {
        props.onPositionChange(props.position + 1)
        event.preventDefault()
        return
      }
      if (['ArrowUp', 'ArrowLeft'].includes(event.key)) {
        props.onPositionChange(props.position - 1)
        event.preventDefault()
        return
      }

      if (event.code === 'Space') {
        props.onPositionChange(props.position + (event.shiftKey ? -1 : 1))
        event.preventDefault()
        return
      }

      const anyNonShiftSpecialKeyPressed =
        event.metaKey || event.ctrlKey || event.altKey

      if (event.key === 'f' && !anyNonShiftSpecialKeyPressed) {
        toggleFullscreen()
        event.preventDefault()
        return
      }

      if (event.key === 'p' && !anyNonShiftSpecialKeyPressed) {
        props.onSettingsChange('autoplay', v => !v)
        event.preventDefault()
        return
      }
    }

    window.addEventListener('keydown', keydownListener)

    onCleanup(() => {
      window.removeEventListener('keydown', keydownListener)
    })
  })

  createEffect(() => {
    if (!props.settings.autoplay) return

    const nextPositon = props.position + 1
    // use timeout instead of interval so that it gets interrupted when slide is manually changed
    const timeout = setTimeout(() => {
      props.onPositionChange(nextPositon)
    }, props.settings.autoplayInterval)

    onCleanup(() => {
      clearInterval(timeout)
    })
  })

  // const containerSize = useElementSize(slideContainerRef)
  const displayedImage = createMemo((): JSXElement => {
    if (props.images.length === 0) return null
    // de-opt so I can use auto-animate for animations
    const src = props.images[props.position].url
    return (
      <img
        src={src}
        class="h-full w-full fullscreen:max-h-screen fullscreen:max-w-[100vh]"
        classList={{
          'object-cover': props.settings.imageFillMode === 'cover',
          'object-contain': props.settings.imageFillMode === 'contain',
        }}
      />
    )
  })

  return (
    <div
      ref={setSlideContainerRef}
      class="group/show relative h-full fullscreen:bg-black"
      classList={{
        'cursor-default': !isMouseInactive(),
        'fullscreen:cursor-none': isMouseInactive(),
      }}
    >
      <div
        ref={setSlideRef}
        class="flex h-full select-none items-center justify-center"
      >
        {displayedImage}
      </div>
      <div
        class="absolute inset-x-0 bottom-0 z-over-animation flex items-center justify-between transition-opacity"
        classList={{
          'in-fullscreen:opacity-100': !isMouseInactive(),
          'in-fullscreen:opacity-0': isMouseInactive(),
        }}
      >
        <div class="rounded-tr-box btn-group overflow-hidden bg-base-100/50 p-4 backdrop-blur">
          <button
            class="group/btn btn btn-square btn-sm inline-flex gap-1"
            aria-label="toggle fullscreen"
            onClick={() => toggleFullscreen()}
          >
            <ArrowsOut class="h-4 w-4 transition-transform group-hocus-visible/btn:scale-125 group-fullscreen/show:hidden" />
            <ArrowsIn class="h-4 w-4 scale-125 transition-transform group-hocus-visible/btn:scale-100 group-not-fullscreen/show:hidden" />
          </button>
          <button
            class="group/btn btn btn-sm gap-1"
            onClick={() => props.onPositionChange(props.position - 1)}
            disabled={!canPrev()}
            aria-label="previous image"
          >
            <ChevronLeftIcon class="h-4 w-4 transition-transform group-hocus-visible/btn:-translate-x-1" />
            prev
          </button>
          <button
            class="group/btn btn btn-sm gap-1"
            onClick={() => props.onPositionChange(props.position + 1)}
            disabled={!canNext()}
            aria-label="next image"
          >
            next
            <ChevronRightIcon class="h-4 w-4 transition-transform group-hocus-visible/btn:translate-x-1" />
          </button>
          <button
            class="group/btn btn btn-sm gap-1"
            onClick={() => props.onSettingsChange('autoplay', v => !v)}
            aria-label="toggle autoplay"
          >
            <span
              class="swap-rotate swap"
              classList={{ 'swap-active': props.settings.autoplay }}
            >
              <PauseIcon class="swap-on h-4 w-4" />
              <PlayIcon class="swap-off h-4 w-4" />
            </span>
            {props.settings.autoplay ? 'pause' : 'play'}
          </button>
        </div>
        <div class="rounded-tl-box btn-group overflow-hidden bg-base-100/50 p-4 backdrop-blur">
          <button
            class="btn btn-sm gap-1"
            onClick={() => props.onExitSlideshow()}
          >
            <GridIcon class="h-4 w-4" />
            select images
          </button>
          <button
            class="group btn btn-sm gap-1"
            {...settingsPopover.api.triggerProps}
          >
            <SettingsIcon class="h-4 w-4 transition-transform group-hocus-visible:rotate-[60deg]" />
            settings
          </button>
          <ClientOnly>
            {() => (
              <Portal
                mount={
                  typeof window === 'undefined'
                    ? undefined
                    : document.getElementById('show-portal-root') ?? undefined
                }
              >
                <div
                  {...settingsPopover.api.positionerProps}
                  class="rounded-box z-over-animation w-full max-w-sm bg-base-100 p-4"
                >
                  <div {...settingsPopover.api.contentProps} class="space-y-6">
                    <div
                      {...settingsPopover.api.titleProps}
                      class="text-xl font-bold"
                    >
                      slideshow settings
                    </div>
                    <form
                      {...settingsPopover.api.descriptionProps}
                      onSubmit={event => {
                        event.preventDefault()
                        settingsPopover.api.close()
                      }}
                      class="space-y-4"
                    >
                      <div class="space-y-2">
                        <label
                          for="settings--imageFillMode"
                          class="label-text label"
                        >
                          image fill mode
                        </label>

                        <select
                          id="settings--imageFillMode"
                          class="select-primary select w-full"
                          value={props.settings.imageFillMode}
                          onChange={event => {
                            props.onSettingsChange(
                              'imageFillMode',
                              event.currentTarget.value as ImageFillMode
                            )
                          }}
                        >
                          <option value="cover">fill</option>
                          <option value="contain">fit</option>
                        </select>
                      </div>
                      <div class="space-y-2">
                        <label
                          for="settings--animation"
                          class="label-text label"
                        >
                          animation
                        </label>

                        <select
                          id="settings--animation"
                          class="select-primary select w-full"
                          value={props.settings.animation ?? ''}
                          onChange={event => {
                            props.onSettingsChange(
                              'animation',
                              event.currentTarget.value
                                ? (event.currentTarget
                                    .value as SlideshowAnimation)
                                : null
                            )
                          }}
                        >
                          <option value="">none</option>
                          <option value="slide-fade">slide & fade</option>
                          <option value="slide">slide</option>
                          <option value="fade">fade</option>
                        </select>
                      </div>
                      <div class="flex items-center justify-between gap-2">
                        <label
                          for="settings--autoplay"
                          class="label-text label"
                        >
                          autoplay
                        </label>

                        <input
                          id="settings--autoplay"
                          type="checkbox"
                          class="toggle-primary toggle"
                          checked={props.settings.autoplay}
                          onInput={event =>
                            props.onSettingsChange(
                              'autoplay',
                              event.currentTarget.checked
                            )
                          }
                        />
                      </div>

                      <div
                        class="space-y-2"
                        classList={{
                          'opacity-75': !props.settings.autoplay,
                        }}
                      >
                        <label
                          for="settings--autoplayInterval"
                          class="label-text label"
                        >
                          autoplay interval
                        </label>

                        <input
                          id="settings--autoplayInterval"
                          type="number"
                          class="input-primary input w-full"
                          disabled={!props.settings.autoplay}
                          value={props.settings.autoplayInterval}
                          min="1"
                          step="1"
                          onInput={event => {
                            const num = Math.round(
                              event.currentTarget.valueAsNumber
                            )
                            if (Number.isSafeInteger(num)) {
                              props.onSettingsChange(
                                'autoplayInterval',
                                Math.max(1, num)
                              )
                            }
                          }}
                        />

                        <p class="label-text-alt label">
                          image will change every{' '}
                          {ms(props.settings.autoplayInterval, {
                            long: true,
                          })}
                        </p>
                      </div>
                      <div class="flex items-center justify-between gap-2">
                        <label for="settings--loop" class="label-text label">
                          loop images
                        </label>

                        <input
                          id="settings--loop"
                          type="checkbox"
                          class="toggle-primary toggle"
                          checked={props.settings.loop}
                          onInput={event =>
                            props.onSettingsChange(
                              'loop',
                              event.currentTarget.checked
                            )
                          }
                        />
                      </div>
                      <div class="flex items-center justify-between gap-2">
                        <label
                          for="settings--shuffleLoop"
                          class="label-text label"
                        >
                          shuffle when looping
                        </label>

                        <input
                          id="settings--shuffleLoop"
                          type="checkbox"
                          class="toggle-primary toggle"
                          checked={props.settings.shuffleLoop}
                          onInput={event =>
                            props.onSettingsChange(
                              'shuffleLoop',
                              event.currentTarget.checked
                            )
                          }
                        />
                      </div>
                      <div class="flex items-center">
                        <div class="flex-1" />
                        <button
                          {...settingsPopover.api.closeTriggerProps}
                          type="submit"
                          class="btn btn-primary btn-sm"
                        >
                          clone
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Portal>
            )}
          </ClientOnly>
        </div>
      </div>

      <div id="show-portal-root"></div>
    </div>
  )
}

type ImageFillMode = 'cover' | 'contain'
type SlideshowAnimation = 'fade' | 'slide' | 'slide-fade'

export default function Home() {
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
          onChange={newFiles => setState('images', newFiles)}
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

const createLocalStore = <T extends object>(
  key: string,
  initialValue: T
): readonly [state: T, setState: SetStoreFunction<T>] => {
  const [state, setState] = createStore(
    ((): T => {
      try {
        const stored = localStorage.getItem(key)
        if (!stored) return initialValue
        return JSON.parse(stored) as T
      } catch {
        return initialValue
      }
    })()
  )
  createEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  })
  createEffect(() => console.log(key, { ...state }))
  return [state, setState] as const
}

const createPreviousMemo = <T,>(get: Accessor<T>): Accessor<T | undefined> => {
  let currValue: T | undefined = undefined
  const [prev, setPrev] = createSignal<T | undefined>()
  createEffect(() => {
    const nextValue = currValue
    setPrev(() => nextValue)
    currValue = get()
  })
  return prev
}

const useFullscreen = () => {
  const [element, setElement] = createSignal<Element | null>(null)
  createEffect(() => {
    const fullscreenHandler = () => {
      setElement(() => document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', fullscreenHandler)
    onCleanup(() => {
      document.removeEventListener('fullscreenchange', fullscreenHandler)
    })
  })
  const active = createMemo(() => Boolean(element()))
  return {
    get available() {
      return document.fullscreenEnabled
    },
    get active() {
      return active()
    },
    get element() {
      return element()
    },
    request(element: Element) {
      return element.requestFullscreen()
    },
    exit() {
      if (active()) return document.exitFullscreen()
      return Promise.resolve()
    },
  }
}

interface UseIsMouseInactiveOptions {
  timeout?: number
  root?: Element | Window | null
}

export const useIsMouseInactive = (props: UseIsMouseInactiveOptions = {}) => {
  const [inactive, setInactive] = createSignal(false)
  let timer: NodeJS.Timeout

  const onMouseMove = () => {
    setInactive(false)
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      setInactive(true)
    }, props.timeout ?? 2500)
  }

  createEffect(() => {
    const el = props.root === undefined ? window : props.root
    if (!el) return

    onMount(() => {
      el.addEventListener('mousemove', onMouseMove)
      onMouseMove()
    })

    onCleanup(() => {
      el.removeEventListener('mousemove', onMouseMove)
    })
  })

  return inactive
}

const createPopover = (ctx: popover.Context) => {
  const [state, send] = useMachine(popover.machine(ctx))
  const api = createMemo(() => popover.connect(state, send, normalizeProps))
  return {
    get api() {
      return api()
    },
  }
}

let _hydrated = false
const useHydrated = () => {
  const [hydrated, setHydrated] = createSignal(_hydrated)
  onMount(() => {
    _hydrated = true
    if (!hydrated()) setHydrated(true)
  })
  return hydrated
}

const ClientOnly: FlowComponent<
  { fallback?: JSXElement },
  () => JSXElement
> = props => {
  const hydrated = useHydrated()

  return (
    <Show when={hydrated()} fallback={props.fallback}>
      {props.children}
    </Show>
  )
}

const useElementSize = (element: Accessor<Element | undefined | null>) => {
  const [size, setSize] = createStore({
    width: 0,
    height: 0,
  })

  createEffect(() => {
    const el = element()
    if (!el) return

    const resizeHandler = () => {
      const rect = el.getBoundingClientRect()
      if (!rect) return

      setSize({
        width: rect.width,
        height: rect.height,
      })
    }

    window.addEventListener('resize', resizeHandler, { passive: true })

    onCleanup(() => {
      window.removeEventListener('resize', resizeHandler)
    })
  })

  return size
}
