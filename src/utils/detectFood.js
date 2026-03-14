// Client-side: capture photo and send to server for AI food detection

export async function detectFoodFromImage(imageBase64) {
  const response = await fetch('/api/detect-food', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64 }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `Server error ${response.status}`)
  }

  const data = await response.json()
  return data.foods || []
}

export async function lookupFood(query) {
  const response = await fetch('/api/lookup-food', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `Server error ${response.status}`)
  }

  const data = await response.json()
  return data.foods || []
}

export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
