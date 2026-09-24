/** A row of dots that resolves into an arrowhead: the one graphic motif used across the app. */
export default function Mark({ className = '' }) {
  const dots = [];
  // tail
  [8, 25, 42].forEach((x) => dots.push([x, 50]));
  // arrowhead: columns of 5, 4, 3, 2, 1 dots
  for (let c = 0; c < 5; c += 1) {
    const count = 5 - c;
    for (let i = 0; i < count; i += 1) {
      dots.push([59 + c * 17, 50 + (i - (count - 1) / 2) * 16]);
    }
  }
  return (
    <svg className={className} viewBox="0 0 140 100" role="img" aria-label="Arrow made of dots" fill="currentColor">
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" />
      ))}
    </svg>
  );
}
