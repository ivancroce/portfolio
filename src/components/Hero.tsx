import { useState, useEffect, useRef } from "react";
import { FaEnvelope, FaFilePdf, FaGithub, FaLinkedin } from "react-icons/fa";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { fadeIn } from "../utils/motion";
import InkEffect from "./InkEffect";

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isLight, setIsLight] = useState(() => (localStorage.getItem("theme") ?? "light") === "light");

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
    return () => observer.disconnect();
  }, []);

  const { scrollY } = useScroll();
  // When scroll is 0px, opacity is 1. When scroll hits 200px, opacity is 0.
  const scrollOpacity = useTransform(scrollY, [0, 200], [1, 0]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isLight || !sectionRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    sectionRef.current.style.setProperty("--mouse-x", `${x}px`);
    sectionRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleScroll = () => {
    const aboutSection = document.getElementById("about");
    aboutSection?.scrollIntoView({ behavior: "smooth" });
  };

  const heroContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.1 } // Instant transition so children start timing immediately
    }
  };

  const getLetterVariant = (index: number) => fadeIn("up", "tween", index * 0.1 + 0.2, 0.8);

  const descriptionVariants: Variants = fadeIn("up", "tween", 1.2, 1);
  const iconsContainerVariants: Variants = fadeIn("up", "tween", 1.4, 1);
  const scrollButtonVariants: Variants = fadeIn("up", "tween", 2, 1);

  return (
    <section
      ref={sectionRef}
      className="vh-100 hero-section d-flex flex-column align-items-center justify-content-center text-center position-relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Background Effects */}
      {isLight ? (
        <InkEffect />
      ) : (
        <>
          <div className="hero-background"></div>
          <div className="hero-glow"></div>
        </>
      )}

      <motion.div className="container position-relative z-1" variants={heroContainerVariants} initial="hidden" animate="show">
        <div className="mb-4">
          <h1 className="display-1 fw-bold text-neon d-flex justify-content-center flex-wrap gap-2">
            {Array.from("IVAN CROCE").map((letter, i) => (
              <motion.span
                key={i}
                variants={getLetterVariant(i)}
                className={`d-inline-block ${isLight ? "position-relative letter-outline-wrapper" : ""}`}
                style={isLight ? { "--anim-delay": `${i * 0.2 + 0.2}s` } as React.CSSProperties : {}}
              >
                {isLight && letter !== " " ? (
                  <>
                    <span style={{ visibility: "hidden" }}>{letter}</span>
                    <svg
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{ overflow: "visible" }}
                    >
                      <text
                        x="50%"
                        y="50%"
                        dominantBaseline="central"
                        textAnchor="middle"
                        className="outline-text"
                      >
                        {letter}
                      </text>
                    </svg>
                  </>
                ) : (
                  letter === " " ? "\u00A0" : letter
                )}
              </motion.span>
            ))}
          </h1>
        </div>

        <motion.p variants={descriptionVariants} className="lead text-secondary mx-auto mb-5">
          Software Developer passionate about building scalable web applications.
        </motion.p>

        <motion.div variants={iconsContainerVariants} className="d-flex justify-content-center mb-5 gap-3">
          <a
            href="https://github.com/ivancroce"
            target="_blank"
            className="hero-btn rounded-circle p-3 text-white text-decoration-none"
            aria-label="GitHub Profile"
          >
            <FaGithub size={24} />
          </a>
          <a
            href="https://www.linkedin.com/in/ivancroce"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-btn rounded-circle p-3 text-white text-decoration-none"
            aria-label="LinkedIn Profile"
          >
            <FaLinkedin size={24} />
          </a>
          <a
            href="mailto:ivan.croce.it@gmail.com"
            rel="noopener noreferrer"
            className="hero-btn rounded-circle p-3 text-white text-decoration-none"
            aria-label="Send Email"
          >
            <FaEnvelope size={24} />
          </a>
          <a
            href="/IvanCroce_CV_Public.pdf"
            download="IvanCroce_CV_Public.pdf"
            className="hero-btn rounded-circle p-3 text-white text-decoration-none"
            title="Download CV"
          >
            <FaFilePdf size={24} />
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.button
        variants={scrollButtonVariants}
        initial="hidden"
        animate="show"
        style={{ opacity: scrollOpacity }}
        className="bg-transparent border-0 position-absolute bottom-0 start-50 translate-middle-x mb-5 z-2 p-0"
        onClick={handleScroll}
        aria-label="Scroll to About section"
      >
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}>
          <div className="scrolldown">
            <div className="chevrons">
              <div className="chevrondown"></div>
              <div className="chevrondown"></div>
            </div>
          </div>
        </motion.div>
      </motion.button>
    </section>
  );
};

export default Hero;
