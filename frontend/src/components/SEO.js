import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://www.beskarit.com';
const DEFAULT_OG_IMAGE =
  'https://customer-assets.emergentagent.com/job_04619072-dd18-466a-b051-872e26ea17cf/artifacts/8uottcra_logo.png';

/**
 * Per-route SEO meta tags. Overrides the global meta set in public/index.html
 * for richer indexing of /privacy and /terms (and any future routes).
 */
const SEO = ({ title, description, path = '/', keywords, image = DEFAULT_OG_IMAGE }) => {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
