// Placeholder home page. The full designed landing page (hero, hypothesis,
// phases, pricing) already exists as a static HTML artifact — port its
// markup/CSS here, or keep this route lightweight and serve the marketing
// site separately. Either works; this just needs *something* at "/".
export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: '80px auto', fontFamily: 'Georgia, serif', textAlign: 'center' }}>
      <h1>Srpska Zemlja</h1>
      <p>One square meter, held for the return.</p>
      <p>
        <a href="/reserve">Reserve your ground</a> &nbsp;·&nbsp; <a href="/dashboard">My ground</a>
      </p>
    </main>
  );
}
