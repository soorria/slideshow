import { ComponentProps, JSXElement, ValidComponent } from 'solid-js'

type IconComponent<T extends ValidComponent = 'svg'> = (
  props: ComponentProps<T>
) => JSXElement

export const TrashIcon: IconComponent = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    {...props}
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
    />
  </svg>
)

export const PlayIcon: IconComponent = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fill-rule="evenodd"
      d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
      clip-rule="evenodd"
    />
  </svg>
)

export const PauseIcon: IconComponent = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fill-rule="evenodd"
      d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
      clip-rule="evenodd"
    />
  </svg>
)

export const ChevronLeftIcon: IconComponent = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    {...props}
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
)

export const ChevronRightIcon: IconComponent = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    {...props}
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
)

export const ArrowsOut: IconComponent = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    {...props}
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
    />
  </svg>
)

export const ArrowsIn: IconComponent = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    {...props}
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
    />
  </svg>
)

export const ShuffleIcon: IconComponent = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    viewBox="0 0 256 256"
    fill="currentColor"
    {...props}
  >
    <path d="M237.7 178.3a8.1 8.1 0 0 1 0 11.4l-24 24a8.2 8.2 0 0 1-11.4 0a8.1 8.1 0 0 1 0-11.4l10.4-10.3h-11.8a72.2 72.2 0 0 1-58.6-30.2l-41.7-58.3A56.1 56.1 0 0 0 55.1 80H32a8 8 0 0 1 0-16h23.1a72.2 72.2 0 0 1 58.6 30.2l41.7 58.3a56.1 56.1 0 0 0 45.5 23.5h11.8l-10.4-10.3a8.1 8.1 0 0 1 11.4-11.4ZM143 107a8 8 0 0 0 11.2-1.9l1.2-1.6A56.1 56.1 0 0 1 200.9 80h11.8l-10.4 10.3a8.1 8.1 0 0 0 0 11.4a8.2 8.2 0 0 0 11.4 0l24-24a8.1 8.1 0 0 0 0-11.4l-24-24a8.1 8.1 0 0 0-11.4 11.4L212.7 64h-11.8a72.2 72.2 0 0 0-58.6 30.2l-1.1 1.6A8 8 0 0 0 143 107Zm-30 42a8 8 0 0 0-11.2 1.9l-1.2 1.6A56.1 56.1 0 0 1 55.1 176H32a8 8 0 0 0 0 16h23.1a72.2 72.2 0 0 0 58.6-30.2l1.1-1.6A8 8 0 0 0 113 149Z" />
  </svg>
)

export const GridIcon: IconComponent = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M5 11q-.825 0-1.413-.588Q3 9.825 3 9V5q0-.825.587-1.413Q4.175 3 5 3h4q.825 0 1.413.587Q11 4.175 11 5v4q0 .825-.587 1.412Q9.825 11 9 11Zm0 10q-.825 0-1.413-.587Q3 19.825 3 19v-4q0-.825.587-1.413Q4.175 13 5 13h4q.825 0 1.413.587Q11 14.175 11 15v4q0 .825-.587 1.413Q9.825 21 9 21Zm10-10q-.825 0-1.412-.588Q13 9.825 13 9V5q0-.825.588-1.413Q14.175 3 15 3h4q.825 0 1.413.587Q21 4.175 21 5v4q0 .825-.587 1.412Q19.825 11 19 11Zm0 10q-.825 0-1.412-.587Q13 19.825 13 19v-4q0-.825.588-1.413Q14.175 13 15 13h4q.825 0 1.413.587Q21 14.175 21 15v4q0 .825-.587 1.413Q19.825 21 19 21Z"
    />
  </svg>
)

export const SettingsIcon: IconComponent = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fill-rule="evenodd"
      d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
      clip-rule="evenodd"
    />
  </svg>
)

export const HeartIcon: IconComponent = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
)

export const LoadingIcon: IconComponent<'div'> = props => {
  return (
    <div
      {...props}
      role="presentation"
      class={[
        'animate-fast-spin rounded-full border-2 border-t-current border-l-current border-b-transparent border-r-transparent',
        props.class,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
