import { FloralCorner, TeddyBear, HeartDivider } from './Motifs';

export function Header() {
  return (
    <header className="header">
      <FloralCorner className="floral left" />
      <FloralCorner className="floral right" />
      <div className="eyebrow">a little gift list</div>
      <h1 className="script">Baby Registry</h1>
      <TeddyBear className="teddy" />
      <p className="sub">
        Pick something small to welcome someone very small.
      </p>
      <HeartDivider />
    </header>
  );
}
