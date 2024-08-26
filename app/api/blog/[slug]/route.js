import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { slug } = params;

  try {
    const response = await fetch(`https://portbijay.pythonanywhere.com/api/blog/${slug}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Fetch Failed' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}