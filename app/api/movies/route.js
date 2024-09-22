import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://portbijay.pythonanywhere.com/api/movies');
    if (!res.ok) {
      throw new Error('Failed to fetch movies');
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}