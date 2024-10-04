'use client';

import { useState } from 'react';
import { Download, Loader2, Video, Music, Info, CheckCircle } from 'lucide-react';


export default function YTShortsPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVideoData(null);

    try {
      const response = await fetch(`https://cdn51.savetube.me/info?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.status) {
        setVideoData(data.data);
      } else {
        setError('Failed to fetch video information');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section with SEO-friendly content */}
      <div className="bg-gradient-to-b from-blue-900 to-blue-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            Free YouTube Shorts Downloader - Save Shorts Videos Easily
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            Download YouTube Shorts videos in HD quality for free. No registration required. Fast, safe, and unlimited downloads.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <span>No Registration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <span>HD Quality</span>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Downloader Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter YouTube Shorts URL
                </label>
                <div className="flex gap-4">
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://youtube.com/shorts/..."
                    className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Loading...
                      </>
                    ) : (
                      'Download'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {videoData && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={videoData.thumbnail}
                    alt={videoData.title}
                    className="w-full rounded-lg"
                  />
                </div>
                <div className="md:w-2/3">
                  <h2 className="text-xl font-semibold mb-2">{videoData.title}</h2>
                  <p className="text-gray-600 mb-4">Duration: {videoData.durationLabel}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                        <Video size={20} /> Video Formats
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {videoData.video_formats.map((format, index) => (
                          format.url && (
                            <a
                              key={index}
                              href={format.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-md px-4 py-2"
                            >
                              <Download size={16} />
                              Download {format.label}
                            </a>
                          )
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                        <Music size={20} /> Audio Formats
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {videoData.audio_formats.map((format, index) => (
                          format.url && (
                            <a
                              key={index}
                              href={format.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-green-600 hover:text-green-800 bg-green-50 rounded-md px-4 py-2"
                            >
                              <Download size={16} />
                              Download {format.label}
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documentation Section */}
          <div className="space-y-8">
            <section className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Info size={24} className="text-blue-600" />
                How to Download YouTube Shorts
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Step 1: Get the YouTube Shorts URL</h3>
                  <p className="text-gray-600">
                    Open the YouTube Shorts video you want to download. Click the "Share" button and copy the video URL from the sharing options.
                  </p>
                </div>
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Step 2: Paste the URL</h3>
                  <p className="text-gray-600">
                    Paste the copied URL into the input box above and click the "Download" button.
                  </p>
                </div>
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Step 3: Choose Format</h3>
                  <p className="text-gray-600">
                    Select your preferred video quality or audio format from the available options.
                  </p>
                </div>
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Step 4: Download</h3>
                  <p className="text-gray-600">
                    Click the download button for your chosen format. The file will start downloading automatically.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Is it free to download YouTube Shorts?</h3>
                  <p className="text-gray-600">
                    Yes, our YouTube Shorts downloader is completely free to use. There are no hidden charges or subscription fees.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">What's the maximum quality available?</h3>
                  <p className="text-gray-600">
                    You can download YouTube Shorts in their original quality, up to 1080p HD resolution when available.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Can I download YouTube Shorts on mobile?</h3>
                  <p className="text-gray-600">
                    Yes, our downloader works on all devices, including smartphones and tablets. Simply share the Shorts URL and follow the same process.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Is it safe to use this downloader?</h3>
                  <p className="text-gray-600">
                    Yes, our downloader is safe to use. We don't store any of your data or videos, and no registration is required.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Features of Our YouTube Shorts Downloader</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">✨ Free & Unlimited</h3>
                  <p className="text-gray-600">Download as many videos as you want without any costs</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🎥 High Quality</h3>
                  <p className="text-gray-600">Download videos in their original quality up to 1080p</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🔒 Safe & Secure</h3>
                  <p className="text-gray-600">No registration required, no data stored</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">📱 Mobile Friendly</h3>
                  <p className="text-gray-600">Works perfectly on all devices</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}