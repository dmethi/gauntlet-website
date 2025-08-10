import { motion } from '@gauntlet/tokens';

export const variants = {
  fadeInUp: {
    initial: { opacity: 0, transform: 'translateY(8px)' },
    animate: {
      opacity: 1,
      transform: 'translateY(0)',
    },
    exit: { opacity: 0, transform: 'translateY(8px)' },
    transition: { duration: motion.duration.base / 1000, ease: motion.easing.easeOut },
  },
  scaleIn: {
    initial: { opacity: 0, transform: 'scale(0.98)' },
    animate: { opacity: 1, transform: 'scale(1)' },
    exit: { opacity: 0, transform: 'scale(0.98)' },
    transition: { duration: motion.duration.fast / 1000, ease: motion.easing.ease },
  },
};
