import { useEffect, useState } from 'react';
import ContactForm from './components/ContactForm';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const profileImage = '/shresh.jpg';
const heroAiImage =
  'https://image.pollinations.ai/prompt/futuristic%20cloud%20native%20learning%20platform%20dashboard%20with%20kubernetes%20devops%20cybersecurity%20cinematic%20lighting%20high%20detail?width=1400&height=900&seed=3001';
const aiGallery = [
  'https://image.pollinations.ai/prompt/devops%20engineer%20working%20on%20multi%20screen%20kubernetes%20monitoring%20setup%20ultra%20realistic?width=900&height=600&seed=3101',
  'https://image.pollinations.ai/prompt/mlops%20pipeline%20architecture%20with%20model%20deployment%20and%20observability%20dark%20theme%20cinematic?width=900&height=600&seed=3102',
  'https://image.pollinations.ai/prompt/finops%20cloud%20cost%20optimization%20analytics%20dashboard%20professional%20ui%20high%20detail?width=900&height=600&seed=3103'
];

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
        <img className="hero-ai" src={heroAiImage} alt="AI cloud learning banner" />
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
            {articles.map((article, index) => (
              <article key={article.id} className="card">
                <img className="lesson-image" src={aiGallery[index % aiGallery.length]} alt={article.title} />
                <small>{article.category}</small>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2>AI Visual Lab</h2>
          <div className="ai-grid">
            {aiGallery.map((image, index) => (
              <article key={image} className="ai-card">
                <img src={image} alt={`AI generated cloud visual ${index + 1}`} />
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
