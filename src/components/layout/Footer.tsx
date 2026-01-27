import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-lg">SchoolGigs</span>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            Support services only — not for full academic work. Stay ethical! ✨
          </p>
          
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/gigs" className="hover:text-foreground transition-colors">
              Browse
            </Link>
            <Link to="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SchoolGigs. Made with 💚 for students.
        </div>
      </div>
    </footer>
  );
}
