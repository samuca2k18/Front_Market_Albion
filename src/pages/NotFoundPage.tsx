import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center px-4 py-16 overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsla(187,85%,53%,0.12),transparent)]" />
      <Card className="relative z-10 w-full max-w-lg border-border/40 bg-card/40 backdrop-blur-md shadow-2xl shadow-primary/5 rounded-3xl">
        <CardContent className="flex flex-col items-center text-center p-10 space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
            <Compass className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-primary">
              Erro 404
            </p>
            <h2 className="text-3xl font-black tracking-tighter text-foreground">
              Página não encontrada
            </h2>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              O link acessado não existe ou foi movido. Verifique o endereço ou
              volte para a página inicial.
            </p>
          </div>
          <Button
            size="lg"
            className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
            asChild
          >
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o início
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
