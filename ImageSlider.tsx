import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import styles from './ImageSlider.module.scss'

type LabelPlacement = 'lt' | 'lb' | 'rt' | 'rb'

interface Label {
  label: string
  placement: LabelPlacement
  start: { x: number; y: number }
  end: { x: number; y: number }
}

interface Slide {
  imageUrl: string
  labels: Label[]
}

interface ImageSliderProps {
  slides: Slide[]
  className?: string
}

const mod = (n: number, m: number) => ((n % m) + m) % m

const calculateControlPoints = (
  start: { x: number; y: number },
  end: { x: number; y: number },
  placement: LabelPlacement,
) => {
  const adjustedStart = { ...start }

  switch (placement) {
    case 'lt':
    case 'rt':
      adjustedStart.y += 10 / 100
      break
    case 'lb':
    case 'rb':
      adjustedStart.y -= 10 / 100
      break
  }

  const midX = (adjustedStart.x + end.x) / 2
  const midY = (adjustedStart.y + end.y) / 2
  const dx = end.x - adjustedStart.x
  const dy = end.y - adjustedStart.y
  const normalX = -dy
  const normalY = dx
  const curvature = 0.25
  const controlX = midX + normalX * curvature
  const controlY = midY + normalY * curvature

  return { controlX, controlY, adjustedStart }
}

const SlideLabel: React.FC<{ label: Label }> = React.memo(({ label }) => {
  const { controlX, controlY, adjustedStart } = calculateControlPoints(
    label.start,
    label.end,
    label.placement,
  )

  const path = `M${adjustedStart.x},${adjustedStart.y} Q${controlX},${controlY} ${label.end.x},${label.end.y}`

  const arrowLength = 1
  const arrowWidth = 1
  const dx = label.end.x - controlX
  const dy = label.end.y - controlY
  const angle = Math.atan2(dy, dx)

  const x1 =
    label.end.x - arrowLength * Math.cos(angle) + arrowWidth * Math.sin(angle)
  const y1 =
    label.end.y - arrowLength * Math.sin(angle) - arrowWidth * Math.cos(angle)
  const x2 =
    label.end.x - arrowLength * Math.cos(angle) - arrowWidth * Math.sin(angle)
  const y2 =
    label.end.y - arrowLength * Math.sin(angle) + arrowWidth * Math.cos(angle)

  const arrowPath = `M${label.end.x},${label.end.y} L${x1},${y1} M${label.end.x},${label.end.y} L${x2},${y2}`

  return (
    <>
      <div
        className={`${styles.slide__label} ${
          styles[`slide__label_${label.placement}`]
        }`}
        style={{
          left: `${label.start.x}%`,
          top: `${label.start.y}%`,
        }}
      >
        <span>{label.label}</span>
      </div>
      <svg
        className={styles.slide__arrow}
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d={path}
          fill="none"
          stroke="#9B51E0"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={arrowPath}
          fill="none"
          stroke="#9B51E0"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </>
  )
})

SlideLabel.displayName = 'SlideLabel'

const ImageSlider: React.FC<ImageSliderProps> = ({
  slides,
  className,
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0)
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const changeSlide = useCallback(
    (direction: number) => {
      if (isTransitioning) return
      setIsTransitioning(true)
      setCurrentSlide((prev) => mod(prev + direction, slides.length))
    },
    [isTransitioning, slides.length],
  )

  const nextSlide = useCallback(() => changeSlide(1), [changeSlide])
  const prevSlide = useCallback(() => changeSlide(-1), [changeSlide])

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentSlide) return
      setIsTransitioning(true)
      setCurrentSlide(index)
    },
    [currentSlide, isTransitioning],
  )

  useEffect(() => {
    const timer = setTimeout(() => setIsTransitioning(false), 300)
    return () => clearTimeout(timer)
  }, [currentSlide])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide()
      if (e.key === 'ArrowRight') nextSlide()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  const slideElements = useMemo(
    () =>
      slides.map((slide, index) => (
        <article
          key={slide.imageUrl}
          className={`${styles.slide} ${
            index === currentSlide ? styles.active : ''
          }`}
          aria-hidden={index !== currentSlide}
        >
          <div className={styles.slide__screenshot}>
            <Image
              src={slide.imageUrl}
              alt={`Slide ${index + 1}`}
              layout="fill"
              objectFit="contain"
              priority={index === currentSlide}
              loading={index === currentSlide ? 'eager' : 'lazy'}
            />
          </div>
          {slide.labels.map((label, labelIndex) => (
            <SlideLabel
              key={`${slide.imageUrl}-label-${labelIndex}`}
              label={label}
            />
          ))}
        </article>
      )),
    [slides, currentSlide],
  )

  if (slides.length === 0) {
    return null
  }

  return (
    <section
      ref={sliderRef}
      className={`${styles.slider} ${className || ''}`}
      aria-roledescription="carousel"
    >
      {slideElements}
      <button
        className={styles.slide__arrow_left}
        onClick={prevSlide}
        aria-label="Previous slide"
        disabled={isTransitioning}
      >
        <span
          aria-hidden="true"
          className={styles['slide__arrow_left--hidden']}
        >
          &lt;
        </span>
      </button>
      <button
        className={styles.slide__arrow_right}
        onClick={nextSlide}
        aria-label="Next slide"
        disabled={isTransitioning}
      >
        <span
          aria-hidden="true"
          className={styles['slide__arrow_right--hidden']}
        >
          &gt;
        </span>
      </button>
      <nav className={styles.slide__dots}>
        {slides.map((_, index) => (
          <button
            key={`dot-${index}`}
            className={`${styles.slide__dot} ${
              index === currentSlide ? styles.active : ''
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide}
          />
        ))}
      </nav>
    </section>
  )
}

ImageSlider.displayName = 'ImageSlider'

export default ImageSlider