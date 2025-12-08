// src/pages/LoginPage.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate, Link, type Location } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ApiErrorShape } from "../api/client";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { User, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, "Usuário obrigatório"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const loginBenefits = [
  "Acesso ao painel inteligente em tempo real",
  "Itens favoritos sincronizados na nuvem",
  "Histórico para entender o comportamento do mercado",
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const mutation = useMutation<void, ApiErrorShape, LoginFormData>({
    mutationFn: async (formData) => {
      await login(formData);
    },
    onSuccess: () => {
      const redirectTo =
        (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";
      navigate(redirectTo, { replace: true });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => mutation.mutate(data);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Hero gradient overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsla(187,85%,53%,0.12),transparent)] pointer-events-none" />

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left Panel - Branding (igual o cadastro, mas texto para login) */}
        <div className="relative hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-center px-12 xl:px-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_50%,hsla(142,71%,45%,0.08),transparent)] pointer-events-none" />

          <div className="relative max-w-lg animate-fade-up">
            {/* Chip */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium tracking-wide uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
              Albion Market • Login
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight mb-6">
              Bem-vindo de volta
              <span className="block text-gradient mt-1">ao seu painel</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              Entre para acompanhar seus itens, comparar cidades e aproveitar as melhores
              oportunidades do mercado de Albion Online.
            </p>

            <ul className="space-y-4">
              {loginBenefits.map((benefit, i) => (
                <li
                  key={benefit}
                  className="flex items-center gap-3 text-foreground animate-fade-up"
                  style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                >
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="relative flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20 lg:w-1/2 xl:w-[45%]">
          <div
            className="mx-auto w-full max-w-md animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Mobile chip */}
            <div className="lg:hidden inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium tracking-wide uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
              Albion Market
            </div>

            <div className="glass rounded-3xl p-8 sm:p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Entrar na sua conta
                </h2>
                <p className="text-muted-foreground">
                  Use seu usuário configurado no Albion Market para acessar o painel.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-foreground">
                    Usuário
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="nome.albion"
                      autoComplete="username"
                      className="pl-10"
                      {...register("username")}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="pl-10"
                      {...register("password")}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {mutation.error && (
                  <p className="text-xs text-destructive mt-1">
                    {mutation.error.message || "Não foi possível fazer login."}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full mt-2"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Entrando..." : "Entrar"}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Ainda não tem conta?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Crie uma agora
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
