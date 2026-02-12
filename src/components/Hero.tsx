import { useState } from "react";
import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa";
import { motion, type Variants } from "framer-motion";

const Hero = () => {
  const [mousePos, setMousePos] = useState({ x: "50%", y: "50%" });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x: `${x}px`, y: `${y}px` });
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <section
      className="vh-100 hero-section d-flex flex-column align-items-center justify-content-center text-center position-relative overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{ "--mouse-x": mousePos.x, "--mouse-y": mousePos.y } as React.CSSProperties}
    >
      {/* Background Effects */}
      <div className="hero-background"></div>
      <div className="hero-glow"></div>

      <motion.div className="container position-relative z-1" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="mb-4">
          <h1 className="display-1 fw-bold text-neon">
            {Array.from("IVAN CROCE").map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  delay: i * 0.1 + 0.5 // Start after container delay + stagger
                }}
                className="d-inline-block"
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </h1>
        </motion.div>
        <motion.p variants={itemVariants} className="lead text-secondary mx-auto mb-5">
          Junior Full Stack Developer passionate about building web applications.
        </motion.p>

        <motion.div variants={itemVariants} className="d-flex justify-content-center mb-5 gap-3">
          <a href="https://github.com/ivancroce" target="_blank" className="hero-btn rounded-circle p-3 text-white text-decoration-none">
            <FaGithub size={24} />
          </a>
          <a
            href="https://www.linkedin.com/in/ivancroce"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-btn rounded-circle p-3 text-white text-decoration-none"
          >
            <FaLinkedin size={24} />
          </a>
          <a href="mailto:ivan.croce.it@gmail.com" rel="noopener noreferrer" className="hero-btn rounded-circle p-3 text-white text-decoration-none">
            <FaEnvelope size={24} />
          </a>
        </motion.div>
      </motion.div>
      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="position-absolute bottom-0 start-50 translate-middle-x mb-5 z-2"
        role="button"
      >
        <div className="scrolldown">
          <div className="chevrons">
            <div className="chevrondown"></div>
            <div className="chevrondown"></div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
