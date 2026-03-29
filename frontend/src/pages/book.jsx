import { useBook } from '../hooks/useBook';
import Chapter from '../components/Chapter';
import BookNavigation from '../components/BookNavigation';

export default function Book() {
  const { currentChapter, selectChoice } = useBook();

  if (!currentChapter) {
    return <div className="text-center py-20">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BookNavigation />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Chapter chapter={currentChapter} onChoose={selectChoice} />
      </div>
    </div>
  );
}
