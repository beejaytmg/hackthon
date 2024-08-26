import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const blogPost = await request.json();
        
        // Get the access token from the request headers
        const accessToken = request.headers.get('Authorization')?.split(' ')[1];

        if (!accessToken) {
            return NextResponse.json({ error: 'No access token provided' }, { status: 401 });
        }

        const response = await fetch('https://portbijay.pythonanywhere.com/api/blog/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(blogPost),
        });

        const data = await response.json();
       
        if (response.ok) {
            return NextResponse.json(data);
        } else {
            return NextResponse.json({ error: 'API request failed', details: data }, { status: response.status });
        }
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}