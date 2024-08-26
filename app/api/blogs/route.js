import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const url = `https://portbijay.pythonanywhere.com/api/blogs?_=${Date.now()}`; // Cache-busting with timestamp

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
