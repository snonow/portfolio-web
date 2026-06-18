import { motion, useScroll, useSpring } from "framer-motion";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.2 });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: "0% 50%" }}
      className="fixed top-16 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-800 z-40"
    />
  );
};

export default ScrollProgress;
