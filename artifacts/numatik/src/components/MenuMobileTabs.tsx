import {
  BookMarked,
  Ellipsis,
  Home,
  MessageSquare,
  Rocket,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";

export type MenuMobileNavigationTab = "home" | "reference" | "about" | "feedback" | "more";

const TAB_ITEMS: ReadonlyArray<{
  id: MenuMobileNavigationTab;
  icon: LucideIcon;
  labelKey: string;
  ariaLabelKey?: string;
}> = [
  { id: "home", icon: Home, labelKey: "menu.homeTab" },
  { id: "reference", icon: BookMarked, labelKey: "menu.mobileReferenceTab", ariaLabelKey: "menuItems.reference.label" },
  { id: "about", icon: Rocket, labelKey: "menu.mobileAboutTab", ariaLabelKey: "menuItems.about.label" },
  { id: "feedback", icon: MessageSquare, labelKey: "menu.mobileFeedbackTab", ariaLabelKey: "menuItems.kritikSaran.label" },
  { id: "more", icon: Ellipsis, labelKey: "menu.moreTab" },
];

type MenuMobileTabsProps = {
  activeTab: MenuMobileNavigationTab | null;
  onSelect: (tab: MenuMobileNavigationTab) => void;
  className?: string;
};

const MenuMobileTabs = ({ activeTab, onSelect, className = "" }: MenuMobileTabsProps) => {
  const { t } = useTranslation();

  return (
    <nav className={`menu-mobile-tabs${className ? ` ${className}` : ""}`} aria-label={t("menu.homeTab")}>
      {TAB_ITEMS.map(({ id, icon: Icon, labelKey, ariaLabelKey }) => (
        <button
          key={id}
          type="button"
          data-tab={id}
          aria-current={activeTab === id ? "page" : undefined}
          aria-label={t(ariaLabelKey ?? labelKey)}
          onClick={() => onSelect(id)}
          className={`menu-mobile-tab menu-focusable${activeTab === id ? " is-active" : ""}`}
        >
          <span className="menu-mobile-tab-icon">
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
          <span>{t(labelKey)}</span>
        </button>
      ))}
    </nav>
  );
};

export default MenuMobileTabs;
