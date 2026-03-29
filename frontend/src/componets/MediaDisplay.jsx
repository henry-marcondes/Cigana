import PropTypes from 'prop-types';
import Image from 'next/image';

export default function MediaDisplay({ type, src, alt }) {
  return (
    <div className="my-8 rounded-lg overflow-hidden shadow-lg">
      {type === 'image' && (
        <Image
          src={src}
          alt={alt || 'Imagem do capítulo'}
          width={800}
          height={400}
          className="w-full object-cover"
        />
      )}
      {type === 'video' && (
        <iframe
          width="100%"
          height="400"
          src={src}
          title="Vídeo do capítulo"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}

MediaDisplay.propTypes = {
  type: PropTypes.oneOf(['image', 'video']).isRequired,
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
};
