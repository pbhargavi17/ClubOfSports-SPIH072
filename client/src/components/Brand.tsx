// Floodlit Clubhouse reminder: use the open court-line C as a confident, visible anchor.
import { Link } from "wouter";

const markUrl = "/manus-storage/clubofsports-mark_cf902f2e.png";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand-mark" aria-label="ClubOfSports home">
      <span className="brand-symbol" aria-hidden="true">
        <img src={markUrl} alt="" />
        <i className="brand-arc brand-arc-one" />
        <i className="brand-arc brand-arc-two" />
        <b className="brand-point" />
      </span>
      {!compact && <span className="brand-word">CLUB<span>OF</span>SPORTS</span>}
    </Link>
  );
}

export { markUrl };
