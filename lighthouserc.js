module.exports = {
  ci: {
    collect: {
      // The workflow builds but doesn't serve; start (and wait for) the server
      // here so Lighthouse has something to load instead of a Chrome interstitial.
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 60000,
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
