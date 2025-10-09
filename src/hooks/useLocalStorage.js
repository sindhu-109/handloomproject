import { useEffect, useState } from 'react'
import { readLocalStorage, writeLocalStorage } from '../utils/storage'

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readLocalStorage(key, initialValue))
  useEffect(() => { writeLocalStorage(key, value) }, [key, value])
  return [value, setValue]
}

export default useLocalStorage





