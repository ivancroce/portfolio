import { motion, type Variants } from "framer-motion";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import { fadeIn, textVariant } from "../utils/motion";

const projects = [
  {
    title: "Halo Health",
    subtitle: "Frontend Optimization & Refactoring Project",
    context:
      "Took ownership of an unfinished and unoptimized web platform and transformed it into a performant, responsive, and production-ready application. Improved architecture, code quality, and user experience while maintaining the existing Next.js and TypeScript stack.",
    achievements: [
      "Refactored and stabilized a partially completed codebase, improving structure, readability, and maintainability.",
      "Increased Lighthouse performance scores from ~80–85 to 95–100 across mobile and desktop.",
      "Optimized FCP, LCP, and Speed Index through asset optimization and rendering improvements.",
      "Enhanced responsiveness, accessibility, and SEO to deliver a polished production-ready experience."
    ],
    tech: ["React", "Next.js", "TypeScript", "SEO", "Performance Optimization"],
    links: { live: "https://www.halohealth.ch/" },
    image: "/projects/halo-project2.png"
  },
  {
    title: "EduAtlas & WU",
    subtitle: "Full-Stack Academic Affinity Report System",
    context:
      "A Full-Stack Capstone project developed for EduAtlas & Westcliff University (WU). It addresses a specific administrative challenge: comparing international Bachelor's degree programs to determine academic compatibility. The system automates the analysis of degree durations, ECTS credits, credit ratios, and EQF levels to generate a calculated 'Affinity Score' and a downloadable PDF report.",
    achievements: [
      "Architected and built a complete full-stack system using React (Vite), Java, Spring Boot, and PostgreSQL.",
      "Engineered a custom Java parser (Apache POI) to transform complex Excel datasets into structured database records.",
      "Implemented a secure Admin Backoffice with JWT authentication and Role-Based Access Control (RBAC).",
      "Deployed the live application using Netlify for the frontend and Koyeb for backend hosting."
    ],
    tech: ["React", "Sass", "Bootstrap", "Java", "Spring Boot", "PostgreSQL", "JWT"],
    links: { github: "https://github.com/ivancroce/eduatlas-affinity-report", live: "https://eduatlas-affinity-report.netlify.app" },
    image: "/projects/eduatlas-project.png"
  },
  {
    title: "Epic Energy",
    subtitle: "Backend-Focused B2B CRM Platform",
    context:
      "A specialized B2B CRM platform for an energy provider, designed to manage client portfolios, invoicing, and territory data. Built during an intensive 5-day Agile sprint, I led the backend development, prioritizing data integrity and complex search capabilities over frontend aesthetics.",
    achievements: [
      "Led a small Agile team to deliver a functional full-stack MVP within a strict 5-day deadline.",
      "Engineered a custom Java data pipeline to batch-import and normalize thousands of Italian municipality records from inconsistent CSV sources.",
      "Implemented advanced search capabilities using Spring Data JPA Specifications to filter clients by revenue, location, and invoice status.",
      "Secured the platform using JWT authentication and role-based authorization, and built a proof-of-concept React dashboard to visualize backend data."
    ],
    tech: ["Java", "Spring Boot", "PostgreSQL", "JPA Specifications", "JWT", "React"],
    links: { github: "http://github.com/ivancroce/bw5-fullstack-epic-energy-app", live: "" },
    image: "/projects/epic-project.png"
  }
];

const Projects = () => {
  const headerVariants: Variants = textVariant(0.1);
  const titleVariants: Variants = textVariant(0.2);
  const descriptionVariants: Variants = fadeIn("", "tween", 0.1, 1);
  const projectCardVariants: Variants = fadeIn("up", "tween", 0.2, 1);
  const btnContainerVariants: Variants = fadeIn("up", "tween", 0.5, 1);

  return (
    <section className="py-5 overflow-hidden" id="projects">
      <div className="container py-5">
        <div className="text-center mb-5">
          <motion.h6
            variants={headerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="text-primary text-uppercase letter-spacing-2 mb-2"
          >
            Portfolio
          </motion.h6>
          <motion.h2 variants={titleVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="display-4 fw-bold">
            Featured Projects
          </motion.h2>
          <motion.p variants={descriptionVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="text-secondary mt-3">
            A selection of technical solutions focused on scalability, performance, and user experience.
          </motion.p>
        </div>

        <div className="d-flex flex-column projects-gap">
          {projects.map((project, index) => (
            <motion.div
              variants={projectCardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              key={index}
              className="row g-5"
            >
              {/* Image Column */}
              <div className={`col-xl-6 ${index % 2 !== 0 ? "order-xl-2" : "order-xl-1"}`}>
                <div className="project-image-container rounded-3 overflow-hidden position-relative h-100">
                  <a href={project.links.live || project.links.github} target="_blank" rel="noopener noreferrer" className="d-block w-100 h-100">
                    <img src={project.image} alt={project.title} className="project-img-custom" />
                  </a>
                </div>
              </div>
              {/* Content Column */}
              <div className={`col-xl-6 d-flex flex-column justify-content-center ${index % 2 !== 0 ? "order-xl-1" : "order-xl-2"}`}>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <h3 className="fw-bold mb-0">{project.title}</h3>
                  <span className="text-primary fs-5">===</span>
                  <div className="d-flex align-items-center gap-3">
                    {project.links.github ? (
                      <motion.a
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.2 }}
                        href={project.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-light hover-primary"
                        aria-label="GitHub"
                        title="View Source Code"
                      >
                        <FaGithub size={24} />
                      </motion.a>
                    ) : (
                      <span className="text-secondary opacity-25 cursor-not-allowed" title="Private Repository">
                        <FaGithub size={24} />
                      </span>
                    )}

                    <span className="text-primary fs-5">|</span>

                    {project.links.live ? (
                      <motion.a
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.2 }}
                        href={project.links.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-light hover-primary"
                        aria-label="Live"
                        title="View Live Site"
                      >
                        <FaExternalLinkAlt size={22} />
                      </motion.a>
                    ) : (
                      <span className="text-secondary opacity-25 cursor-not-allowed" title="Not Deployed">
                        <FaExternalLinkAlt size={24} />
                      </span>
                    )}
                  </div>
                </div>
                <h5 className="h6 text-primary mb-4">{project.subtitle}</h5>

                <div className="mb-4 text-secondary">
                  <p className="mb-4 text-justify text-relaxed">{project.context}</p>
                  <ul className="list-unstyled">
                    {project.achievements.map((achievement, i) => (
                      <li key={i} className="mb-2 d-flex align-items-start">
                        <span className="text-primary me-2">•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="d-flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech, index) => (
                    <span key={index} className="badge rounded-pill bg-dark-glass text-secondary border border-secondary fw-normal px-3 py-2">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={btnContainerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mt-5 pt-5">
          <p className="text-secondary mb-4">Interested in seeing more? Check out my GitHub</p>
          <a
            href="https://github.com/ivancroce"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary rounded-pill px-5 py-3 hover-effect text-uppercase letter-spacing-2 text-decoration-none d-inline-flex align-items-center gap-2"
          >
            <span>More Projects</span>
            <FaGithub size={20} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
