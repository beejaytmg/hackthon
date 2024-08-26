import { notFound } from 'next/navigation';
import formatDate from './formatDate';
async function getBlogPost(slug) {
  const res = await fetch(`http://localhost:3000/api/blog/${slug}`, { next: { revalidate: 60 } });
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
    <article className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{blogData.title}</h1>
      <p className="text-gray-600 mb-8">{formattedDate}</p>
      <div className="prose lg:prose-xl" dangerouslySetInnerHTML={{ __html: blogData.content }} />
    </article>
  );
}