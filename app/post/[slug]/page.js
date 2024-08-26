import { notFound } from 'next/navigation';
import formatDate from './formatDate';
import AnimatedContent from './AnimatedContent';
import LoadingSpinner from './LoadingSpinner';
import { Suspense } from 'react';

async function getBlogPost(slug) {
  const res = await fetch(`https://blog-teal-zeta-25.vercel.app/api/blog/${slug}`, { next: { revalidate: 60 } });
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

function BlogContent({ blogData, formattedDate }) {
  return (
    <AnimatedContent>
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-purple-800">
        {blogData.title}
      </h1>
      <p className="text-gray-600 mb-8 text-lg">
        {formattedDate}
      </p>
      <div 
        className="prose lg:prose-xl prose-purple prose-img:rounded-xl prose-headings:text-purple-800"
        dangerouslySetInnerHTML={{ __html: blogData.content }} 
      />
    </AnimatedContent>
  );
}

export default async function Page({ params }) {
  const blogData = await getBlogPost(params.slug);
  const dateString = blogData.published_date;
  const formattedDate = formatDate(dateString);
  
  return (
    <article className="container mx-auto px-4 py-12 bg-gradient-to-b from-purple-50 to-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Suspense fallback={<LoadingSpinner />}>
          <BlogContent blogData={blogData} formattedDate={formattedDate} />
        </Suspense>
      </div>
    </article>
  );
}