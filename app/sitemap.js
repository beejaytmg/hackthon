export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${baseUrl}/api/blogs`);
    const data = await response.json();
    // console.log(data);
    return data.map((item) => ({
      url: item.url,
      lastModified: new Date(item.updated_at),
      changeFrequency: 'daily',
      priority: 1,
    }));
  }
  