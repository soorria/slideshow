import {
  Accessor,
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js'
import { createStore, reconcile, SetStoreFunction } from 'solid-js/store'
import { ImageDef } from './types'

export const createLocalStore = <T extends object>(
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
  return [state, setState] as const
}

export const createPreviousMemo = <T>(
  get: Accessor<T>
): Accessor<T | undefined> => {
  let currValue: T | undefined = undefined
  const [prev, setPrev] = createSignal<T | undefined>()
  createEffect(() => {
    const nextValue = currValue
    setPrev(() => nextValue)
    currValue = get()
  })
  return prev
}

export const useFullscreen = () => {
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

let _hydrated = false
export const useHydrated = () => {
  const [hydrated, setHydrated] = createSignal(_hydrated)
  onMount(() => {
    _hydrated = true
    if (!hydrated()) setHydrated(true)
  })
  return hydrated
}

export const useElementSize = (
  element: Accessor<Element | undefined | null>
) => {
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

export const createMemoStore = <T extends object>(get: Accessor<T>) => {
  const [store, setStore] = createStore<T>(get())
  // use createComputed to prevent tearing?
  createComputed(() => setStore(reconcile(get())))
  return store
}

export const getName = (image: ImageDef) => image.file?.name ?? image.url
export const clamp = (num: number, min: number, max: number) =>
  Math.max(Math.min(num, max), min)
