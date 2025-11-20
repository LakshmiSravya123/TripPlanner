"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Simple markdown to HTML converter
    let html = content;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3 text-purple-700">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-purple-800">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-5 text-purple-900">$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-gray-900">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em class="italic text-gray-700">$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-purple-600 hover:text-purple-800 underline">$1</a>');

    // Bullet points
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 mb-2 text-gray-700">$1</li>');
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 mb-2 text-gray-700">$1</li>');

    // Wrap lists
    html = html.replace(/(<li.*<\/li>)/gim, '<ul class="list-disc pl-6 mb-4">$1</ul>');

    // Line breaks
    html = html.replace(/\n\n/gim, '</p><p class="mb-4 text-gray-700 leading-relaxed">');
    html = html.replace(/\n/gim, '<br />');

    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<')) {
      html = `<p class="mb-4 text-gray-700 leading-relaxed">${html}</p>`;
    }

    // Responsive iframes
    html = html.replace(
      /<iframe([^>]*)>/gim,
      '<div class="iframe-container my-6 rounded-lg overflow-hidden shadow-lg"><iframe$1 class="w-full" style="min-height: 400px; max-width: 100%;" loading="lazy"></iframe></div>'
    );

    containerRef.current.innerHTML = html;
  }, [content]);

  return (
    <motion.div
      ref={containerRef}
      className={`prose prose-purple max-w-none ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
}

