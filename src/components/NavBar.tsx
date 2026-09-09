import type { Page } from "@/config/navigation";
import { NAV_ITEMS, WORDMARK } from "@/config/navigation";

type NavBarProps = {
  onNav: (item: string) => void;
  activePage: Page;
};

/** Which page each nav item highlights on. Items that aren't routes are absent. */
const ACTIVE_PAGE: Partial<Record<(typeof NAV_ITEMS)[number], Page>> = {
  About: "about",
  Contact: "connect",
};

export default function NavBar({ onNav, activePage }: NavBarProps) {
  return (
    <nav className="shared-nav">
      <p className="shared-nav-name" onClick={() => onNav("home")}>
        {WORDMARK}
      </p>

      <div className="shared-nav-links">
        {NAV_ITEMS.map((item) => (
          <p
            key={item}
            onClick={() => onNav(item)}
            className={
              ACTIVE_PAGE[item] === activePage
                ? "shared-nav-link shared-nav-link--active"
                : "shared-nav-link"
            }
          >
            {item}
          </p>
        ))}
      </div>
    </nav>
  );
}
