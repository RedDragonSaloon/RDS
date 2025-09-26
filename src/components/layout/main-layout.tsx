import { Navigation } from "./navigation";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border dragon-scale-texture mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif font-semibold text-lg mb-4">The Dragon Saloon</h3>
              <p className="text-muted-foreground">
                Serving the finest drinks and fairest deals in the territory since 1912.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/buy-prices" className="hover:text-foreground">Buy Prices</a></li>
                <li><a href="/sell-prices" className="hover:text-foreground">Sell Prices</a></li>
                <li><a href="/recipes" className="hover:text-foreground">Recipes</a></li>
                <li><a href="/leaderboard" className="hover:text-foreground">Leaderboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Contact</h4>
              <p className="text-sm text-muted-foreground">
                Located on Main Street<br />
                Open daily from noon til midnight<br />
                "Where legends are born"
              </p>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 The Dragon Saloon. Built for RedM roleplay community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}