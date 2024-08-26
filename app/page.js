'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [blogsData, setBlogsData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/blogs', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setBlogsData(data);
      console.log(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Latest Blog Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogsData.map((blog) => (
          <div key={blog.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <Link href={`/post/${blog.slug}`} className="block hover:opacity-75 transition-opacity">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
                <p className="text-gray-600">{blog.meta_description}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}