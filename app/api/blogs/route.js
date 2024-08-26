import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const response = await fetch('https://portbijay.pythonanywhere.com/api/blogs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Change this line to bypass the cache
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: 'Fetch Failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
