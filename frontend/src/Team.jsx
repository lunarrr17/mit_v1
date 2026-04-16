import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import './Team.css';

const Team = () => {
  const { t } = useTranslation();

  const teamData = [
    { name: "Swarali Patil", department: t("team.lead") },
    { name: "Aswathi Pillai", department: t("team.eng") },
    { name: "Rohan Shelke", department: t("team.eng") },
    { name: "Dhruval Porwal", department: t("team.lead") },
    { name: "Pranav Mahajan", department: t("team.lead") }
  ];

  const filters = [t("team.lead"), t("team.eng")];

  const [activeFilter, setActiveFilter] = useState(t("team.lead"));
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFilterClick = (filter) => {
    if (filter === activeFilter) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveFilter(filter);
      setIsAnimating(false);
    }, 300);
  };

  const filteredTeam = teamData.filter(member => member.department === activeFilter);

  return (
    <section className="team-section">
      <div className="team-container">
        <h2 className="team-header">{t("team.title")}</h2>

        <div className="filter-row">
          {filters.map(filter => (
            <button
              key={filter}
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => handleFilterClick(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="core-label">
          <span className="dot"></span> {t("team.core")}
        </div>

        <div className={`team-list ${isAnimating ? 'fade-out' : 'fade-in'}`}>
          {filteredTeam.map((member, index) => (
            <div className="team-member-row" key={index}>
              <h3 className="member-name">{member.name}</h3>
              <div className="member-thumbnail">
                {/* using a placeholder visual */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
