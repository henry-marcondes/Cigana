import { useContext } from 'react';
import { BookContext } from '../context/BookContext';

export function useBook() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBook deve ser usado dentro de BookProvider');
  }
  return context;
}
