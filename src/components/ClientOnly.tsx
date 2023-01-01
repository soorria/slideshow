import { FlowComponent, JSXElement, Show } from 'solid-js'
import { useHydrated } from '~/utils'

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

export default ClientOnly
