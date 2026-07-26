import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function ChoiceButton({ text, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, backgroundColor: '#EC4899' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full px-6 py-4 text-left bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition shadow-md font-semibold"
    >
      → {text}
    </motion.button>
  );
}

ChoiceButton.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
