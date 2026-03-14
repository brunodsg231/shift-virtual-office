import { useState, useEffect, useRef } from 'react'

export default function useTypewriter(fullText, speed = 30) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    if (!fullText) {
      setDisplayedText('')
      setIsComplete(false)
      indexRef.current = 0
      return
    }

    setDisplayedText('')
    setIsComplete(false)
    indexRef.current = 0

    const interval = setInterval(() => {
      indexRef.current += 1
      if (indexRef.current >= fullText.length) {
        setDisplayedText(fullText)
        setIsComplete(true)
        clearInterval(interval)
      } else {
        setDisplayedText(fullText.slice(0, indexRef.current))
      }
    }, speed)

    return () => clearInterval(interval)
  }, [fullText, speed])

  return { displayedText, isComplete }
}
