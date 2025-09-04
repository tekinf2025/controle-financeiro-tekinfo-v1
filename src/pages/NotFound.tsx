import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card border-border shadow-medium">
        <CardContent className="p-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-accent rounded-2xl shadow-soft">
            <AlertTriangle className="h-8 w-8 text-accent-foreground" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">404</h1>
            <h2 className="text-xl font-semibold">Página não encontrada</h2>
            <p className="text-muted-foreground">
              Oops! A página que você está procurando não existe.
            </p>
          </div>
          
          <Button 
            asChild
            className="bg-gradient-primary hover:shadow-glow transition-smooth"
          >
            <a href="/" className="inline-flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Voltar ao início
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
