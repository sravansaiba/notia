'use client';
import Link from 'next/link';
import { notia } from 'notia';
function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
export default function Home() {
  return (
    <>
      <section className="hero section-width">
        <div className="hero-copy">
          <Link className="eyebrow-badge" href="/docs/releases">
            <span className="status-dot" /> INTRODUCING NOTIA{' '}
            <span className="badge-divider">/</span> v0.1.1 <Arrow />
          </Link>
          <h1>
            A little feedback.
            <br />A lasting <span>impression.</span>
          </h1>
          <p className="hero-description">
            Meet the toast library with a little more personality.
            <br className="desktop-break" /> Beautifully simple notifications
            for React & Next.js.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/docs">
              Start building <Arrow />
            </Link>
            <button
              className="button button-quiet"
              onClick={() =>
                notia.success('Your work, saved.', {
                  description: 'One less thing to think about.',
                })
              }
            >
              <span className="play-icon" aria-hidden="true">
                ▷
              </span>{' '}
              Give it a toast
            </button>
          </div>
          <div className="hero-footnote">
            <span aria-hidden="true">✳</span> Small by design. Thoughtful by
            default.
          </div>
        </div>
        <div
          className="hero-art"
          aria-label="Preview of Notia notification styling"
        >
          <div className="art-grid" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="art-label">
            <span className="status-dot" /> A MOMENT OF CLARITY
          </div>
          <div className="preview-card preview-card-back">
            <span className="preview-symbol">i</span>
            <div>
              <strong>A little heads-up.</strong>
              <p>You’re right where you need to be.</p>
            </div>
          </div>
          <div className="preview-card preview-card-front">
            <span className="preview-symbol success-symbol">✓</span>
            <div>
              <strong>Your work, saved.</strong>
              <p>One less thing to think about.</p>
            </div>
            <span className="preview-close" aria-hidden="true">
              ×
            </span>
          </div>
          <span className="annotation annotation-top">
            the details make the difference <span aria-hidden="true">↘</span>
          </span>
          <span className="annotation annotation-bottom">
            <span aria-hidden="true">↖</span> feedback that feels right.
          </span>
          <div className="art-footer">
            <span>BUILT TO FIT YOUR FLOW</span>
            <span aria-hidden="true">✦</span>
            <span>NOT INTERRUPT IT</span>
          </div>
        </div>
      </section>
      <div className="qualities section-width">
        <span>
          <span aria-hidden="true">◈</span> Zero runtime dependencies
        </span>
        <span>
          <span aria-hidden="true">⌘</span> TypeScript native
        </span>
        <span>
          <span aria-hidden="true">◎</span> Accessibility built in
        </span>
        <span>
          <span aria-hidden="true">↔</span> Yours to customize
        </span>
      </div>
      <section className="details-section section-width">
        <p className="kicker">THOUGHTFUL IN EVERY STATE.</p>
        <div className="feature-grid">
          <article>
            <span className="feature-icon" aria-hidden="true">
              ◎
            </span>
            <h2>Everyone gets the message.</h2>
            <p>
              Screen reader announcements, keyboard controls, and respect for
              reduced motion. Considered from the first line.
            </p>
          </article>
          <article>
            <span className="feature-icon" aria-hidden="true">
              ⌁
            </span>
            <h2>Fits right into your world.</h2>
            <p>
              Light, dark, or somewhere in between. Shape Notia with CSS
              variables. No styling framework required.
            </p>
          </article>
          <article>
            <span className="feature-icon" aria-hidden="true">
              ⤴
            </span>
            <h2>Small package. Full presence.</h2>
            <p>
              No extra runtime dependencies. A focused API and a tiny custom
              store, built to stay out of your way.
            </p>
          </article>
        </div>
      </section>
      <section className="home-cta section-width">
        <div>
          <p className="kicker">SMALL NOTIFICATIONS. CLEAR FEEDBACK.</p>
          <h2>
            A little more personality.
            <br />A lot less setup.
          </h2>
        </div>
        <div className="hero-actions">
          <Link className="button button-primary" href="/docs">
            Read the docs <Arrow />
          </Link>
          <Link className="button button-outline" href="/playground">
            Open playground <Arrow />
          </Link>
        </div>
      </section>
    </>
  );
}
