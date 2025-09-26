"use client";

import { Navigation } from "./navigation";
import { useAuth } from "@/contexts/auth-context";

interface MainLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    role: string;
  } | null;
}

export function MainLayout({ children, user: propUser }: MainLayoutProps) {
  const { user: authUser } = useAuth();

  // Use auth context user if available, otherwise fall back to prop user
  const user = authUser || propUser;
  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border dragon-scale-texture mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif font-semibold text-lg mb-4">Y Ddraig Goch Saloon</h3>
              <p className="text-muted-foreground">
                Serving the finest drinks with Welsh pride since 1912. 🏴󠁧󠁢󠁷󠁬󠁳󠁿
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
              <h4 className="font-medium mb-4">Cysylltu - Contact</h4>
              <p className="text-sm text-muted-foreground">
                Located on Stryd Fawr (Main Street)<br />
                Open daily from noon til midnight<br />
                "Lle mae chwedlau'n cael eu geni"<br />
                <span className="italic text-xs">"Where legends are born"</span>
              </p>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Y Ddraig Goch Saloon. Built for RedM roleplay community.</p>
            <p className="mt-1 text-xs">🐉 Balchder Cymru - Welsh Pride 🐉</p>
          </div>
        </div>
      </footer>
    </div>
  );
}