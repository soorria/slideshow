import {
  createEffect,
  createMemo,
  createSignal,
  JSXElement,
  onCleanup,
  Show,
  VoidComponent,
} from 'solid-js'
import { SetStoreFunction } from 'solid-js/store'
import * as popover from '@zag-js/popover'

import { ImageDef, ImageFillMode, Settings, SlideshowAnimation } from '~/types'
import { normalizeProps, useMachine } from '@zag-js/solid'
import {
  createMemoStore,
  createPreviousMemo,
  useIsMouseInactive,
} from '~/utils'
import {
  ArrowsIn,
  ArrowsOut,
  ChevronLeftIcon,
  ChevronRightIcon,
  GridIcon,
  PauseIcon,
  PlayIcon,
  SettingsIcon,
} from './icons'
import { Portal } from 'solid-js/web'
import Tooltip from './Tooltip'
import autoAnimate from '@formkit/auto-animate'
import ms from 'ms'

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

  const [portalRoot, setPortalRoot] = createSignal<HTMLDivElement>()

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
          <Tooltip
            id="control--fullscreen"
            content="toggle fullscreen (f)"
            positioning={{
              placement: 'top-start',
            }}
          >
            <button
              class="group/btn btn btn-square btn-sm inline-flex gap-1"
              aria-label="toggle fullscreen"
              onClick={() => toggleFullscreen()}
            >
              <ArrowsOut class="h-4 w-4 transition-transform group-hocus-visible/btn:scale-125 group-fullscreen/show:hidden" />
              <ArrowsIn class="h-4 w-4 scale-125 transition-transform group-hocus-visible/btn:scale-100 group-not-fullscreen/show:hidden" />
            </button>
          </Tooltip>
          <Tooltip id="control--prev" content="previous image">
            <button
              class="group/btn btn btn-sm gap-1"
              onClick={() => props.onPositionChange(props.position - 1)}
              disabled={!canPrev()}
              aria-label="previous image"
            >
              <ChevronLeftIcon class="h-4 w-4 transition-transform group-hocus-visible/btn:-translate-x-1" />
              prev
            </button>
          </Tooltip>
          <Tooltip id="control--next" content="next image">
            <button
              class="group/btn btn btn-sm gap-1"
              onClick={() => props.onPositionChange(props.position + 1)}
              disabled={!canNext()}
              aria-label="next image"
            >
              next
              <ChevronRightIcon class="h-4 w-4 transition-transform group-hocus-visible/btn:translate-x-1" />
            </button>
          </Tooltip>

          <Tooltip id="control--autoplay" content="toggle autoplay (p)">
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
          </Tooltip>
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
          <Show when={portalRoot()} keyed>
            {root => (
              <Portal mount={root}>
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
          </Show>
        </div>
      </div>

      <div ref={setPortalRoot} id="show-portal-root"></div>
    </div>
  )
}

export default Slideshow

const createPopover = (ctx: popover.Context) => {
  const [state, send] = useMachine(popover.machine(ctx))
  const api = createMemoStore(() =>
    popover.connect(state, send, normalizeProps)
  )
  return {
    api,
  }
}
