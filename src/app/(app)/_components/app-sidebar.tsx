"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  Users,
  ArrowsLeftRight,
  Calculator,
  ChartBar,
  CaretDown,
  UserCircle,
  Folder,
  List,
  X,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "./sign-out-button";

type NavLeaf = {
  href: string;
  label: string;
  icon: typeof SquaresFour;
};

type NavGroup = {
  label: string;
  icon: typeof SquaresFour;
  children: NavLeaf[];
};

type NavItem = NavLeaf | NavGroup;

const isGroup = (item: NavItem): item is NavGroup => "children" in item;

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: SquaresFour },
  {
    label: "Hishab Nikash",
    icon: Calculator,
    children: [
      { href: "/hishab-nikash/summary", label: "Summary", icon: ChartBar },
      { href: "/hishab-nikash/contacts", label: "Contacts", icon: Users },
      {
        href: "/hishab-nikash/transactions",
        label: "Transactions",
        icon: ArrowsLeftRight,
      },
    ],
  },
  { href: "/files", label: "Files", icon: Folder },
];

const adminLink: NavLeaf = { href: "/admin/users", label: "Users", icon: Users };

export function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const items = isAdmin ? [...navItems, adminLink] : navItems;

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <UserCircle weight="duotone" className="size-5 text-primary" />
          <span>Manage Me</span>
        </Link>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <List weight="duotone" className="size-4" />
        </Button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform md:sticky md:top-0 md:z-auto md:h-svh md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b px-5 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
            onClick={() => setOpen(false)}
          >
            <UserCircle weight="duotone" className="size-5 text-primary" />
            <span>Manage Me</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X weight="duotone" className="size-4" />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {items.map((item) =>
            isGroup(item) ? (
              <NavGroup
                key={item.label}
                group={item}
                isActive={isActive}
                onNavigate={() => setOpen(false)}
              />
            ) : (
              <NavLink
                key={item.href}
                item={item}
                isActive={isActive}
                onNavigate={() => setOpen(false)}
              />
            )
          )}
        </nav>

        <div className="border-t p-3">
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}

function NavLink({
  item,
  isActive,
  onNavigate,
}: {
  item: NavLeaf;
  isActive: (href: string) => boolean;
  onNavigate: () => void;
}) {
  const { href, label, icon: Icon } = item;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive(href)
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      <Icon weight="duotone" className="size-4" />
      {label}
    </Link>
  );
}

function NavGroup({
  group,
  isActive,
  onNavigate,
}: {
  group: NavGroup;
  isActive: (href: string) => boolean;
  onNavigate: () => void;
}) {
  const { label, icon: Icon, children } = group;
  const hasActiveChild = children.some((c) => isActive(c.href));
  const [expanded, setExpanded] = useState(hasActiveChild);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          hasActiveChild
            ? "text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <Icon weight="duotone" className="size-4" />
        <span className="flex-1 text-left">{label}</span>
        <CaretDown
          weight="duotone"
          className={cn(
            "size-3.5 transition-transform",
            expanded ? "rotate-180" : "rotate-0"
          )}
        />
      </button>

      {expanded && (
        <div className="mt-1 ml-4 flex flex-col gap-1 border-l pl-3">
          {children.map((child) => (
            <NavLink
              key={child.href}
              item={child}
              isActive={isActive}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
