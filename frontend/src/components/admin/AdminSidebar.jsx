/**
 * Admin navigation: fixed, collapsible sidebar on desktop and a slide-in drawer on mobile.
 * It only switches sections — every API call is still authorised by the backend.
 */
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronsLeft, ChevronsRight, LogOut, Mail, Menu, X } from "lucide-react";
import { CONTACT_ITEMS, NEWSLETTER_ITEMS, isNewsletterSection } from "./sections";

function NavButton({ item, active, compact, nested, onSelect }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={active ? "page" : undefined}
      title={compact ? item.label : undefined}
      className={`group relative flex w-full items-center gap-3 rounded-xl text-left text-[13px] font-medium transition-colors ${compact ? "justify-center px-0 py-2.5" : nested ? "py-2 pl-3 pr-3" : "px-3 py-2.5"} ${
        active ? "bg-violet-500/15 text-white" : "text-gray-400 hover:bg-white/5 hover:text-gray-100"
      }`}
    >
      {active && <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-violet-400" />}
      <Icon size={17} aria-hidden className={`shrink-0 transition-colors ${active ? "text-violet-300" : "text-gray-500 group-hover:text-gray-300"}`} />
      {!compact && <span className="truncate">{item.label}</span>}
      {compact && <span className="sr-only">{item.label}</span>}
    </button>
  );
}

function SidebarBody({ active, onSelect, compact, groupOpen, onToggleGroup, adminName, onLogout, footer }) {
  const inNewsletter = isNewsletterSection(active);
  const showItems = compact || groupOpen;
  return (
    <div className="flex h-full flex-col">
      <div className={`flex items-center gap-3 border-b border-white/5 ${compact ? "justify-center px-2 py-5" : "px-5 py-5"}`}>
        <span className="flex h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
        {!compact && (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-extrabold uppercase tracking-widest text-white">Control Console</p>
            <p className="truncate font-mono text-[10px] font-semibold uppercase text-gray-500">
              Welcome: <span className="text-cyan-300">{adminName}</span>
            </p>
          </div>
        )}
      </div>

      <nav aria-label="Admin sections" className={`min-h-0 flex-1 space-y-1 overflow-y-auto py-4 ${compact ? "px-2" : "px-3"}`}>
        {CONTACT_ITEMS.map((item) => (
          <NavButton key={item.id} item={item} active={active === item.id} compact={compact} onSelect={onSelect} />
        ))}

        <div className="pt-3">
          {compact ? (
            <div aria-hidden className="mx-auto mb-2 h-px w-8 bg-white/10" />
          ) : (
            <button
              type="button"
              onClick={onToggleGroup}
              aria-expanded={groupOpen}
              aria-controls="newsletter-nav"
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-extrabold uppercase tracking-widest transition-colors hover:bg-white/5 ${inNewsletter ? "text-white" : "text-gray-300"}`}
            >
              <Mail size={17} aria-hidden className={inNewsletter ? "text-violet-300" : "text-gray-500"} />
              <span className="flex-1">Newsletter</span>
              <ChevronDown size={15} aria-hidden className={`text-gray-500 transition-transform duration-200 ${groupOpen ? "rotate-180" : ""}`} />
            </button>
          )}
          <AnimatePresence initial={false}>
            {showItems && (
              <motion.div
                id="newsletter-nav"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className={`space-y-0.5 ${compact ? "" : "ml-[19px] mt-1 border-l border-white/10 pl-2"}`}>
                  {NEWSLETTER_ITEMS.map((item) => (
                    <NavButton key={item.id} item={item} active={active === item.id} compact={compact} nested onSelect={onSelect} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <div className={`space-y-1 border-t border-white/5 py-3 ${compact ? "px-2" : "px-3"}`}>
        {footer}
        <button
          type="button"
          onClick={onLogout}
          title={compact ? "Logout" : undefined}
          className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-[13px] font-medium text-gray-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300 ${compact ? "justify-center" : "px-3"}`}
        >
          <LogOut size={17} aria-hidden />
          {compact ? <span className="sr-only">Logout</span> : "Logout"}
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar({ active, onSelect, collapsed, onToggleCollapsed, groupOpen, onToggleGroup, mobileOpen, onMobileOpen, onMobileClose, adminName, onLogout }) {
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && onMobileClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen, onMobileClose]);

  const shared = { active, groupOpen, onToggleGroup, adminName, onLogout };
  const CollapseIcon = collapsed ? ChevronsRight : ChevronsLeft;
  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-white/10 bg-[#070b17]/95 px-4 backdrop-blur lg:hidden">
        <button type="button" onClick={onMobileOpen} aria-label="Open navigation" aria-expanded={mobileOpen} className="rounded-lg p-2 text-gray-300 hover:bg-white/10 hover:text-white">
          <Menu size={19} aria-hidden />
        </button>
        <span className="font-display text-sm font-extrabold uppercase tracking-widest text-white">Control Console</span>
      </div>

      {/* Desktop sidebar */}
      <aside
        data-testid="desktop-sidebar"
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-white/10 bg-[#070b17]/90 backdrop-blur-xl transition-[width] duration-200 lg:block ${collapsed ? "w-[76px]" : "w-64"}`}
      >
        <SidebarBody
          {...shared}
          compact={collapsed}
          onSelect={onSelect}
          footer={
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-[13px] font-medium text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-200 ${collapsed ? "justify-center" : "px-3"}`}
            >
              <CollapseIcon size={17} aria-hidden />
              {!collapsed && "Collapse"}
            </button>
          }
        />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onMobileClose} aria-hidden />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 w-[86%] max-w-[300px] border-r border-white/10 bg-[#070b17]"
            >
              <button type="button" onClick={onMobileClose} aria-label="Close navigation" className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
                <X size={17} aria-hidden />
              </button>
              <SidebarBody
                {...shared}
                compact={false}
                onSelect={(id) => {
                  onSelect(id);
                  onMobileClose();
                }}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
