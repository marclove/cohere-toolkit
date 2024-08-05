import cx from 'classnames';
import Link from 'next/link';
import React, { PropsWithChildren } from 'react';

/**
 * @description Displays the navigation bar where clicking the logo will return the user to the home page.
 */
export const NavigationBar: React.FC<PropsWithChildren<{ className?: string }>> = ({
  className = '',
  children,
}) => {
  return (
    <nav
      className={cx(
        'z-navigation flex w-full items-center justify-between bg-gradient-to-br',
        'rounded-lg from-danger-900 to-danger-500 p-6 text-marble-100',
        className
      )}
    >
      <Link href="/" className="tracking-tight hover:tracking-wide transition-all duration-300">
        <div className="text-left text-lg md:text-xl lg:text-3xl font-black mr-3 flex items-baseline">
          What is Project 2025?
        </div>
      </Link>
      {children}
      
      <div className="flex flex-wrap justify-end space-x-6 uppercase font-code text-sm md:text-base lg:text-lg font-normal">
        <Link href="/" className="tracking-normal hover:tracking-widest transition-all duration-300">Ask</Link>
        <Link href="/" className="tracking-normal hover:tracking-widest transition-all duration-300">Topics</Link>
        <Link href="/" className="tracking-normal hover:tracking-widest transition-all duration-300">Index</Link>
        <Link href="/" className="tracking-normal hover:tracking-widest transition-all duration-300">Authors</Link>
      </div>
      {/* <label className="input input-bordered flex items-center gap-2">
        <input type="text" className="grow" placeholder="Search" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-4 w-4 opacity-70">
          <path
            fillRule="evenodd"
            d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
            clipRule="evenodd" />
        </svg>
      </label> */}
    </nav>
  );
};
