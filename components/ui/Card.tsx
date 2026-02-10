import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
