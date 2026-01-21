export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-8">
        <h1
          className="text-2xl md:text-4xl"
          style={{ fontFamily: 'var(--font-pixel)', color: 'var(--color-primary)' }}
        >
          THE GUILD
        </h1>

        <p
          className="max-w-md text-sm md:text-base"
          style={{ color: 'var(--color-muted)' }}
        >
          Apprentice under winning bettors.
          <br />
          Learn how they think.
          <br />
          Build your edge.
        </p>

        <div className="flex flex-col gap-4 mt-8">
          <div
            className="rounded-lg p-6 card-glow transition-all duration-200"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-secondary)'
            }}
          >
            <p
              className="text-xs mb-2"
              style={{ fontFamily: 'var(--font-pixel)', color: 'var(--color-accent)' }}
            >
              COMING SOON
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text)' }}>
              Track records don&apos;t lie. Gurus do.
            </p>
          </div>
        </div>

        <p
          className="text-xs mt-12"
          style={{ color: 'var(--color-muted)' }}
        >
          &quot;The house always wins. Join the house.&quot;
        </p>
      </div>
    </main>
  );
}
