import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertCircle,
  Bell,
  ChartLine,
  FileText,
  LogOut,
  MapPinned,
  Settings,
  TriangleAlert,
  UserRound,
} from 'lucide-react';
import './Pages.css';
import '../AdminDashboardPage.css';

const METRICS = [
  { label: 'TOTAL SCREENINGS', value: '42.8M', growth: '+12.5%', tone: 'up' },
  { label: 'HIGH RISK CASES', value: '14.2%', growth: '-4.2%', tone: 'down' },
  { label: 'ACTIVE REGIONS', value: '36/36', growth: 'Stable', tone: 'stable' },
];

const REGIONAL_ANALYSIS = [
  { state: 'Uttar Pradesh', screenings: 1320000, severe: 43000 },
  { state: 'Bihar', screenings: 880000, severe: 37000 },
  { state: 'Madhya Pradesh', screenings: 740000, severe: 30000 },
  { state: 'Maharashtra', screenings: 1180000, severe: 25000 },
  { state: 'Rajasthan', screenings: 630000, severe: 21000 },
  { state: 'West Bengal', screenings: 800000, severe: 18000 },
];

const NATIONAL_TRENDS = [
  { month: 'Jan', stunting: 17.6, wasting: 7.4 },
  { month: 'Feb', stunting: 17.4, wasting: 7.1 },
  { month: 'Mar', stunting: 17.2, wasting: 6.8 },
  { month: 'Apr', stunting: 16.9, wasting: 6.4 },
  { month: 'May', stunting: 16.8, wasting: 6.2 },
  { month: 'Jun', stunting: 16.5, wasting: 6.0 },
];

const SCREENING_INTELLIGENCE = [
  {
    region: 'Bihar',
    city: 'Patna',
    date: '2026-03-16',
    impacted: 450,
    severity: 'High',
  },
  {
    region: 'Uttar Pradesh',
    city: 'Lucknow',
    date: '2026-03-14',
    impacted: 820,
    severity: 'Critical',
  },
  {
    region: 'Madhya Pradesh',
    city: 'Indore',
    date: '2026-03-12',
    impacted: 310,
    severity: 'Moderate',
  },
  {
    region: 'Maharashtra',
    city: 'Pune',
    date: '2026-03-10',
    impacted: 120,
    severity: 'Low',
  },
];

const reportsTable = SCREENING_INTELLIGENCE.map((item, idx) => ({
  id: `NS-26-${101 + idx}`,
  location: `${item.region} - ${item.city}`,
  severity: item.severity,
  impacted: item.impacted,
  date: item.date,
}));

const AdminDashboardPage = () => {
  return (
    <main className="gov-dashboard-shell">
      <aside className="gov-sidebar">
        <div className="gov-brand">
          <p>MWCD INDIA</p>
          <span>National Monitor</span>
        </div>
        <nav className="gov-nav">
          <button className="active"><ChartLine size={16} />Overview</button>
          <button><MapPinned size={16} />Regional</button>
          <button><AlertCircle size={16} />Statistics</button>
          <button><TriangleAlert size={16} />Hotspots</button>
          <button><FileText size={16} />Reports</button>
        </nav>
        <div className="gov-sidebar-footer">
          <button><Settings size={16} />Settings</button>
          <button><LogOut size={16} />Logout</button>
        </div>
      </aside>

      <section className="gov-main">
        <header className="gov-topbar">
          <div className="gov-title-wrap">
            <h1>INDIA HEALTH & NUTRITION</h1>
            <p>NATIONAL MONITORING DASHBOARD</p>
          </div>
          <div className="period-switch">
            <span>PERIOD:</span>
            <button className="active">2022</button>
            <button>2023</button>
            <button>2024</button>
          </div>
          <div className="user-strip">
            <button className="icon-btn"><Bell size={17} /></button>
            <div className="user-block">
              <strong>ANJALI SHARMA</strong>
              <span>ADMIN - NORTH</span>
            </div>
            <button className="icon-btn"><UserRound size={17} /></button>
          </div>
        </header>

        <div className="gov-content-grid">
          <section className="gov-primary">
            <article className="hero-panel">
              <h2>NATIONAL CENSUS OVERVIEW</h2>
              <p>FISCAL YEAR ANALYSIS • NFHS-6 INTERIM REPORT</p>

              <div className="advisory-card">
                <h4>URGENT ADVISORY</h4>
                <p>
                  Central India exhibits a 4.2% spike in critical malnutrition cases.
                  Integrated Child Development Services (ICDS) mobilized for phase 1 outreach.
                </p>
              </div>

              <div className="metric-grid">
                {METRICS.map((metric) => (
                  <div key={metric.label} className="metric-box">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <p className={`growth ${metric.tone}`}>{metric.growth} growth rate</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel-card">
              <div className="panel-head-row">
                <h3>NATIONAL TRENDS</h3>
                <div className="chart-legend">
                  <span><i className="dot dark" />Stunting</span>
                  <span><i className="dot purple" />Wasting</span>
                </div>
              </div>
              <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={NATIONAL_TRENDS} margin={{ left: -16, right: 12, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="stunting" stroke="#0b1736" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="wasting" stroke="#c026d3" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="panel-card">
              <h3>REGIONAL ANALYSIS</h3>
              <p className="chart-subtitle">SCREENING LOAD DISTRIBUTION</p>
              <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={REGIONAL_ANALYSIS} layout="vertical" margin={{ left: 24, right: 12, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis dataKey="state" type="category" width={120} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="screenings" fill="#0b1736" barSize={16} radius={[0, 8, 8, 0]} />
                    <Bar dataKey="severe" fill="#c026d3" barSize={6} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <aside className="gov-secondary">
            <article className="panel-card slim">
              <div className="panel-head-row">
                <h3>RECENT SCREENING INTELLIGENCE</h3>
              </div>
              <div className="intel-list">
                {SCREENING_INTELLIGENCE.map((item, idx) => (
                  <div key={`${item.region}-${idx}`} className="intel-item">
                    <div>
                      <strong>{item.region} • {item.city}</strong>
                      <p>{item.date} · {item.impacted} impacted</p>
                    </div>
                    <span className={`severity ${item.severity.toLowerCase()}`}>{item.severity}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel-card dark">
              <h3>ACTIVE PROGRAMS</h3>
              <div className="program-item">
                <strong>PM-POSHAN</strong>
                <p>Providing nutritious meals to 11.8Cr children nationwide.</p>
              </div>
              <div className="program-item">
                <strong>ICDS OUTREACH</strong>
                <p>Currently reaching 88% of target population in high-risk zones.</p>
              </div>
              <button className="program-btn">INITIATE PROGRAM</button>
            </article>

            <article className="panel-card slim">
              <h3>REPORTS SECTION</h3>
              <div className="reports-grid-head">
                <span>Report ID</span>
                <span>Location</span>
                <span>Severity</span>
                <span>Impacted</span>
              </div>
              {reportsTable.map((row) => (
                <div key={row.id} className="reports-grid-row">
                  <span>{row.id}</span>
                  <span>{row.location}</span>
                  <span className={`severity ${row.severity.toLowerCase()}`}>{row.severity}</span>
                  <span>{row.impacted}</span>
                </div>
              ))}
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboardPage;

