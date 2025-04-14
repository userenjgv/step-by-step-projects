
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const Layout = ({ children, title, showBackButton, onBack }: LayoutProps) => {
  const { user, logout, isAdmin } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className={`bg-white border-b border-gray-200 sticky top-0 z-10 ${isMobile ? 'pt-safe-top' : ''}`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="mr-2"
              >
                ← Back
              </Button>
            )}
            <h1 className="font-semibold text-xl">{title}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{user?.email}</span>
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                {isAdmin ? "Admin" : "Employee"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className={`flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto ${isMobile ? 'pb-safe-bottom' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
