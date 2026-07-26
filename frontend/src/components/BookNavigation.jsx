import Link from 'next/link';

export default function BookNavigation() {
  return (
    <nav className="bg-purple-900 text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-bold text-2xl hover:text-pink-300">
          Ciganas
        </Link>
        <div className="space-x-6">
          <Link href="/book" className="hover:text-pink-300">
            Livro
          </Link>
          <Link href="/progress" className="hover:text-pink-300">
            Progresso
          </Link>
        </div>
      </div>
    </nav>
  );
}
