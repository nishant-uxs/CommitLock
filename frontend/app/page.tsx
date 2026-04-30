import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/wallet/WalletConnect";
import { Shield, Lock, CheckCircle, ArrowRight, Zap, Wallet, Clock, Users, Activity, ExternalLink, ChevronRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background selection:bg-primary selection:text-primary-foreground overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.25]" />
        
        {/* Animated glowing orbs using Tailwind animations */}
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full animate-blob mix-blend-screen" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-purple-500/20 blur-[120px] rounded-full animate-blob animation-delay-200 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[40%] w-[600px] h-[600px] bg-indigo-500/20 blur-[120px] rounded-full animate-blob animation-delay-400 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-background/50 backdrop-blur-2xl transition-all">
          <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Commit<span className="text-muted-foreground font-medium">Lock</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground transition-all sm:block hover:-translate-y-0.5">
                Dashboard
              </Link>
              <WalletConnect />
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="pt-48 pb-20 px-6 sm:pt-56 sm:pb-32 lg:pb-48 relative">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-xl mb-10 hover:bg-white/10 transition-colors cursor-pointer group">
              <Sparkles className="h-4 w-4 text-blue-400 animate-pulse mt-0.5" />
              <span className="text-sm font-medium text-foreground tracking-wide">Now live on Stellar Testnet</span>
              <div className="w-px h-4 bg-white/20 mx-1" />
              <Link href="/dashboard" className="flex items-center text-sm font-medium text-muted-foreground group-hover:text-blue-400 transition-colors">
                Try it out <ChevronRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <h1 className="animate-fade-in-delay-1 text-5xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tighter text-foreground mb-8 leading-[1.05]">
              Eliminate no-shows.<br />
              <span className="animate-text-shimmer bg-clip-text text-transparent pb-2">Guarantee attendance.</span>
            </h1>

            <p className="animate-fade-in-delay-2 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
              CommitLock enforces accountability through smart contracts. Guests lock a refundable XLM deposit to secure their spot. Show up and get refunded. No-show, you keep the deposit.
            </p>

            <div className="animate-fade-in-delay-3 flex flex-col sm:flex-row items-center gap-5 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 text-base font-semibold group relative overflow-hidden bg-white text-black hover:bg-slate-200 transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                  <span className="relative z-10 flex items-center">
                    Launch App
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                </Button>
              </Link>
              <Link href="https://stellar.expert/explorer/testnet" target="_blank">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-md transition-all hover:scale-105 font-medium">
                  View Smart Contract
                  <ExternalLink className="ml-2 h-4 w-4 opacity-70" />
                </Button>
              </Link>
            </div>

            {/* Stats / Proof points */}
            <div className="animate-fade-in-delay-4 mt-24 pt-12 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-left sm:text-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              {[
                { label: "Network", value: "Stellar", icon: Activity },
                { label: "Settlement", value: "< 5s", icon: Zap },
                { label: "Gas Fees", value: "$0.00", icon: Wallet },
                { label: "Trust Model", value: "Trustless", icon: Lock },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col sm:items-center group">
                  <div className="flex items-center gap-2 mb-3 text-muted-foreground group-hover:text-blue-400 transition-colors">
                    <stat.icon className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-6 relative z-10 border-t border-white/5 bg-background">
          <div className="absolute inset-0 bg-blue-500/5 mix-blend-screen pointer-events-none" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="mb-20 max-w-2xl">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                Engineered for <span className="text-blue-400">reliability.</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                We&apos;ve built a bulletproof escrow mechanism on Soroban to ensure fair outcomes without human intermediaries.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Lock,
                  title: "Immutable Escrow",
                  desc: "Funds are locked in a Soroban smart contract out of anyone&apos;s control until the event concludes."
                },
                {
                  icon: Zap,
                  title: "Gas-free Experience",
                  desc: "Built-in fee sponsorship means your users never need native tokens to pay for transaction fees."
                },
                {
                  icon: CheckCircle,
                  title: "Instant Resolution",
                  desc: "Once attendance is verified, deposits are distributed at the speed of the Stellar network."
                }
              ].map((feature, i) => (
                <div key={i} className="group relative p-8 rounded-3xl glass-panel glowing-border transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)] cursor-default">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-8 shadow-inner relative z-10">
                    <feature.icon className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 relative z-10">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-base relative z-10">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-32 px-6 relative overflow-hidden bg-black/40">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-24">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                The flow.
              </h2>
              <p className="text-xl text-muted-foreground">Four deterministic steps to finalize a booking.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative">
              <div className="hidden lg:block absolute top-[28px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent z-0" />
              
              {[
                {
                  step: "01",
                  title: "Initialize",
                  desc: "Host deploys a reservation slot specifying the required XLM deposit.",
                },
                {
                  step: "02",
                  title: "Commit",
                  desc: "Guest triggers the contract to lock funds and secure their attendance.",
                },
                {
                  step: "03",
                  title: "Verify",
                  desc: "Host scans or confirms the guest in the system upon arrival.",
                },
                {
                  step: "04",
                  title: "Settle",
                  desc: "Contract executes refund if attended, or slashed transfer if absent.",
                }
              ].map((item, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                  <div className="w-14 h-14 rounded-full bg-background border border-blue-500/30 flex items-center justify-center mb-8 text-base font-bold text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-300">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/5 bg-background relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
              <Shield className="h-5 w-5 text-foreground" />
              <span className="text-sm font-semibold text-foreground tracking-wide">
                CommitLock &copy; {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex gap-8 text-sm font-medium text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/metrics" className="hover:text-foreground transition-colors">Metrics</Link>
              <Link href="https://github.com" target="_blank" className="hover:text-foreground transition-colors">GitHub</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
