import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/wallet/WalletConnect";
import { Shield, Lock, CheckCircle, ArrowRight, Zap, Wallet, Clock, Users, TrendingUp, ExternalLink } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ─── HERO ─── */}
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

        <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="h-7 w-7 text-blue-400" />
              <span className="text-lg font-bold tracking-tight text-white">
                Commit<span className="text-blue-400">Lock</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="hidden sm:inline-flex text-sm text-slate-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <WalletConnect />
            </div>
          </nav>
        </header>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-28 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live on Stellar Testnet
            </div>
          </div>

          <h1 className="animate-fade-in-delay-1 text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Stop No-Shows with<br />
            <span className="text-gradient">Blockchain Deposits</span>
          </h1>

          <p className="animate-fade-in-delay-2 mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            CommitLock locks refundable XLM deposits in Soroban smart contracts.
            Guests attend — they get refunded. No-show — you keep the deposit.
          </p>

          <div className="animate-fade-in-delay-3 mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 text-base font-semibold gap-2 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all hover:shadow-blue-500/30">
                Launch App
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="https://stellar.expert/explorer/testnet/contract/CANEW3ZQL7QVB7ZAH5R6XXEUZX3TGO5CONSPXBAFSPWSEK2ITBZJ7WT5" target="_blank">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold gap-2 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                View Contract
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="animate-fade-in-delay-4 mt-14 grid grid-cols-3 max-w-md mx-auto gap-8 text-center">
            <div>
              <p className="text-2xl font-bold text-white">32+</p>
              <p className="text-xs text-slate-500 mt-0.5">Active Users</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">0%</p>
              <p className="text-xs text-slate-500 mt-0.5">Gas Fees</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">&lt;5s</p>
              <p className="text-xs text-slate-500 mt-0.5">Settlement</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="relative bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Built for Trust
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              Every feature is designed to create accountability between hosts and guests.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Lock, title: 'Smart Escrow', desc: 'Deposits locked in Soroban smart contracts. Fully automated, trustless, and transparent.', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
              { icon: CheckCircle, title: 'Instant Refunds', desc: 'Guests who show up get their deposit back instantly. No intermediaries, no delays.', iconBg: 'bg-green-50', iconColor: 'text-green-600' },
              { icon: Shield, title: 'Host Protection', desc: 'No-shows forfeit their deposit to the host. Fair compensation, enforced by code.', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
              { icon: Zap, title: 'Gasless Txns', desc: 'Fee sponsorship covers gas. Users never pay network fees — frictionless experience.', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
            ].map(({ icon: Icon, title, desc, iconBg, iconColor }) => (
              <div
                key={title}
                className="group relative p-6 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl ${iconBg} mb-4`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-slate-50 py-24 grid-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Four simple steps to eliminate no-shows.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: '01', icon: Wallet, title: 'Create Reservation', desc: 'Host sets up a slot with a required XLM deposit amount.' },
                { step: '02', icon: Lock, title: 'Guest Books', desc: 'Guest locks their XLM deposit into the smart contract.' },
                { step: '03', icon: Clock, title: 'Attend Event', desc: 'Guest shows up at the reservation time.' },
                { step: '04', icon: CheckCircle, title: 'Confirm & Settle', desc: 'Host confirms attendance. Deposit returned or forfeited.' },
              ].map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="relative text-center lg:text-left">
                  <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border-2 border-blue-100 shadow-sm mb-5 mx-auto lg:mx-0">
                    <Icon className="h-5 w-5 text-blue-600" />
                    <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      {step}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-slate-900 mb-1.5">{title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="hero-gradient py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, label: 'Verified Users', value: '32+' },
              { icon: TrendingUp, label: 'Transactions', value: '850+' },
              { icon: Shield, label: 'Deposits Secured', value: '100%' },
              { icon: Zap, label: 'Avg Settlement', value: '<5s' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <Icon className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-white py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Ready to eliminate no-shows?
          </h2>
          <p className="text-lg text-slate-500 mb-10">
            Connect your Stellar wallet and start creating deposit-protected reservations in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 text-base font-semibold gap-2">
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/feedback">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold">
                Share Feedback
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">
                Commit<span className="text-blue-600">Lock</span>
              </span>
              <span className="text-xs text-slate-400 ml-2">Built on Stellar &middot; Powered by Soroban</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
              <Link href="/create" className="hover:text-blue-600 transition-colors">Create</Link>
              <Link href="/metrics" className="hover:text-blue-600 transition-colors">Metrics</Link>
              <Link href="/monitoring" className="hover:text-blue-600 transition-colors">Monitor</Link>
              <Link href="/feedback" className="hover:text-blue-600 transition-colors">Feedback</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
