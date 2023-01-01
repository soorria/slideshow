export type Settings = {
  autoplay: boolean
  autoplayInterval: number
  loop: boolean
  shuffleLoop: boolean
  imageFillMode: ImageFillMode
  animation: SlideshowAnimation | null
}

export type ImageFillMode = 'cover' | 'contain'
export type SlideshowAnimation = 'fade' | 'slide' | 'slide-fade'

export type ImageDef = { file?: File; url: string }
