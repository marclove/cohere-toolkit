import Head from 'next/head';

/**
 * Page head wrapper component that aligns page titles.
 */
export const PageHead: React.FC<{ title: string; children?: React.ReactNode }> = ({
  title,
  children,
}) => {
  const fullTitle = `${title} | What is Project 2025?`;
  return (
    <Head>
      <title>{fullTitle}</title>
      {children}
    </Head>
  );
};
