'use client'

import React, { useEffect, useState } from 'react'
import ImageSlider from '../ImageSlider'
import styles from './DemoPage.module.scss'

interface DogImage {
  message: string
  status: string
}

type LabelPlacement = 'lt' | 'rt' | 'lb' | 'rb'

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

const DemoPage: React.FC = () => {
  const [dogImages, setDogImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDogImages = async () => {
      try {
        setIsLoading(true)
        const responses = await Promise.all(
          Array(5)
            .fill(null)
            .map(() => fetch('https://dog.ceo/api/breeds/image/random')),
        )
        const data = await Promise.all(responses.map((res) => res.json()))
        setDogImages(data.map((item: DogImage) => item.message))
      } catch (error) {
        console.error('Error fetching dog images:', error)
        setError('Failed to fetch images. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDogImages()
  }, [])

  const generateStartPosition = (
    placement: LabelPlacement,
  ): { x: number; y: number } => {
    switch (placement) {
      case 'lt':
        return { x: 5, y: 25 }
      case 'lb':
        return { x: 5, y: 75 }
      case 'rt':
        return { x: 85, y: 25 }
      case 'rb':
        return { x: 85, y: 75 }
    }
  }

  const generateSlides = (images: string[]): Slide[] => {
    return images.map((imageUrl, index) => ({
      imageUrl,
      labels: [
        {
          label: `Top Left ${index + 1}`,
          placement: 'lt',
          start: generateStartPosition('lt'),
          end: { x: Math.random() * 30 + 20, y: Math.random() * 50 + 25 },
        },
        {
          label: `Bottom Left ${index + 1}`,
          placement: 'lb',
          start: generateStartPosition('lb'),
          end: { x: Math.random() * 30 + 20, y: Math.random() * 50 + 25 },
        },
        {
          label: `Top Right ${index + 1}`,
          placement: 'rt',
          start: generateStartPosition('rt'),
          end: { x: Math.random() * 30 + 50, y: Math.random() * 50 + 25 },
        },
        {
          label: `Bottom Right ${index + 1}`,
          placement: 'rb',
          start: generateStartPosition('rb'),
          end: { x: Math.random() * 30 + 50, y: Math.random() * 50 + 25 },
        },
      ],
    }))
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>
  }

  if (error) {
    return <div className={styles.error}>{error}</div>
  }

  const slides = generateSlides(dogImages)

  return (
    <div className={styles.demoPage}>
      <h1 className={styles.title}>Demo</h1>
      <div className={styles.controls}></div>
      <section className={styles.sliderContainer}>
        <ImageSlider slides={slides} />
      </section>
    </div>
  )
}

export default DemoPage
