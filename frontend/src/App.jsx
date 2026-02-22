import { useEffect, useState } from 'react';
import ContactForm from './components/ContactForm';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function App() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch(`${apiBase}/api/articles`)
      .then((res) => res.json())
      .then((data) => setArticles(data))
      .catch(() => setArticles([]));
  }, []);

  return (
    <div>
      <header className="hero">
        <div className="overlay" />
        <div className="hero-content">
          <p className="tag">Shresh | Cloud Native Engineer</p>
          <h1>Build Reliable, Secure, and Cost-Efficient Cloud Platforms</h1>
          <p>
            Practical insights on DevOps, FinOps, MLOps, SRE, and Cybersecurity for modern engineering teams.
          </p>
        </div>
      </header>

      <main className="container">
        <section>
          <h2>Focus Areas</h2>
          <div className="chips">
            <span>DevOps</span>
            <span>FinOps</span>
            <span>MLOps</span>
            <span>SRE</span>
            <span>Cybersecurity</span>
          </div>
        </section>

        <section>
          <h2>Latest Insights</h2>
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
            <h2>About</h2>
            <p>
              This platform uses AI-generated visual assets and focuses on cloud-native practices, automation,
              reliability, governance, and platform security.
            </p>
          </div>
          <ContactForm />
        </section>
      </main>
    </div>
  );
}
