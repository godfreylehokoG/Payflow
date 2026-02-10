import Link from "next/link";
import { Home, Send, Store } from "lucide-react";
import { cn } from "@/lib/utils";

type BottomNavProps = {
  active: "home" | "send" | "shops";
};

const tabs = [
  { id: "home", label: "Home", href: "/home", icon: Home },
  { id: "send", label: "Send", href: "/send", icon: Send },
  { id: "shops", label: "Shops", href: "/shops", icon: Store },
] as const;

export default function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="app-safe-area fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white">
      <div className="mx-auto flex h-[60px] max-w-md items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 text-xs",
                isActive ? "text-blue-600" : "text-slate-500"
              )}
            >
              <Icon size={20} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
