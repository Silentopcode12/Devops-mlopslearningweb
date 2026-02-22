import { useState } from 'react';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const topics = ['DevOps', 'FinOps', 'MLOps', 'SRE', 'Cybersecurity'];

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: topics[0],
    message: ''
  });
  const [status, setStatus] = useState('');

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');

    try {
      const response = await fetch(`${apiBase}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setStatus('Message sent successfully.');
      setFormData({ name: '', email: '', topic: topics[0], message: '' });
    } catch (error) {
      setStatus('Failed to send. Please try again.');
    }
  };

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <h3>Contact</h3>
      <input name="name" value={formData.name} onChange={onChange} placeholder="Name" required />
      <input name="email" type="email" value={formData.email} onChange={onChange} placeholder="Email" required />
      <select name="topic" value={formData.topic} onChange={onChange}>
        {topics.map((topic) => (
          <option key={topic} value={topic}>
            {topic}
          </option>
        ))}
      </select>
      <textarea
        name="message"
        value={formData.message}
        onChange={onChange}
        placeholder="How can I help?"
        rows={4}
        required
      />
      <button type="submit">Send</button>
      <p className="status">{status}</p>
    </form>
  );
}
