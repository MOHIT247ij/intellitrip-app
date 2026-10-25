import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { usePlaceImage } from '../hooks/usePlaceImage';
import { findPlaceImage } from '../data/placeImages';

/**
 * <PlaceImage name="Taj Mahal" context="Agra" fallback={place.imageUrl} />
 * Always shows a real photo of the named place. If a photo fails to
 * load it falls back to the city photo, then the API image, then a
 * neutral placeholder — never a broken image icon.
 */
export default function PlaceImage({ name, context, fallback, alt, className = '', ...rest }) {
  const resolved = usePlaceImage(name, context, fallback);
  const chain = [resolved, findPlaceImage(context), fallback].filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [resolved, context, fallback]);

  const src = chain[index];

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-brand-100 to-accent-100 text-brand-600 ${className}`} {...rest}>
        <MapPin size={28} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || name}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setIndex((i) => i + 1)}
      className={`bg-slate-100 ${className}`}
      {...rest}
    />
  );
}
