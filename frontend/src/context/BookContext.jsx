import { createContext, useState, useEffect } from 'react';
import storyData from '../data/storyData.json';

export const BookContext = createContext();

export function BookProvider({ children }) {
  const [currentChapterId, setCurrentChapterId] = useState(1);
  const [progress, setProgress] = useState({
    chaptersRead: 1,
    totalChapters: storyData.chapters.length,
    choices: [],
  });

  const currentChapter = storyData.chapters.find(ch => ch.id === currentChapterId);

  const selectChoice = (nextChapterId) => {
    setCurrentChapterId(nextChapterId);
    setProgress(prev => ({
      ...prev,
      chaptersRead: Math.max(prev.chaptersRead, nextChapterId),
    }));
  };

  return (
    <BookContext.Provider value={{ currentChapter, currentChapterId, progress, selectChoice }}>
      {children}
    </BookContext.Provider>
  );
}
