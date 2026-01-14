import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { verifyEmailRequest } from "../api/auth";
import "./auth-pages.css";

type Status = "idle" | "loading" | "success" | "error";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificação ausente ou inválido.");
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setStatus("loading");
        const res = await verifyEmailRequest(token);
        if (cancelled) return;
        setStatus("success");
        setMessage(res.message || "E-mail verificado com sucesso. Você já pode fazer login.");
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          "Não foi possível verificar seu e-mail. O link pode ter expirado ou já ter sido utilizado."
        );
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleGoToLogin = () => {
    navigate("/login", { replace: true });
  };

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="min-h-screen bg-background flex">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsla(187,85%,53%,0.12),transparent)] pointer-events-none" />

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="glass rounded-3xl p-8 sm:p-10 max-w-md w-full text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium tracking-wide uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
            Albion Market • Verificação de e-mail
          </div>

          {isLoading && (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-3">
                Confirmando seu e-mail...
              </h1>
              <p className="text-sm text-muted-foreground mb-4">
                Aguarde enquanto validamos o link de verificação.
              </p>
              <div className="h-10 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  Processando
                </div>
              </div>
            </>
          )}

          {isSuccess && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">
                E-mail verificado!
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                {message ||
                  "Sua conta está pronta para uso. Agora você já pode fazer login no Albion Market."}
              </p>
              <button
                type="button"
                onClick={handleGoToLogin}
                className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Ir para o login
                <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </>
          )}

          {isError && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-amber-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">
                Não foi possível verificar
              </h1>
              <p className="text-sm text-muted-foreground mb-4">
                {message ||
                  "O link pode ter expirado ou já ter sido utilizado. Se precisar, você pode solicitar um novo e-mail de verificação."}
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Tente voltar à página de login e usar a opção de reenviar verificação.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-accent/20 transition-colors"
              >
                Voltar para o login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


