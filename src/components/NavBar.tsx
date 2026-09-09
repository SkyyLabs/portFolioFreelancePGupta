import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS, ROUTES, WORDMARK } from "@/config/navigation";

type NavBarProps = {
  /** Handles the items that don't map to a route: Resume opens a PDF, My Work scrolls. */
  onNav: (label: string) => void;
};

export default function NavBar({ onNav }: NavBarProps) {
  const { pathname } = useLocation();

  return (
    <nav className="shared-nav">
      <Link className="shared-nav-name" to={ROUTES.home}>
        {WORDMARK}
      </Link>

      <div className="shared-nav-links">
        {NAV_ITEMS.map(({ label, to }) => {
          // "My Work" points home but scrolls to a section, so it is never the
          // active item — the home route belongs to the wordmark.
          const isActive = to !== null && to !== ROUTES.home && pathname === to;
          const className = isActive
            ? "shared-nav-link shared-nav-link--active"
            : "shared-nav-link";

          return to && to !== ROUTES.home ? (
            <Link
              key={label}
              className={className}
              to={to}
              aria-current={isActive ? "page" : undefined}
            >
              {label}
            </Link>
          ) : (
            <span key={label} className={className} onClick={() => onNav(label)}>
              {label}
            </span>
          );
        })}
      </div>
    </nav>
  );
}
