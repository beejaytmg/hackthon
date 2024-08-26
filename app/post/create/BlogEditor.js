'use client'
import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';

const MenuBar = ({ editor }) => {
    if (!editor) {
      return null;
    }
  
    return (
      <div className="menu-bar flex flex-wrap gap-2 p-2 border-b border-gray-200">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('strike') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Strike
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('code') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Code
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('heading', { level: 1 }) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('heading', { level: 3 }) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Bullet List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Ordered List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('codeBlock') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Code Block
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('blockquote') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Blockquote
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-2 py-1 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Horizontal Rule
        </button>
        <button
          onClick={() => editor.chain().focus().setHardBreak().run()}
          className="px-2 py-1 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Hard Break
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="px-2 py-1 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Undo
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="px-2 py-1 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Redo
        </button>
        <button
          onClick={() => {
            const url = window.prompt('Enter the URL');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('link') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Set Link
        </button>
        <button
          onClick={() => editor.chain().focus().unsetLink().run()}
          className="px-2 py-1 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
          disabled={!editor.isActive('link')}
        >
          Unset Link
        </button>
      </div>
    );
  };

const BlogEditor = () => {
    const [title, setTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [slug, setSlug] = useState('');
    const [author, setAuthor] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isPreview, setIsPreview] = useState(false);
  
    const { refreshAccessToken } = useAuth();
    const router = useRouter();

    const editor = useEditor({
        extensions: [
          StarterKit,
          Placeholder.configure({
            placeholder: 'Write your blog content here...',
          }),
          Link.configure({
            openOnClick: false,
          }),
        ],
        content: '',
      });

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (title || metaDescription || editor?.getHTML() !== '<p></p>') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [title, metaDescription, editor]);

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await refreshAccessToken();
      const accessToken = localStorage.getItem('accessToken');
      const blogPost = {
        title,
        meta_description: metaDescription,
        content: editor.getHTML(),
        slug,
        author,
      };

      const response = await fetch('/api/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(blogPost),
      });

      if (!response.ok) {
        throw new Error('Failed to create blog post');
      }

      const data = await response.json();
      console.log('Blog post created:', data);

      alert('sucessfully created');
      // Clearing input values
    setTitle('');
    setMetaDescription('');
    setSlug('');
    setAuthor(1); // Assuming author ID is reset to 1
    editor.commands.setContent(''); // Clear the editor content
    setIsPreview(false); // Reset preview mode if needed
    router.push('/');
    } catch (error) {
      console.error('Error creating blog post:', error);
      setError(error.message || 'Failed to create blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mt-8 space-y-6 p-6 bg-white shadow-lg rounded-lg">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">Meta Description</label>
          <textarea
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
          <div className="mt-1 border rounded-md overflow-hidden">
            {!isPreview && (
              <>
                <MenuBar editor={editor} />
                <EditorContent editor={editor} className="p-4 min-h-[300px] prose max-w-none" />
              </>
            )}
            {isPreview && (
              <div 
                className="prose max-w-none p-4" 
                dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
              />
            )}
          </div>
          <button 
            type="button" 
            onClick={() => setIsPreview(!isPreview)}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isPreview ? 'Edit' : 'Preview'}
          </button>
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700">Author ID</label>
          <input
            type="number"
            id="author"
            value={author}
            onChange={(e) => setAuthor(parseInt(e.target.value))}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Blog Post'}
        </button>
      </div>
    </form>
  );
};

export default BlogEditor;