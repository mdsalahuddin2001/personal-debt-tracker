import Link from "next/link";
import { Calculator, ChartBar, Users, ArrowsLeftRight } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const shortcuts = [
  {
    href: "/hishab-nikash/summary",
    label: "Summary",
    description: "Receivables, payables and recent activity.",
    icon: ChartBar,
  },
  {
    href: "/hishab-nikash/contacts",
    label: "Contacts",
    description: "People you lend to and borrow from.",
    icon: Users,
  },
  {
    href: "/hishab-nikash/transactions",
    label: "Transactions",
    description: "Every lend, borrow and payment recorded.",
    icon: ArrowsLeftRight,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. This is your home base — pick a module to get started.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Calculator className="size-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium">Nothing here yet</p>
            <p className="max-w-md text-sm text-muted-foreground">
              The dashboard is a placeholder for now. More widgets and insights
              will land here as the app grows. In the meantime, jump into{" "}
              <Link
                href="/hishab-nikash/summary"
                className="font-medium text-foreground hover:underline"
              >
                Hishab Nikash
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full transition-colors group-hover:ring-foreground/20">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
