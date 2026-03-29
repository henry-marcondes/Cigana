import '../styles/globals.css';
import { BookProvider } from '../context/BookContext';

export default function App({ Component, pageProps }) {
  return (
    <BookProvider>
      <Component {...pageProps} />
    </BookProvider>
  );
}
