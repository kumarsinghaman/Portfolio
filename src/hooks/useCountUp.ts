import { useEffect, useState } from 'react'

export function useCountUp(
  end: number,
  active: boolean,
  duration = 2000,
  decimals = 0,
) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) return

    let startTime: number | null = null
    let frame: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Number((eased * end).toFixed(decimals)))

      if (progress < 1) {
        frame = requestAnimationFrame(step)
      }
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [end, active, duration, decimals])

  return value
}
