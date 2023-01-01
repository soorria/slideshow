import {
  children,
  createComputed,
  createEffect,
  createMemo,
  DEV,
  FlowComponent,
  JSXElement,
  mergeProps,
  splitProps,
} from 'solid-js'
import { isServer, Portal, Show } from 'solid-js/web'
import * as tooltip from '@zag-js/tooltip'

import ClientOnly from './ClientOnly'
import { normalizeProps, useMachine } from '@zag-js/solid'
import { createMemoStore } from '~/utils'

type TooltipApi = ReturnType<typeof tooltip['connect']>
const Tooltip: FlowComponent<
  tooltip.Context & {
    portalMount?: Node
    content: JSXElement | ((api: TooltipApi) => JSXElement)
    withArrow?: boolean
  },
  JSXElement
> = props => {
  const [, ctx] = splitProps(props, [
    'portalMount',
    'children',
    'content',
    'withArrow',
  ])
  const [state, send] = useMachine(
    tooltip.machine(
      mergeProps(
        {
          openDelay: 250,
          closeDelay: 250,
          get positioning() {
            return mergeProps(
              {
                strategy: 'fixed',
                placement: 'top',
              } as tooltip.Context['positioning'],
              ctx.positioning
            )
          },
        } as Partial<tooltip.Context>,
        ctx
      )
    )
  )
  const api = createMemoStore(() =>
    tooltip.connect(state, send, normalizeProps)
  )
  const _children = children(() => props.children).toArray()
  if (DEV) {
    createEffect(() => {
      if (_children.length > 1)
        console.error('<Tooltip> should only have 1 child')
      if (!(_children[0] instanceof Element)) {
        console.error('<Tooltip> should only have Element children')
      }
    })
  }
  const child = createMemo(() => _children[0])

  if (!isServer) {
    createComputed(async () => {
      const assign = await import('solid-js/web').then(mod => mod.assign)
      const c = child()
      if (c instanceof Element) {
        assign(c, api.triggerProps, false, true)
      }
    })
  }

  const content = () => {
    if (typeof props.content === 'function') {
      return props.content(api)
    }
    return props.content
  }

  return (
    <>
      {child()}
      <ClientOnly>
        {() => (
          <Portal mount={props.portalMount}>
            <div {...api.positionerProps} class="z-over-animation">
              <Show when={props.withArrow ?? true}>
                <div {...api.arrowProps}>
                  <div {...api.arrowTipProps} />
                </div>
              </Show>
              <div
                {...api.contentProps}
                class="rounded bg-neutral py-1 px-2 text-neutral-content shadow-sm"
              >
                {content()}
              </div>
            </div>
          </Portal>
        )}
      </ClientOnly>
    </>
  )
}

export default Tooltip
