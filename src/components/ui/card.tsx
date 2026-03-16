import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  featured?: boolean;
}

export function Card({
  className,
  hover = false,
  featured = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-card p-6 shadow-[var(--shadow-card)] transition-all duration-250",
        hover && "hover:shadow-[var(--shadow-card-hover)] hover:scale-[1.01] cursor-pointer",
        featured && "border-l-4 border-l-masters-green",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-heading text-xl font-bold text-foreground", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted mt-1", className)} {...props}>
      {children}
    </p>
  );
}
