import React from 'react';
import LiveNEOBrowse from '../../components/LiveNEOBrowse';
import LiveNEOFeed from '../../components/LiveNEOFeed';

export default {
  title: 'Live',
};

export const Browse = () => <LiveNEOBrowse />;

export const Feed = () => <LiveNEOFeed />;

// Simple instructions story to explain env var usage
export const HowTo = () => (
  <div style={{ padding: 12 }}>
    <h3>Live Stories</h3>
    <p>These stories call the backend API configured via <strong>VITE_API_BASE_URL</strong>.</p>
    <p>Set your frontend <code>.env</code> to point to your running backend, for example:</p>
    <pre style={{ background: '#f7f7f7', padding: 8 }}>VITE_API_BASE_URL=http://localhost:3001</pre>
  </div>
);
