import { useEffect, useState } from 'react';
import ContactForm from './components/ContactForm';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const profileImage = '/shresh.jpg';

const tracks = [
  {
    title: 'DevOps Foundations',
    level: 'Beginner to Intermediate',
    modules: ['CI/CD Pipelines', 'Infrastructure as Code', 'Container Basics']
  },
  {
    title: 'FinOps in Practice',
    level: 'Intermediate',
    modules: ['Cloud Cost Visibility', 'Budget Guardrails', 'Optimization Playbooks']
  },
  {
    title: 'MLOps Delivery',
    level: 'Intermediate to Advanced',
    modules: ['Model Versioning', 'Automated Deployment', 'Model Monitoring']
  },
  {
    title: 'SRE and Reliability',
    level: 'Intermediate to Advanced',
    modules: ['SLIs/SLOs', 'Error Budgets', 'Incident Response']
  }
];

export default function App() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch(`${apiBase}/api/articles`)
      .then((res) => res.json())
      .then((data) => setArticles(data))
      .catch(() => setArticles([]));
  }, []);

  return (
    <div className="site-shell">
      <header className="hero">
        <div className="hero-content stack">
          <div>
            <p className="tag">Shresh Learning Platform</p>
            <h1>Learn Cloud-Native Engineering with Real-World Playbooks</h1>
            <p>
              Structured learning paths across DevOps, FinOps, MLOps, SRE, and Cybersecurity with hands-on cloud
              workflows.
            </p>
            <div className="chips">
              <span>Project-Based</span>
              <span>Interview Ready</span>
              <span>GCP + Kubernetes</span>
            </div>
          </div>

          <aside className="profile-card">
            <img src={profileImage} alt="Shresh profile" />
            <h3>Shresh</h3>
            <p>Cloud Native Mentor</p>
            <small>Add your image at `frontend/public/shresh.jpg`</small>
          </aside>
        </div>
      </header>

      <main className="container">
        <section>
          <h2>Learning Tracks</h2>
          <div className="track-grid">
            {tracks.map((track) => (
              <article className="track-card" key={track.title}>
                <small>{track.level}</small>
                <h3>{track.title}</h3>
                <ul>
                  {track.modules.map((module) => (
                    <li key={module}>{module}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2>Featured Lessons</h2>
          <div className="grid">
            {articles.map((article) => (
              <article key={article.id} className="card">
                <small>{article.category}</small>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="two-col">
          <div className="card">
            <h2>Learning Roadmap</h2>
            <p>
              Start with DevOps fundamentals, move into cloud cost governance, adopt reliable SRE workflows, and
              finally secure your delivery pipelines with practical cybersecurity controls.
            </p>
            <p>Each module includes architecture notes, implementation steps, and production troubleshooting tips.</p>
          </div>
          <ContactForm />
        </section>
      </main>
    </div>
  );
}
