import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";

export interface FeatureTab {
  id: string;
  icon: string;
  heading: string;
  description: string;
  points?: string[];
  visual: ReactNode;
}

const CheckIcon = (
  <svg
    className="feature-tabs__check"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

interface Props {
  tabs: FeatureTab[];
}

const ICONS: Record<string, ReactNode> = {
  zap: (
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  ),
  "pen-line": (
    <>
      <path d="M12 20h9" />
      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
    </>
  ),
  "trending-up": (
    <>
      <path d="M16 7h6v6" />
      <path d="m22 7-8.5 8.5-5-5L2 17" />
    </>
  ),
};

function TabIcon({ name }: { name: string }) {
  return (
    <svg
      className="feature-tabs__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name] ?? null}
    </svg>
  );
}

export default function FeatureTabs({ tabs }: Props) {
  const [active, setActive] = useState(0);
  const activeTab = useMemo(() => tabs[active] ?? tabs[0], [tabs, active]);

  if (!tabs.length) return null;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    setActive((current) => {
      const delta = event.key === "ArrowRight" ? 1 : -1;
      return (current + delta + tabs.length) % tabs.length;
    });
  }

  return (
    <section className="feature-tabs">
      <div
        className="feature-tabs__list"
        role="tablist"
        aria-label="Feature tabs"
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-controls={`panel-${tab.id}`}
            tabIndex={index === active ? 0 : -1}
            className={`feature-tabs__tab ${index === active ? "is-active" : ""}`}
            onClick={() => setActive(index)}
          >
            <span className="feature-tabs__tab-icon">
              <TabIcon name={tab.icon} />
            </span>
            <span className="feature-tabs__tab-label">{tab.heading}</span>
          </button>
        ))}
      </div>

      <div
        id={`panel-${activeTab.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab.id}`}
        className="feature-tabs__panel"
        tabIndex={0}
      >
        <div className="feature-tabs__content">
          <h3 className="feature-tabs__heading">{activeTab.heading}</h3>
          <p className="feature-tabs__description">{activeTab.description}</p>
          {activeTab.points && activeTab.points.length > 0 && (
            <ul className="feature-tabs__points">
              {activeTab.points.map((point) => (
                <li key={point}>
                  {CheckIcon}
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="feature-tabs__window" aria-hidden="true">
          <div className="feature-tabs__window-bar">
            <span />
            <span />
            <span />
          </div>
          <pre className="feature-tabs__visual">{activeTab.visual}</pre>
        </div>
      </div>
    </section>
  );
}
