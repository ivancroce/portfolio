import { FaLinkedin, FaEnvelope, FaFilePdf } from "react-icons/fa";
import { motion, type Variants } from "framer-motion";
import { fadeIn, textVariant } from "../utils/motion";

const Contact = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.1 }
    }
  };

  const headerVariants: Variants = textVariant(0.1);
  const titleVariants: Variants = textVariant(0.2);
  const descriptionVariants: Variants = fadeIn("", "tween", 0.1, 1);
  const linkedinCardVariants: Variants = fadeIn("right", "tween", 0.3, 0.75);
  const emailCardVariants: Variants = fadeIn("up", "tween", 0.5, 0.75);
  const resumeCardVariants: Variants = fadeIn("left", "tween", 0.7, 0.75);

  return (
    <section className="pt-5 bg-darker overflow-hidden" id="contact">
      <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="container pt-5">
        <div className="text-center mb-5">
          <motion.h6 variants={headerVariants} className="text-primary text-uppercase letter-spacing-2 mb-2">
            Get In Touch
          </motion.h6>
          <motion.h2 variants={titleVariants} className="display-4 fw-bold">
            Let's work together
          </motion.h2>
          <motion.p variants={descriptionVariants} className="text-secondary mt-3 mx-auto mw-600">
            I'm currently looking for opportunities to join a team where I can contribute, learn, and grow as a developer. Feel free to reach out!
          </motion.p>
        </div>

        <div className="row justify-content-center mb-5 g-4">
          <motion.div variants={linkedinCardVariants} className="col-md-4">
            <a href="https://www.linkedin.com/in/ivancroce" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
              <div className="card h-100 contact-card p-4 hover-effect text-center">
                <div className="mb-3 icon-transition h3">
                  <FaLinkedin />
                </div>
                <h5 className="mb-1">LinkedIn</h5>
                <p className="text-secondary small mb-0">Let's connect</p>
              </div>
            </a>
          </motion.div>

          <motion.div variants={emailCardVariants} className="col-md-4">
            <a href="mailto:ivan.croce.it@gmail.com" className="text-decoration-none">
              <div className="card h-100 contact-card p-4 hover-effect text-center">
                <div className="mb-3 icon-transition h3">
                  <FaEnvelope />
                </div>
                <h5 className="mb-1">Email</h5>
                <p className="text-secondary small mb-0">Get in touch</p>
              </div>
            </a>
          </motion.div>

          <motion.div variants={resumeCardVariants} className="col-md-4">
            <a href="/IvanCroce_CV_Public.pdf" download="IvanCroce_CV_Public.pdf" className="text-decoration-none">
              <div className="card h-100 contact-card p-4 hover-effect text-center">
                <div className="mb-3 icon-transition h3">
                  <FaFilePdf />
                </div>
                <h5 className="mb-1">Resume</h5>
                <p className="text-secondary small mb-0">Download PDF</p>
              </div>
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Contact;
