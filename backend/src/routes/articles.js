const express = require('express');

const router = express.Router();

const articles = [
  {
    id: 1,
    category: 'DevOps',
    title: 'Platform Engineering as a Product',
    summary: 'How to treat internal developer platforms like user-centric products.'
  },
  {
    id: 2,
    category: 'FinOps',
    title: 'Cost Guardrails in Kubernetes',
    summary: 'Practical techniques to control cloud spend without slowing delivery.'
  },
  {
    id: 3,
    category: 'MLOps',
    title: 'From Model Registry to Reliable Deployments',
    summary: 'A pragmatic MLOps workflow for CI/CD and model observability.'
  },
  {
    id: 4,
    category: 'SRE',
    title: 'SLOs that Actually Drive Decisions',
    summary: 'Error budgets, alerting, and on-call practices that reduce noise.'
  },
  {
    id: 5,
    category: 'Cybersecurity',
    title: 'Shift-Left Security in Cloud Native Pipelines',
    summary: 'Embedding checks early in CI/CD to reduce late-stage vulnerabilities.'
  }
];

router.get('/', (req, res) => {
  res.json(articles);
});

module.exports = router;
