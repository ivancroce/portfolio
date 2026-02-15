import { FaLaptopCode, FaLayerGroup, FaRocket } from "react-icons/fa";
import { motion, type Variants } from "framer-motion";
import { fadeIn, textVariant } from "../utils/motion";

const About = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.1 }
    }
  };
  const headerVariants: Variants = textVariant(0.1);
  const subHeaderVariants: Variants = textVariant(0.2);
  const descriptionVariants: Variants = fadeIn("", "tween", 0.1, 1);

  const card1Variants: Variants = fadeIn("right", "tween", 0.5, 0.75);
  const card2Variants: Variants = fadeIn("up", "tween", 0.75, 0.75);
  const card3Variants: Variants = fadeIn("left", "tween", 1, 0.75);

  return (
    <section className="py-5 overflow-hidden" id="about">
      <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="container py-5">
        <div className="text-center mb-5">
          <motion.h6 variants={headerVariants} className="text-primary text-uppercase letter-spacing-2 mb-2">
            About Me
          </motion.h6>
          <motion.h2 variants={subHeaderVariants} className="display-5 fw-bold">
            Passionate about building meaningful <br />
            <span className="text-primary">digital experiences</span>
          </motion.h2>
        </div>
        <motion.div variants={descriptionVariants} className="row justify-content-center mb-5">
          <div className="col-lg-8">
            <div className="card gradient-card p-4 mb-4">
              <div className="card-body text-secondary">
                <p className="lead text-secondary mb-4">
                  I'm a <span className="text-white fw-semibold">Full Stack Developer</span> driven by curiosity, creativity, and a love for solving real-world
                  problems. I enjoy transforming ideas into clean, efficient, and user-focused applications.
                </p>
                <p className="lead text-secondary">
                  I’ve gained hands-on experience working with modern technologies across both frontend and backend, and I’m constantly improving my skills
                  through projects, experimentation, and continuous learning. My goal is simple: build things that matter and keep getting better every day.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        <div className="row g-4 text-center">
          <motion.div variants={card1Variants} className="col-md-4">
            <div className="card gradient-card h-100 p-4 hover-effect">
              <div className="card-body">
                <div className="text-primary display-6 mb-3">
                  <FaLayerGroup />
                </div>
                <h5>Continuous Learner</h5>
                <p className="text-secondary small mb-0">
                  Constantly improving through practice. I explore new patterns and technologies to keep growing every day.
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div variants={card2Variants} className="col-md-4">
            <div className="card gradient-card h-100 p-4 hover-effect">
              <div className="card-body">
                <div className="text-primary display-6 mb-3">
                  <FaLaptopCode />
                </div>
                <h5>Committed Creator</h5>
                <p className="text-secondary small mb-0">
                  Building the web with passion. I connect backend logic with clean, intuitive interfaces to create seamless user journeys.
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div variants={card3Variants} className="col-md-4">
            <div className="card gradient-card h-100 p-4 hover-effect">
              <div className="card-body">
                <div className="text-primary display-6 mb-3">
                  <FaRocket />
                </div>
                <h5>Future-Ready</h5>
                <p className="text-secondary small mb-0">
                  Ready to build and launch new ideas. I bring fresh perspective, energy, and a strong drive to contribute from day one.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
export default About;
