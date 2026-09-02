import { useState, useEffect } from 'react'

/**
 * useDebounce hook that returns the debounced value after delay ms.
 * Avoids setting state synchronously in parent components on every keystroke.
 */
export function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
