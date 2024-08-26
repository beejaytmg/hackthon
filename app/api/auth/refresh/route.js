import { NextResponse } from 'next/server'

export async function POST(request) {
  const { refresh } = await request.json()

  try {
    const response = await fetch('https://portbijay.pythonanywhere.com/api/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json({ error: 'Token refresh failed' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}