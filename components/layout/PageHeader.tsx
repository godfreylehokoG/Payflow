import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export default function PageHeader({
  title,
  subtitle,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      ) : null}
    </div>
  );
}
