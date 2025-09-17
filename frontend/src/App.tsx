import React, { useState } from 'react';

interface ReportRow {
  page_url: string;
  h1: string;
  first_paragraph: string;
  outgoing_link_urls: string;
  image_urls: string;
}

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [maxConcurrency, setMaxConcurrency] = useState(5);
  const [maxPages, setMaxPages] = useState(100);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportRow[]>([]);
  const [error, setError] = useState('');

  // Placeholder for triggering the backend crawl and fetching CSV
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setReport([]);
    try {
  const response = await fetch(`http://localhost:8080/api/crawl?url=${encodeURIComponent(url)}&maxConcurrency=${maxConcurrency}&maxPages=${maxPages}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      const csv = await response.text();
      const rows = csv.trim().split('\n').map(line => line.split(','));
      const [header, ...data] = rows;
      setReport(data.map(row => Object.fromEntries(header.map((h, i) => [h, row[i]])) as unknown as ReportRow));
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div style={{ maxWidth: 1200, margin: '2rem 0 2rem 2rem', fontFamily: 'sans-serif' }}>
      <h1>goScraper Frontend</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <label>Website URL: <input type="url" value={url} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)} required style={{ width: 300 }} /></label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Max Concurrency: <input type="number" min={1} max={20} value={maxConcurrency} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxConcurrency(Number(e.target.value))} /></label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Max Pages: <input type="number" min={1} max={1000} value={maxPages} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxPages(Number(e.target.value))} /></label>
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Crawling...' : 'Start Crawl'}</button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      {report.length > 0 && (
        <div style={{ overflowX: 'auto', marginBottom: 24 }}>
          <table border={1} cellPadding={6} style={{ borderCollapse: 'collapse', minWidth: 900, width: '100%' }}>
            <thead style={{ background: '#f5f5f5' }}>
              <tr>
                <th style={{ minWidth: 180 }}>Page URL</th>
                <th style={{ minWidth: 120 }}>H1</th>
                <th style={{ minWidth: 180 }}>First Paragraph</th>
                <th style={{ minWidth: 180 }}>Outgoing Links</th>
                <th style={{ minWidth: 320 }}>Image URLs</th>
              </tr>
            </thead>
            <tbody>
              {report.map((row, i) => (
                <tr key={i}>
                  <td style={{ wordBreak: 'break-all' }}>{row.page_url}</td>
                  <td style={{ wordBreak: 'break-all' }}>{row.h1}</td>
                  <td style={{ wordBreak: 'break-all' }}>{row.first_paragraph}</td>
                  <td style={{ wordBreak: 'break-all' }}>{row.outgoing_link_urls}</td>
                  <td style={{ wordBreak: 'break-all', minWidth: 320 }}>{row.image_urls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default App;
