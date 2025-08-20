import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid'
import React from 'react'

const Breadcrumb = React.memo(({ pages = [] }) => {
  if (!pages.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex py-2">
      <ol role="list" className="flex items-center space-x-4 overflow-x-auto">
        <li>
          <a href="/" className="text-gray-400 hover:text-gray-600 flex items-center">
            <HomeIcon aria-hidden="true" className="size-5" />
            <span className="sr-only">Home</span>
          </a>
        </li>

        {pages.map((page) => (
          <li key={page.href} className="flex items-center">
            <ChevronRightIcon aria-hidden="true" className="size-5 text-gray-400 mx-1" />
            <a
              href={page.href}
              aria-current={page.current ? 'page' : undefined}
              className={`text-sm font-medium whitespace-nowrap ${
                page.current ? 'text-gray-700 font-semibold' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {page.name}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
});

export default Breadcrumb;
