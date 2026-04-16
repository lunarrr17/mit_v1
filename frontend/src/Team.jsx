import { useState } from 'react';
import './Team.css';

const teamData = [
  { name: "Swarali Patil", department: "ENGINEERING" },
  { name: "Aswathi Pillai", department: "ENGINEERING" },
  { name: "Rohan Shelke", department: "ENGINEERING" },
  { name: "Dhruval Porwal", department: "LEADERSHIP" },
  { name: "Pranav Mahajan", department: "LEADERSHIP" }
];

const filters = ["LEADERSHIP", "ENGINEERING"];

const Team = () => {
  const [activeFilter, setActiveFilter] = useState("LEADERSHIP");
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
        <h2 className="team-header">Meet Our Team</h2>
        
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
          <span className="dot"></span> CORE MEMBERS
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
