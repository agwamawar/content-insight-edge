
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-indigo-700">Content Insight Edge</h1>
        </div>
        
        <div>
          <Button variant="outline" size="sm" className="gap-2">
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">View on GitHub</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
