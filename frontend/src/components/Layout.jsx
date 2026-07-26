import { useBook } from '../hooks/useBook';
import Link from 'next/link';

export default function Progress() {
  const { progress } = useBook();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-purple-900 mb-8">Seu Progresso</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-lg mb-4">
            Você leu <strong>{progress.chaptersRead}</strong> capítulos
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className="bg-purple-600 h-4 rounded-full transition-all"
              style={{ width: `${(progress.chaptersRead / progress.totalChapters) * 100}%` }}
            />
          </div>
          
          <Link href="/book">
            <button className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              Continuar Leitura
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
