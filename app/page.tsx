'use client'

import React, { useEffect, useState } from 'react'
import ImageSlider from '../ImageSlider'
import styles from './DemoPage.module.scss'

interface DogImage {
  message: string
  status: string
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

  const generateStartPosition = (placement: 'lt' | 'rt' | 'lb' | 'rb') => {
    switch (placement) {
      case 'lt':
        return { x: Math.random() * 20 + 5, y: Math.random() * 20 + 5 };
      case 'rt':
        return { x: Math.random() * 20 + 75, y: Math.random() * 20 + 5 };
      case 'lb':
        return { x: Math.random() * 20 + 5, y: Math.random() * 20 + 75 };
      case 'rb':
        return { x: Math.random() * 20 + 75, y: Math.random() * 20 + 75 };
    }
  }

  const generateSlides = (images: string[]) => {
    return images.map((imageUrl, index) => ({
      imageUrl,
      labels: [
        {
          label: `Label ${index + 1}`,
          placement: ['lt', 'rt', 'lb', 'rb'][index % 4] as 'lt' | 'rt' | 'lb' | 'rb',
          start: generateStartPosition(['lt', 'rt', 'lb', 'rb'][index % 4] as 'lt' | 'rt' | 'lb' | 'rb'),
          end: { x: Math.random() * 50 + 25, y: Math.random() * 50 + 25 },
        },
        {
          label: `Extra ${index + 1}`,
          placement: ['lt', 'rt', 'lb', 'rb'][(index + 2) % 4] as 'lt' | 'rt' | 'lb' | 'rb',
          start: generateStartPosition(['lt', 'rt', 'lb', 'rb'][(index + 2) % 4] as 'lt' | 'rt' | 'lb' | 'rb'),
          end: { x: Math.random() * 50 + 25, y: Math.random() * 50 + 25 },
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
      <div className={styles.controls}>
      </div>
      <section className={styles.sliderContainer}>
        <ImageSlider
          slides={slides}
        />
      </section>
    </div>
  )
}

export default DemoPage
