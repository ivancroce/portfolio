const Footer = () => {
  return (
    <footer className="bg-darker py-4">
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-secondary small border-top border-secondary border-opacity-25 pt-5">
          <div className="mb-3 mb-md-0">&copy; 2026 Ivan Croce</div>

          <div className="d-flex gap-4">
            <a href="#about" className="text-secondary text-decoration-none hover-primary">
              About
            </a>

            <a href="#tech-stack" className="text-secondary text-decoration-none hover-primary">
              Tech Stack
            </a>

            <a href="#projects" className="text-secondary text-decoration-none hover-primary">
              Projects
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
