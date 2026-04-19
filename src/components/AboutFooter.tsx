import { Bot, MessageSquareWarning, Gavel, Scale } from 'lucide-react';

export const AboutFooter = () => (
  <footer className="border-t bg-card/50 mt-8">
    <div className="container max-w-5xl py-8 px-4">
      <div className="flex items-center gap-2 mb-3">
        <Scale className="h-5 w-5 text-primary" />
        <h3 className="text-base font-heading font-bold text-primary">About Lawmate</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5 max-w-3xl">
        Lawmate is a free legal awareness platform that helps every Indian citizen understand their
        Fundamental Rights, get instant AI-powered legal guidance, and connect directly with verified
        district lawyers — all in their own language.
      </p>
      <div className="grid sm:grid-cols-3 gap-4 text-xs">
        <div className="flex items-start gap-2">
          <Bot className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">AI Legal Assistant</p>
            <p className="text-muted-foreground">Multilingual answers grounded in Indian law.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MessageSquareWarning className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Direct Complaints</p>
            <p className="text-muted-foreground">Reach a verified lawyer in your district instantly.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Gavel className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Lawyer Support</p>
            <p className="text-muted-foreground">Approved lawyers manage and resolve your case.</p>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground mt-6 pt-4 border-t">
        © {new Date().getFullYear()} Lawmate – Know Your Right. Empowering citizens through legal awareness.
      </p>
    </div>
  </footer>
);
