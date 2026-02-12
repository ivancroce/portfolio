import { useState } from "react";
import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa";

const Hero = () => {
  const [mousePos, setMousePos] = useState({ x: "50%", y: "50%" });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x: `${x}px`, y: `${y}px` });
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

      <div className="container position-relative z-1">
        <div className="mb-4">
          <h1 className="display-1 fw-bold text-neon">IVAN CROCE</h1>
        </div>
        <p className="lead text-secondary mx-auto mb-5">Junior Full Stack Developer passionate about building web applications.</p>

        <div className="d-flex justify-content-center mb-5 gap-3">
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
        </div>
      </div>
      {/* Scroll Indicator */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-5 z-2" role="button">
        <div className="scrolldown">
          <div className="chevrons">
            <div className="chevrondown"></div>
            <div className="chevrondown"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
