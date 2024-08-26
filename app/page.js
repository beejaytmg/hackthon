'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const [blogsData, setBlogsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-purple-50 to-white min-h-screen">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-5xl font-bold mb-12 text-center text-purple-800"
      >
        Latest Blog Posts
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          // Skeleton loader
          [...Array(6)].map((_, index) => (
            <div key={index} className="bg-white shadow-lg rounded-xl overflow-hidden animate-pulse">
              <div className="p-6 h-48">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))
        ) : (
          blogsData.map((blog, index) => (
            <motion.div 
              key={blog.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white shadow-lg rounded-xl overflow-hidden transform hover:scale-105 transition duration-300"
            >
              <Link href={`/post/${blog.slug}`} className="block h-full">
                <div className="p-6 flex flex-col h-full">
                  <h2 className="text-2xl font-semibold mb-3 text-purple-700">{blog.title}</h2>
                  <p className="text-gray-600 flex-grow">{blog.meta_description}</p>
                  <div className="mt-4 text-purple-600 font-medium">Read more →</div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}