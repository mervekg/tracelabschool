import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SolviaLogo from "@/components/SolviaLogo";
import {
  PenLine,
  Camera,
  CheckCircle,
  Clock,
  Heart,
  Shield,
  BookOpen,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
  ChevronDown,
  GraduationCap,
  FileText,
  Eye,
  Lock,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <SolviaLogo size="md" linkTo="/" />
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                How it works
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
            >
              Log In
            </Button>
            <Button
              size="sm"
              onClick={() => scrollToSection("pricing")}
            >
              Request a Pilot
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Keep exams handwritten.{" "}
              <span className="text-primary">Let AI handle the grading.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Solvia reads students' handwritten work, applies your rubrics, and
              delivers draft scores and feedback — so you stay in control while
              cutting grading time dramatically.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gap-2 text-base px-8" onClick={() => scrollToSection("pricing")}>
                Request a Pilot <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base px-8"
                onClick={scrollToDemo}
              >
                Watch 2-Minute Demo <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground italic">
              Built by a K-12 physics teacher and Harvard IEP master's student,
              for real classrooms.
            </p>
          </div>
        </div>
        {/* Subtle decorative gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl" />
        </div>
      </section>

      {/* Problem + Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Teachers are overwhelmed. Handwritten work is back.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: Clock,
                stat: "~10 hrs/week",
                label: "Spent on grading",
                desc: "Teachers spend roughly 9–10 hours per week on grading alone — time taken from lesson planning, feedback, and rest.",
              },
              {
                icon: Heart,
                stat: "44%",
                label: "Teacher burnout rate",
                desc: "K-12 educators report some of the highest burnout rates among U.S. workers, driven by unsustainable workloads.",
              },
              {
                icon: PenLine,
                stat: "↑ 3×",
                label: "Handwritten exams returning",
                desc: "As AI-generated cheating grows, more schools are shifting back to handwritten exams — bringing back grading overload.",
              },
            ].map((item) => (
              <Card
                key={item.label}
                className="p-6 text-center space-y-3 border-border/60"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mx-auto">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {item.stat}
                </div>
                <div className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  {item.label}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Solvia keeps the benefits of handwritten assessment while cutting
            grading time dramatically, so teachers can focus on feedback and
            instruction instead of piles of paper.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" ref={howItWorksRef} className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
            How Solvia works in your classroom
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: PenLine,
                title: "Students write by hand",
                desc: "Quizzes, exit tickets, short answers, and lab work — on paper or tablet with a stylus.",
              },
              {
                step: "2",
                icon: Camera,
                title: "You capture and upload",
                desc: "Scan or snap a photo; Solvia reads messy handwriting and groups similar responses.",
              },
              {
                step: "3",
                icon: CheckCircle,
                title: "You review and release",
                desc: "Solvia suggests rubric-based scores and comments. You stay fully in control, approving or editing with a click.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mx-auto relative">
                  <item.icon className="w-7 h-7 text-primary" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          {/* App screenshot placeholder */}
          <div className="mt-14 rounded-2xl border-2 border-dashed border-border bg-muted/20 h-64 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              App screenshot / mockup placeholder
            </p>
          </div>
        </div>
      </section>

      {/* Demo embed */}
      <section ref={demoRef} className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-2">
            See Solvia in Action
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            A quick look at how Solvia transforms student evaluation
          </p>
          <div className="rounded-xl overflow-hidden border border-border shadow-sm bg-card">
            <iframe
              src="https://gamma.app/embed/t0mglqkc35aa3mq"
              style={{ width: "100%", height: 450 }}
              allow="fullscreen"
              title="Authentic Assessment for the AI Era"
              className="block"
            />
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
            Designed for real schools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Classroom Teachers",
                desc: "Cut grading time for handwritten work by 50%+ and return results within 24 hours. Spend more time on instruction and less on piles of paper.",
              },
              {
                icon: Users,
                title: "Department Leads",
                desc: "Share rubrics across teachers, ensure consistent scoring, and see grading patterns across sections and classes at a glance.",
              },
              {
                icon: Building2,
                title: "School & District Leaders",
                desc: "Roll out at scale with SSO, SIS integrations, and real-time data on teacher workload relief and assessment turnaround.",
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="p-6 space-y-4 border-border/60"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10">
                  <item.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
            What makes Solvia different
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              {
                icon: Sparkles,
                title: "Handwriting-first AI",
                desc: "Purpose-built to read real student handwriting — messy cursive, mixed diagrams, and all — not just typed essays.",
              },
              {
                icon: Eye,
                title: "Teacher-in-the-loop grading",
                desc: "Every score is visible and editable before release. No black-box decisions — you approve or adjust with a click.",
              },
              {
                icon: FileText,
                title: "Rubrics in minutes",
                desc: "Create, reuse, and share rubric templates for STEM and humanities assessments. AI helps draft them, you finalize.",
              },
              {
                icon: Lock,
                title: "Built for privacy and schools",
                desc: "FERPA-aligned data practices, no student names required for grading, and district-ready security from day one.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mt-1">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">
              Simple plans for pilots and scale
            </h2>
            <p className="text-muted-foreground">
              We're in pilot phase — pricing is flexible and can be customized
              for your school or district.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter Pilot",
                audience: "For individual teachers",
                features: [
                  "Up to 150 students",
                  "Core handwritten grading features",
                  "Rubric builder",
                  "Email support",
                ],
                cta: "Apply for Pilot",
                highlight: false,
              },
              {
                name: "School Plan",
                audience: "For departments",
                features: [
                  "All teacher features",
                  "Shared rubrics & basic analytics",
                  "Onboarding + PD session",
                  "Priority email support",
                ],
                cta: "Talk to Sales",
                highlight: true,
              },
              {
                name: "District Plan",
                audience: "For multi-school deployments",
                features: [
                  "Volume-based pricing",
                  "SIS/LMS integrations & SSO",
                  "Priority support & custom reporting",
                  "Dedicated account manager",
                ],
                cta: "Schedule a Call",
                highlight: false,
              },
            ].map((plan) => (
              <Card
                key={plan.name}
                className={`p-6 flex flex-col border-border/60 ${
                  plan.highlight
                    ? "ring-2 ring-primary shadow-lg relative"
                    : ""
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.audience}
                  </p>
                  <p className="text-2xl font-bold mt-3 text-foreground">
                    Contact us
                  </p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Founder / About */}
      <section id="about" className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
            Why I'm building Solvia
          </h2>
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              I've been a physics teacher for nearly 18 years. I've taught in
              international schools across three continents, watched curricula
              evolve, and graded more papers than I can count.
            </p>
            <p>
              I'm now a master's student in International Education Policy at
              the{" "}
              <span className="text-foreground font-medium">
                Harvard Graduate School of Education
              </span>
              . What brought me here was a question that wouldn't leave me alone:
              how do we keep assessment authentic in the age of AI?
            </p>
            <p>
              I saw students' voices disappear into AI-generated text. Schools
              responded by bringing back handwritten exams — which I believe in
              deeply. I love seeing students' real handwriting, their
              scratch-work, their thinking laid bare on paper.
            </p>
            <p>
              But I've also sat on the floor at midnight surrounded by piles of
              papers, knowing I had to be ready for first period. That's not
              sustainable, and it's not what teaching should feel like.
            </p>
            <p className="text-foreground font-medium">
              Solvia is my attempt to protect authentic student thinking while
              protecting teachers' time and wellbeing. Because what moves me is
              seeing every student's real work — and making sure teachers are
              still standing to see it.
            </p>
          </div>
          {/* Avatar placeholder */}
          <div className="flex items-center gap-4 mt-8 pt-8 border-t border-border">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Solvia Founder</p>
              <p className="text-sm text-muted-foreground">
                K-12 Physics Teacher · Harvard IEP M.Ed. Candidate
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            Bring authentic, handwritten assessment back — without bringing back
            unsustainable grading.
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gap-2 text-base px-8" onClick={() => scrollToSection("pricing")}>
              Request a Pilot <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8">
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <SolviaLogo size="sm" linkTo="/" />
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => scrollToSection("about")} className="hover:text-foreground transition-colors">About</button>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="mailto:contact@solvialearning.com" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Solvia. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
