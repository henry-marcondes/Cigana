import PropTypes from 'prop-types';
import MediaDisplay from './MediaDisplay';
import ChoiceButton from './ChoiceButton';

export default function Chapter({ chapter, onChoose }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-4xl font-bold text-purple-900 mb-6">{chapter.title}</h1>
      
      <div className="prose prose-lg max-w-none mb-8">
        <p className="text-gray-700 leading-relaxed">{chapter.content.text}</p>
      </div>

      {chapter.content.image && (
        <MediaDisplay
          type="image"
          src={chapter.content.image}
          alt={chapter.title}
        />
      )}

      {chapter.content.video && (
        <MediaDisplay
          type="video"
          src={chapter.content.video}
        />
      )}

      <div className="mt-12 space-y-4">
        <p className="text-gray-600 font-semibold">O que você faz?</p>
        {chapter.choices.map((choice) => (
          <ChoiceButton
            key={choice.id}
            text={choice.text}
            onClick={() => onChoose(choice.nextChapterId)}
          />
        ))}
      </div>
    </div>
  );
}

Chapter.propTypes = {
  chapter: PropTypes.object.isRequired,
  onChoose: PropTypes.func.isRequired,
};
