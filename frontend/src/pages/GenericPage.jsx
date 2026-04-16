import './Pages.css';

const GenericPage = ({ title, subtitle }) => {
  return (
    <section className="page-shell">
      <div className="page-card fade-in-up visible">
        <p className="page-kicker">NutriScan Ecosystem</p>
        <h1>{title}</h1>
        <p>This section is currently under development. NutriScan is dedicated to building comprehensive AI tools backed by high-fidelity models for precise child malnutrition detection. Please check back later for detailed technical papers and impact metrics.</p>
      </div>
    </section>
  );
};

export default GenericPage;
