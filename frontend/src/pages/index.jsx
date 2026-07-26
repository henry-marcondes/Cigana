import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

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

  console.log(chapter);

  if (!chapter) return <p>Carregando...</p>;

 return (
  <div className={styles.container}>

    <div className={styles.book}>

      <h1 className={styles.bookTitle}>
        Cultura Cigana
      </h1>

      <h2 className={styles.chapterTitle}>
        {chapter.title}
      </h2>

      <div className={styles.content}>
        <p>{chapter.content}</p>
      </div>
      

      <div className={styles.choiceArea}>
        {choices.map(choice => (
          <button
            key={choice.id}
            className={styles.choiceButton}
            onClick={() => carregarCapitulo(choice.next_chapter_id)}
          >
            {choice.choice_text}
          </button>
        ))}
      </div>

      <div className={styles.footer}>
        Livro Interativo • Projeto Cigana
      </div>

    </div>

  </div>
); 

 }
