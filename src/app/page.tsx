import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto container flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold">AIJARVIS</h1>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Link href="/auth/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto container flex flex-col items-center justify-center gap-8 py-20 text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Your AI Assistant for
          <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent"> Everything</span>
        </h2>
        
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Experience the power of AI with AIJARVIS. Your personal assistant for coding, writing, analysis, and more.
        </p>

        <div className="flex gap-4">
          <Link href="/auth/sign-up">
            <Button size="lg">Start for Free</Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg">Learn More</Button>
          </Link>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-lg border p-8">
              <h3 className="mb-4 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="mx-auto container w-full border-t py-8 mt-20">
        <div className="container flex justify-between text-sm text-muted-foreground">
          <p>© 2024 AIJARVIS. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#">Terms</Link>
            <Link href="#">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Smart Coding Assistant",
    description: "Get help with coding, debugging, and code reviews in real-time.",
  },
  {
    title: "Natural Conversations",
    description: "Interact naturally with AI that understands context and nuance.",
  },
  {
    title: "24/7 Availability",
    description: "Access your AI assistant whenever you need, day or night.",
  },
];
