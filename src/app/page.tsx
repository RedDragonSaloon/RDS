import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  DollarSign,
  Package,
  ChefHat,
  Trophy,
  ArrowRight,
  Star
} from "lucide-react";

// Mock user data - replace with actual auth later
const mockUser = null; // Set to null to show logged-out state

export default function Home() {
  const noticeboard = `# Croeso i Y Ddraig Goch Saloon 🐉

## Arbennigion yr Wythnos - This Week's Specials
- **Dydd Llun (Monday)**: Half-price Welsh Dragon Fire Whiskey
- **Dydd Mercher (Wednesday)**: Poker Cymraeg Night - Buy 2 Get 1 Free
- **Dydd Gwener (Friday)**: Live Celtic music with Cerys "Y Deryn" Evans
- **Dydd Sadwrn (Saturday)**: Ddraig's Fire Challenge - Finish the drink, get your name on the wall!

## Digwyddiadau - Upcoming Events
- **Dydd Sul Nesaf**: Monthly Welsh Arm Wrestling Championship
- **Hydref 31**: Calan Gaeaf (Halloween) Costume Contest with prizes
- **Dewi Sant Day (March 1)**: Special Welsh celebration with traditional food

*Cymru am byth - Fine drinks, fair deals, Welsh spirit.*`;

  return (
    <MainLayout user={mockUser}>
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="relative bg-gradient-to-r from-primary to-secondary p-12 rounded-lg dragon-border mb-8 dragon-scale-texture">
          <div className="absolute inset-0 bg-black/10 rounded-lg"></div>
          <div className="relative z-10">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4">
              🐉 Y Ddraig Goch Saloon 🏴󠁧󠁢󠁷󠁬󠁳󠁿
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-serif italic mb-6">
              Cymru am byth - Wales forever
            </p>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Croeso! Welcome to the most legendary Welsh watering hole in the territory.
              Serving cowboys, outlaws, and honest folk with Welsh pride since 1912.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/buy-prices">
                <Button size="lg" variant="secondary">
                  View Buy Prices
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/recipes">
                <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
                  Browse Recipes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Link href="/buy-prices">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/90 transition-colors">
                <DollarSign className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Buy Prices</CardTitle>
              <CardDescription>
                Current purchasing rates for all spirits, mixers, and supplies
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/sell-prices">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary/90 transition-colors">
                <Package className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle>Sell Prices & Packages</CardTitle>
              <CardDescription>
                Retail prices and special package deals for customers
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/recipes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/90 transition-colors">
                <ChefHat className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle>Recipes</CardTitle>
              <CardDescription>
                Cocktail recipes, food preparations, and cooking instructions
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/leaderboard">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group dragon-fire-glow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4 group-hover:opacity-90 transition-opacity">
                <Trophy className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle>🏆 Pencampwyr - Champions</CardTitle>
              <CardDescription>
                Weekly staff performance and Welsh dragon sales champions
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </section>

      {/* Noticeboard */}
      <section className="mb-16">
        <Card className="dragon-border">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Star className="mr-3 h-6 w-6 text-accent" />
              🏴󠁧󠁢󠁷󠁬󠁳󠁿 Bwrdd Hysbysiadau - Noticeboard
            </CardTitle>
            <CardDescription>
              Newyddion diweddaraf - Latest news, specials, and Welsh events
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line text-foreground">
              {noticeboard}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Staff Section - Show only if not logged in */}
      {!mockUser && (
        <section className="text-center">
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle>Are you a member of our staff?</CardTitle>
              <CardDescription>
                Staff members can log sales, view commissions, and access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button>
                  Staff Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      )}
    </MainLayout>
  );
}
