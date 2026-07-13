const emojis = ['🍟', '🍝', '🥪', '🥤'];

export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '28px',
        background: 'var(--panel-dark)',
      }}
    >
      <div style={{ display: 'flex', gap: '18px' }}>
        {emojis.map((emoji, i) => (
          <span
            key={emoji}
            style={{
              fontSize: '2.2rem',
              display: 'inline-block',
              animation: `london-loading-bounce 1.1s ease-in-out ${i * 0.15}s infinite`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: '1.05rem',
          color: 'var(--on-dark)',
          opacity: 0.75,
          letterSpacing: '0.02em',
        }}
      >
        Plating up something good&hellip;
      </p>
      <style>{`
        @keyframes london-loading-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.55; }
          40%      { transform: translateY(-14px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
