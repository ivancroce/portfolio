import { motion, type Variants } from "framer-motion";
import { fadeIn, textVariant, staggerContainer } from "../utils/motion";

type Tech = {
  name: string;
  img: string;
  invert?: boolean;
};

const techs: Tech[] = [
  // ───────── Frontend ─────────
  { name: "HTML5", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
  { name: "CSS3", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
  { name: "Sass", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg" },
  { name: "Bootstrap", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
  { name: "JavaScript", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  { name: "TypeScript", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { name: "React", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Redux", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg" },
  { name: "Vite", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" },

  // ───────── Backend ─────────
  { name: "Java", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  { name: "Spring Boot", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
  { name: "Maven", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/maven/maven-original.svg" },
  { name: "PostgreSQL", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },

  // ───────── Tools ─────────
  { name: "Git", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
  { name: "GitHub", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg", invert: true },
  { name: "Postman", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg" },
  { name: "VS Code", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" },
  { name: "IntelliJ", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/intellij/intellij-original.svg" },
  { name: "WordPress", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg", invert: true },
  { name: "Canva", img: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/canva.svg", invert: true }
];

const TechStack = () => {
  // Double the array to ensure the track is long enough for the animation loop
  const trackItems = [...techs, ...techs];

  const containerVariants: Variants = staggerContainer();
  const headerVariants: Variants = textVariant(0.1);
  const titleVariants: Variants = textVariant(0.2);
  const descriptionVariants: Variants = fadeIn("", "tween", 0.1, 1);
  const carouselVariants: Variants = fadeIn("up", "tween", 0.3, 1);

  const renderTrack = (keyPrefix: string) => (
    <div className="tech-carousel-track">
      {trackItems.map((tech, index) => (
        <motion.div key={`${keyPrefix}-${tech.name}-${index}`} className="tech-card">
          <img src={tech.img} alt={tech.name} className={`tech-icon mb-3 ${tech.invert ? "invert-white" : ""}`} />
          <h5 className="h6 mb-0">{tech.name}</h5>
        </motion.div>
      ))}
    </div>
  );

  return (
    <section className="py-5 bg-darker overflow-hidden" id="tech-stack">
      <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="container-fluid py-5">
        <div className="text-center mb-5">
          <motion.h6 variants={headerVariants} className="text-primary text-uppercase letter-spacing-2 mb-2">
            Tech Stack
          </motion.h6>
          <motion.h2 variants={titleVariants} className="display-4 fw-bold">
            Tech Stack & Tools
          </motion.h2>
          <motion.p variants={descriptionVariants} className="text-secondary mt-3">
            Technologies I use to build fast, scalable, and user-focused applications.
          </motion.p>
        </div>
        <motion.div variants={carouselVariants} className="tech-carousel-container">
          {renderTrack("track-1")}
          {renderTrack("track-2")}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TechStack;
