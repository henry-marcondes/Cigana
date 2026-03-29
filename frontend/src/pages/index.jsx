import { useEffect, useState } from 'react';

export default function Home() {
  const [chapter, setChapter] = useState(null);
  const [choices, setChoices] = useState([]);

  async function carregarCapitulo(id) {
    const res = await fetch(`http://localhost:3001/api/chapters/${id}`);
    const data = await res.json();
    setChapter(data);

    const resChoices = await fetch(`http://localhost:3001/api/chapters/${id}/choices`);
    const dataChoices = await resChoices.json();
    setChoices(dataChoices);
  }

  useEffect(() => {
    carregarCapitulo(1);
  }, []);

  if (!chapter) return <p>Carregando...</p>;

  return (
    <div>
      <h1>{chapter.title}</h1>
      <p>{chapter.content}</p>

      {choices.map(choice => (
        <button
          key={choice.id}
          onClick={() => carregarCapitulo(choice.next_chapter_id)}
        >
          {choice.choice_text}
        </button>
      ))}
    </div>
  );
}
