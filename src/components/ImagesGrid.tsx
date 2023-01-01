import autoAnimate, { AnimationController } from '@formkit/auto-animate'
import {
  createSortable,
  DragDropProvider,
  DragDropSensors,
  SortableProvider,
  useDragDropContext,
} from '@thisbeyond/solid-dnd'
import shuffle from 'lodash.shuffle'
import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  VoidComponent,
} from 'solid-js'
import { ImageDef } from '~/types'
import { getName } from '~/utils'
import { PlayIcon, ShuffleIcon, TrashIcon } from './icons'

const ImagesGrid: VoidComponent<{
  value: ImageDef[]
  onChange: (value: ImageDef[]) => void
  onStart: (arg?: { image: ImageDef; index: number }) => void
}> = props => {
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
    <div class="flex max-h-full min-h-full flex-col space-y-4 overflow-y-auto px-4">
      <div class="sticky top-0 z-10 flex items-center justify-between bg-base-100/30 py-4 backdrop-blur">
        <h1 class="text-2xl font-bold sm:text-3xl">
          {props.value.length} images uploaded
        </h1>

        <label
          for="images-input"
          class="cursor-pointer text-sm hocus:underline"
        >
          click or drop to add more images
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
                          class="btn-outline btn-error btn-square btn-sm btn"
                          onClick={() => {
                            props.onChange(
                              props.value.filter(
                                i => getName(image) !== getName(i)
                              )
                            )
                          }}
                          aria-label={`Delete image named ${getName(image)}`}
                        >
                          <TrashIcon class="h-4 w-4" />
                        </button>

                        <div class="flex-1" />

                        <button
                          class="btn-primary btn-square btn-sm btn"
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
          class="btn-outline btn-error btn gap-2 bg-base-100/30"
          onClick={() => props.onChange([])}
        >
          <TrashIcon class="h-6 w-6" />
          delete all images
        </button>

        <div class="flex-1" />

        <button
          class="group btn-secondary btn gap-2"
          onClick={() => props.onChange(shuffle(props.value))}
        >
          <ShuffleIcon class="h-6 w-6 fill-current transition-transform group-hover:-translate-x-0.5 group-active:!translate-x-0.5 group-active:-scale-y-100" />
          shuffle images
        </button>

        <button class="btn-primary btn gap-2" onClick={() => props.onStart()}>
          <PlayIcon class="h-6 w-6 fill-current" />
          start slideshow
        </button>
      </div>
    </div>
  )
}

export default ImagesGrid
