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

export default function Home() {
  const noticeboard = `# Welcome to The Dragon Saloon

## This Week's Specials
- **Monday**: Half-price Prairie Fire Bourbon
- **Wednesday**: Poker Night Pack - Buy 2 Get 1 Free
- **Friday**: Live music with Belle "Songbird" Davis
- **Saturday**: Dragon's Fire Challenge - Finish the drink, get your name on the wall!

## Upcoming Events
- **Next Sunday**: Monthly Arm Wrestling Championship
- **Oct 31**: Halloween Costume Contest with prizes

*Fine drinks, fair deals, fierce spirit.*`;

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="relative bg-gradient-to-r from-primary to-secondary p-12 rounded-lg dragon-border mb-8 dragon-scale-texture">
          <div className="absolute inset-0 bg-black/10 rounded-lg"></div>
          <div className="relative z-10">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-black mb-4">
              🐉 The Dragon Saloon
            </h1>
            <p className="text-xl md:text-2xl text-black/90 font-serif italic mb-6">
              Fine drinks, fair deals, fierce spirit.
            </p>
            <p className="text-black/80 max-w-2xl mx-auto mb-8">
              Welcome to the most legendary watering hole in the territory.
              Serving cowboys, outlaws, and honest folk since 1912.
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
          <Card className="card-welsh-red hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 group-hover:bg-white/90 transition-colors">
                <DollarSign className="h-6 w-6 text-welsh-red" />
              </div>
              <CardTitle className="text-white">Buy Prices</CardTitle>
              <CardDescription className="text-white/90">
                Current purchasing rates for all spirits, mixers, and supplies
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/sell-prices">
          <Card className="card-welsh-green hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 group-hover:bg-white/90 transition-colors">
                <Package className="h-6 w-6 text-welsh-green" />
              </div>
              <CardTitle className="text-white">Sell Prices & Packages</CardTitle>
              <CardDescription className="text-white/90">
                Retail prices and special package deals for customers
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/recipes">
          <Card className="card-welsh-red hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 group-hover:bg-white/90 transition-colors">
                <ChefHat className="h-6 w-6 text-welsh-red" />
              </div>
              <CardTitle className="text-white">Recipes</CardTitle>
              <CardDescription className="text-white/90">
                Cocktail recipes, food preparations, and cooking instructions
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/sales">
          <Card className="card-welsh-green hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 group-hover:bg-white/90 transition-colors">
                <ShoppingCart className="h-6 w-6 text-welsh-green" />
              </div>
              <CardTitle className="text-white">Sales Entry</CardTitle>
              <CardDescription className="text-white/90">
                Record your sales transactions - open to all staff
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
              Saloon Noticeboard
            </CardTitle>
            <CardDescription>
              Latest news, specials, and upcoming events
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line text-foreground">
              {noticeboard}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Start Section */}
      <section className="text-center">
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Everything you need to manage the saloon - no login required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/buy-prices">
                <Button variant="outline">
                  View Buy Prices
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sales">
                <Button>
                  Record a Sale
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
}
