const Footer = () => {
  return (
    <footer className="bg-darker py-4">
      <div className="container">
        <div className="border-top border-secondary border-opacity-25 pt-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-secondary small gap-3">
            <nav className="d-flex gap-4" aria-label="Footer navigation">
              <a href="#about" className="text-secondary text-decoration-none hover-primary">
                About
              </a>

              <a href="#tech-stack" className="text-secondary text-decoration-none hover-primary">
                Tech Stack
              </a>

              <a href="#projects" className="text-secondary text-decoration-none hover-primary">
                Projects
              </a>
            </nav>

            <div className="text-center text-md-end">&copy; 2026 Ivan Croce</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
