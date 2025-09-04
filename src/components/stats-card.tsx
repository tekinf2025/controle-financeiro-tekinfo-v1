import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "destructive";
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  variant = "default",
  className 
}: StatsCardProps) {
  const variantStyles = {
    default: "bg-card border-border hover:shadow-soft",
    success: "bg-card border-success/30 hover:shadow-soft ring-1 ring-success/20",
    warning: "bg-card border-warning/30 hover:shadow-soft ring-1 ring-warning/20", 
    destructive: "bg-card border-destructive/30 hover:shadow-soft ring-1 ring-destructive/20"
  };

  const iconStyles = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning", 
    destructive: "text-destructive"
  };

  return (
    <Card className={cn(
      "group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-1",
      "hover-lift transition-smooth animate-fade-in",
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200">
          {title}
        </CardTitle>
        <div className={cn(
          "h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12",
          iconStyles[variant]
        )}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold group-hover:text-3xl transition-all duration-300 transform">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 group-hover:text-muted-foreground/80 transition-colors duration-200">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}