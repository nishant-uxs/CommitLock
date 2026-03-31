import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/wallet/WalletConnect";
import { Shield, Lock, CheckCircle, ArrowRight, BarChart3, Monitor, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">CommitLock</h1>
          </div>
          <WalletConnect />
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold tracking-tight">
              Stop No-Shows with
              <span className="text-primary"> Blockchain Protection</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              CommitLock uses Stellar blockchain to ensure commitment through refundable deposits.
              Guests show up, they get refunded. They don&apos;t? You keep the deposit.
            </p>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Launch App
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/metrics">
              <Button size="lg" variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Metrics
              </Button>
            </Link>
            <Link href="/monitoring">
              <Button size="lg" variant="outline" className="gap-2">
                <Monitor className="h-4 w-4" />
                Monitoring
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mt-20">
            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <Lock className="h-12 w-12 text-primary mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Secure Escrow</h3>
              <p className="text-muted-foreground">
                Deposits locked in smart contract escrow. Fully automated and trustless.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <CheckCircle className="h-12 w-12 text-primary mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Instant Refunds</h3>
              <p className="text-muted-foreground">
                Guests who attend get their deposit back immediately. No delays.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <Shield className="h-12 w-12 text-primary mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Host Protection</h3>
              <p className="text-muted-foreground">
                No-shows mean you keep the deposit. Fair compensation for your time.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm border">
              <Zap className="h-12 w-12 text-primary mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Gasless Transactions</h3>
              <p className="text-muted-foreground">
                Fee sponsorship means users don&apos;t pay gas fees. Sponsor covers network costs.
              </p>
            </div>
          </div>

          <div className="mt-20 p-8 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-2xl font-bold mb-4">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-6 text-left">
              <div>
                <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-3">
                  1
                </div>
                <h4 className="font-semibold mb-2">Create Reservation</h4>
                <p className="text-sm text-muted-foreground">
                  Host creates a reservation slot with deposit amount
                </p>
              </div>
              <div>
                <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-3">
                  2
                </div>
                <h4 className="font-semibold mb-2">Guest Books</h4>
                <p className="text-sm text-muted-foreground">
                  Guest locks XLM deposit in smart contract
                </p>
              </div>
              <div>
                <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-3">
                  3
                </div>
                <h4 className="font-semibold mb-2">Attend Event</h4>
                <p className="text-sm text-muted-foreground">
                  Guest attends the reservation at scheduled time
                </p>
              </div>
              <div>
                <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-3">
                  4
                </div>
                <h4 className="font-semibold mb-2">Confirm & Release</h4>
                <p className="text-sm text-muted-foreground">
                  Host confirms attendance, deposit released automatically
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <div className="text-center text-muted-foreground">
          <p>Built on Stellar Testnet • Powered by Soroban Smart Contracts</p>
          <div className="mt-3 flex gap-4 justify-center text-sm">
            <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
            <Link href="/create" className="hover:text-primary">Create</Link>
            <Link href="/metrics" className="hover:text-primary">Metrics</Link>
            <Link href="/monitoring" className="hover:text-primary">Monitoring</Link>
            <Link href="/feedback" className="hover:text-primary">Feedback</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
