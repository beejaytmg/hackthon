import { redirect } from 'next/navigation';

async function getRandomBlog() {
  const res = await fetch('https://blog-teal-zeta-25.vercel.app/api/blogs', { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error('Failed to fetch blogs');
  }
  const blogs = await res.json();
  return blogs[Math.floor(Math.random() * blogs.length)];
}

export default async function Page({ params }) {
  const randomBlog = await getRandomBlog();
  redirect(randomBlog.url + '?param=' + params.param);
  return null;
}