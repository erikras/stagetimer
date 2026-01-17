import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const START_MS = Math.floor(10 * 60 * 1000)
const WARNING_MS = Math.floor(1 * 60 * 1000)

function formatTime(ms: number, showNegativeSign: boolean) {
  const abs = Math.abs(ms)
  const totalSeconds = Math.floor(abs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const minutesStr = minutes.toString().padStart(2, '0')
  const sign = showNegativeSign && ms < 0 ? '-' : ''
  return `${sign}${minutesStr}:${seconds.toString().padStart(2, '0')}`
}

function App() {
  const [isRunning, setIsRunning] = useState(false)
  const [baseMs, setBaseMs] = useState(START_MS)
  const [displayMs, setDisplayMs] = useState(START_MS)
  const [fontSize, setFontSize] = useState(120)
  const startTimestampRef = useRef<number | null>(null)
  const shellRef = useRef<HTMLDivElement | null>(null)
  const measureRef = useRef<HTMLDivElement | null>(null)

  const isOvertime = displayMs < 0
  const isWarning = displayMs <= WARNING_MS && displayMs >= 0

  useEffect(() => {
    if (!isRunning || startTimestampRef.current === null) {
      return
    }

    let frameId: number
    const tick = () => {
      const now = performance.now()
      const elapsed = now - startTimestampRef.current!
      setDisplayMs(baseMs - elapsed)
      frameId = requestAnimationFrame(tick)
    }

    tick()

    return () => cancelAnimationFrame(frameId)
  }, [isRunning, baseMs])

  useEffect(() => {
    if (!isRunning) {
      setDisplayMs(baseMs)
    }
  }, [isRunning, baseMs])

  const handleStartPause = () => {
    if (isRunning) {
      const now = performance.now()
      const elapsed = startTimestampRef.current
        ? now - startTimestampRef.current
        : 0
      setBaseMs((prev) => prev - elapsed)
      startTimestampRef.current = null
      setIsRunning(false)
      return
    }

    startTimestampRef.current = performance.now()
    setIsRunning(true)
  }

  const handleReset = () => {
    setIsRunning(false)
    startTimestampRef.current = null
    setBaseMs(START_MS)
    setDisplayMs(START_MS)
  }

  const startLabel = useMemo(() => (isRunning ? 'Pausar' : 'Iniciar'), [isRunning])
  const formattedTime = useMemo(
    () => formatTime(displayMs, !isOvertime),
    [displayMs, isOvertime],
  )
  const renderedDigits = useMemo(
    () =>
      formattedTime.split('').map((ch, idx) => (
        <span
          key={`${ch}-${idx}`}
          className={`digit ${ch === ':' ? 'colon' : ''} ${ch === '-' ? 'minus' : ''}`}
        >
          {ch}
        </span>
      )),
    [formattedTime],
  )

  useEffect(() => {
    const recalcSize = () => {
      const shell = shellRef.current
      const measure = measureRef.current
      if (!shell || !measure) return

      const availableWidth = shell.clientWidth * 0.8
      const availableHeight = shell.clientHeight * 0.8
      if (availableWidth <= 0 || availableHeight <= 0) return

      measure.style.fontSize = '100px'
      const { width: measuredWidth, height: measuredHeight } = measure.getBoundingClientRect()
      if (measuredWidth === 0 || measuredHeight === 0) return

      const widthScale = availableWidth / measuredWidth
      const heightScale = availableHeight / measuredHeight
      const nextSize = Math.min(widthScale, heightScale) * 100
      setFontSize(nextSize)
    }

    recalcSize()

    const resizeObserver = new ResizeObserver(recalcSize)
    if (shellRef.current) {
      resizeObserver.observe(shellRef.current)
    }

    const handleResize = () => recalcSize()
    window.addEventListener('resize', handleResize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [formattedTime])

  return (
    <div className={`app ${isOvertime ? 'overtime' : isWarning ? 'warning' : ''}`}>
      <main className="timer-shell" ref={shellRef}>
        <div className="time" aria-label="timer" style={{ fontSize: `${fontSize}px` }}>
          {renderedDigits}
        </div>
        <div className="time-measure" ref={measureRef} aria-hidden="true">
          {renderedDigits}
        </div>
      </main>
      <div className="controls">
        <button className="control-button" onClick={handleStartPause}>
          {startLabel}
        </button>
        <button className="control-button secondary" onClick={handleReset}>
          Reiniciar
        </button>
      </div>
    </div>
  )
}

export default App
