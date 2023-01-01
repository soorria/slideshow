import { createDropzone } from '@soorria/solid-dropzone'
import { lazy, Show, Suspense, VoidComponent } from 'solid-js'
import toast from 'solid-toast'
import { ImageDef } from '~/types'
import { getName } from '~/utils'
import { HeartIcon, LoadingIcon } from './icons'

const ImagesGrid = lazy(() => import('./ImagesGrid'))

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
      const existingImageNames = new Set(props.value.map(i => getName(i)))
      props.onChange([
        ...props.value,
        ...accepted
          .filter(f => !existingImageNames.has(f.name))
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
            href="https://soorria.com/?ref=slidy"
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
            href="https://github.com/soorria/slidy"
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
          <p>drop images here</p>
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
        <Suspense
          fallback={
            <div class="grid h-full w-full place-items-center">
              <div class="flex items-center gap-4 text-2xl">
                <LoadingIcon class="h-8 w-8 !border-4 text-primary" />
                loading images
              </div>
            </div>
          }
        >
          <ImagesGrid
            value={props.value}
            onChange={props.onChange}
            onStart={props.onStart}
          />
        </Suspense>
      </Show>
    </div>
  )
}

export default ImagesSelector
