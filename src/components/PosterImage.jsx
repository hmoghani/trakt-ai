import React, { useState, useEffect } from 'react';
import { fetchPosterArt, getFallbackPoster } from '../services/posterService';

export default function PosterImage({ item, className = "w-full h-full object-cover" }) {
  const [src, setSrc] = useState(() => {
    if (item?.poster && !item.poster.includes('unsplash.com')) {
      return item.poster;
    }
    return getFallbackPoster(item?.title || 'Media', item?.year, item?.genres?.[0] || 'Drama');
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!item) return;

    fetchPosterArt(item).then((resolvedUrl) => {
      if (isMounted && resolvedUrl) {
        setSrc(resolvedUrl);
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => { isMounted = false; };
  }, [item?.id, item?.title, item?.year]);

  return (
    <img
      src={src}
      alt={item?.title || 'Media poster'}
      className={`${className} ${isLoading ? 'opacity-90' : 'opacity-100'} transition-opacity duration-300`}
      loading="lazy"
      onError={() => {
        setSrc(getFallbackPoster(item?.title || 'Media', item?.year, item?.genres?.[0] || 'Drama'));
      }}
    />
  );
}
