import { useEffect, useState } from 'react';
import { Twemoji } from './Twemoji';

const RELEASE_NOTES_SEEN_KEY = 'release-notes-seen';

export function ReleaseNotes(): React.ReactElement | null {
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    const hasSeenNotes = localStorage.getItem(RELEASE_NOTES_SEEN_KEY);
    if (!hasSeenNotes) {
      setShowNotes(true);
      localStorage.setItem(RELEASE_NOTES_SEEN_KEY, 'true');
    }
  }, []);

  if (!showNotes) return null;

  return (
    <>
      <div
        className="fixed top-0 left-0 z-50 flex size-full bg-black opacity-50"
        onClick={() => setShowNotes(false)}
      />
      <div className="fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 transform px-10">
        <div className="mx-auto max-w-xl overflow-hidden rounded-lg bg-white p-4 pb-5">
          <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="text-center text-xl font-semibold text-gray-900">
              Release Notes
            </span>
            <span className="rounded-sm bg-gradient-to-r from-indigo-500 to-indigo-600 px-2 py-0.5 text-sm font-semibold text-white">
              v1.0.0
            </span>
          </div>
          <span className="text-sm text-gray-600">
            Welcome to Canvas! We're excited to introduce our first major
            release packed with powerful features designed to enhance your
            creative workflow:
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="flex items-center gap-1.5 font-medium text-gray-900">
                  <Twemoji emoji="🎨" /> Core Creative Tools
                </h3>
                <ul className="mt-1 list-disc pl-5">
                  <li>
                    Intuitive pen and arrow tools for drawing and annotations
                  </li>
                  <li>Rich text editing with customizable fonts and styles</li>
                  <li>
                    Smart object manipulation: resize, rotate, and position with
                    precision
                  </li>
                  <li>Advanced layering system for complex compositions</li>
                </ul>
              </div>

              <div>
                <h3 className="flex items-center gap-1.5 font-medium text-gray-900">
                  <Twemoji emoji="✨" /> Enhanced Media Features
                </h3>
                <ul className="mt-1 list-disc pl-5">
                  <li>One-click random GIF insertion for dynamic content</li>
                  <li>Seamless image and media embedding</li>
                  <li>Presentation mode for smooth content showcasing</li>
                </ul>
              </div>

              <div>
                <h3 className="flex items-center gap-1.5 font-medium text-gray-900">
                  <Twemoji emoji="🤖" /> Canvas AI Integration
                </h3>
                <ul className="mt-1 list-disc pl-5">
                  <li>Intelligent assistance for content creation</li>
                  <li>Smart suggestions and automated enhancements</li>
                  <li>Real-time creative recommendations</li>
                </ul>
              </div>

              <div>
                <h3 className="flex items-center gap-1.5 font-medium text-gray-900">
                  <Twemoji emoji="🌏" /> Global Accessibility
                </h3>
                <ul className="mt-1 list-disc pl-5">
                  <li>Full English and Japanese language support</li>
                  <li>Intuitive interface design for all users</li>
                  <li>Cross-platform compatibility</li>
                </ul>
              </div>
            </div>
          </span>
        </div>
      </div>
    </>
  );
}
