import { FaLaptopCode, FaLayerGroup, FaUsers } from "react-icons/fa";
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
          <motion.h6 variants={headerVariants} className="text-primary text-uppercase letter-spacing-2 mb-2 fw-semibold">
            About Me
          </motion.h6>
          <motion.h2 variants={subHeaderVariants} className="display-5 fw-bold">
            Dedicated to building clean, <br />
            <span className="text-primary">efficient applications</span>
          </motion.h2>
        </div>
        <motion.div variants={descriptionVariants} className="row justify-content-center mb-5">
          <div className="col-lg-8">
            <div className="card gradient-card about-card-0 p-4 mb-4">
              <div className="card-body text-secondary">
                <p className="lead text-secondary mb-4">
                  I'm a <span className="text-white fw-semibold">Junior Full Stack Developer</span> building responsive web apps with
                  <span className="text-primary"> React and TypeScript </span> for the frontend and <span className="text-primary">Java with Spring Boot </span>
                  for the backend, constantly learning best practices along the way.
                </p>

                <p className="lead text-secondary">
                  I'm looking for a team that values clean code and continuous improvement, where I can contribute to real-world projects while growing
                  alongside experienced developers.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        <div className="row g-4 text-center">
          <motion.div variants={card1Variants} className="col-lg-4">
            <div className="card gradient-card about-card about-card-1 h-100 p-4 hover-effect">
              <div className="card-body">
                <div className="text-primary display-6 mb-3">
                  <FaLayerGroup />
                </div>
                <h5 className="fw-semibold">Continuous Learner</h5>
                <p className="text-secondary small mb-0">
                  Constantly improving through practice. I explore new patterns and technologies to keep growing every day.
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div variants={card2Variants} className="col-lg-4">
            <div className="card gradient-card about-card about-card-2 h-100 p-4 hover-effect">
              <div className="card-body">
                <div className="text-primary display-6 mb-3">
                  <FaLaptopCode />
                </div>
                <h5 className="fw-semibold">Problem Solver</h5>
                <p className="text-secondary small mb-0">
                  I enjoy the logic behind the code. I approach bugs with patience and don't stop until I find a clean, working solution.
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div variants={card3Variants} className="col-lg-4">
            <div className="card gradient-card about-card about-card-3 h-100 p-4 hover-effect">
              <div className="card-body">
                <div className="text-primary display-6 mb-3">
                  <FaUsers />
                </div>
                <h5 className="fw-semibold">Team-Ready</h5>
                <p className="text-secondary small mb-0">
                  Communicative, collaborative, and always open to feedback. I am eager to join a team and ready to contribute to real-world projects.
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
