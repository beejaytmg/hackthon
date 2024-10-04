export const metadata = {
    title: 'Free YouTube Shorts Downloader - Download YouTube Shorts Videos HD',
    description: 'Download YouTube Shorts videos in HD quality for free. Best YouTube Shorts downloader - no registration, unlimited downloads, all formats supported. Save YouTube Shorts easily!',
    keywords: 'YouTube Shorts downloader, download YouTube Shorts, YouTube Shorts to MP4, save YouTube Shorts, YouTube Shorts converter, free YouTube Shorts downloader',
    openGraph: {
      title: 'Free YouTube Shorts Downloader - Download YouTube Shorts Videos HD',
      description: 'Download YouTube Shorts videos in HD quality for free. No registration required. Fast, safe, and unlimited downloads.',
      type: 'website',
      url: 'https://bijayakumartamang.com.np/ytshorts',
      images: [
        {
          url: '/favicon.ico',
          width: 1200,
          height: 630,
          alt: 'YouTube Shorts Downloader',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Free YouTube Shorts Downloader - Download YouTube Shorts Videos HD',
      description: 'Download YouTube Shorts videos in HD quality for free. Fast, safe, and unlimited downloads.',
      images: ['/favicon.ico'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
  
  export default function YTShortsLayout({ children }) {
    return children;
  }