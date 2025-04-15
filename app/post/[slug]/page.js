import { notFound } from 'next/navigation';
import formatDate from './formatDate';
import MovieButton from './Button';

async function getBlogPost(slug) {
  const res = await fetch(`https://bijayakumartamang.com.np/api/blog/${slug}`, { 
    next: { 
      revalidate: 60,
      tags: [`blog-${slug}`] // Add cache tag for this specific post
    },
    cache: 'no-store' // Consider this if you need the most fresh data
  });
  if (!res.ok) {
    notFound();
  }
  return res.json();
}

export async function generateMetadata({ params }) {
  const blogPost = await getBlogPost(params.slug);
  return {
    title: blogPost.title,
    description: blogPost.meta_description,
  };
}

export default async function Page({ params }) {
  const blogData = await getBlogPost(params.slug);
  const dateString = blogData.published_date;
  const formattedDate = formatDate(dateString);
  
  return (
    <article className="container mx-auto px-4 py-12 bg-gradient-to-b from-purple-50 to-white min-h-screen">
      <div className="max-w-3xl mx-auto animate-fade-in-down">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-purple-800">
          {blogData.title}
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          {formattedDate}
        </p>
        <MovieButton />
        <div 
          className="prose lg:prose-xl prose-purple prose-img:rounded-xl prose-headings:text-purple-800"
          dangerouslySetInnerHTML={{ __html: blogData.content }} 
        />
        
      </div>
    </article>
  );
}

