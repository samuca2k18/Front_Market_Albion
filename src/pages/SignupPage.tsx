import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowRight, CheckCircle2, User, Mail, Lock } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import type { ApiErrorShape } from "../api/client";
import { useState } from "react";
import "./auth-pages.css";

const signupSchema = z
  .object({
    username: z.string().min(3, "Informe um usuário válido"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo de 6 caracteres"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não conferem",
  });

type SignupFormData = z.infer<typeof signupSchema>;

const benefits = [
  "Itens sincronizados por usuário",
  "Visual profissional para decisões rápidas",
  "Histórico de preço integrado ao painel",
];

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [filledFields, setFilledFields] = useState<Set<string>>(new Set());

  const mutation = useMutation<void, ApiErrorShape, SignupFormData>({
    mutationFn: async (formData) => {
      await signup(formData);
    },
    onSuccess: (_data, variables) => {
      navigate("/login", {
        replace: true,
        state: {
          fromSignup: true,
          email: variables?.email,
        },
      });
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const formValues = watch();

  const handleFieldChange = (fieldName: string) => {
    const newSet = new Set(filledFields);
    if (formValues[fieldName as keyof SignupFormData]) {
      newSet.add(fieldName);
    } else {
      newSet.delete(fieldName);
    }
    setFilledFields(newSet);
  };

  const onSubmit = (values: SignupFormData) => {
    mutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Hero gradient overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_-10%,hsla(160,50%,45%,0.06),transparent)] pointer-events-none" />

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left Panel - Branding */}
        <div className="relative hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-center px-12 xl:px-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_0%_50%,hsla(160,50%,42%,0.04),transparent)] pointer-events-none" />
          
          <div className="relative max-w-lg animate-fade-up">
            {/* Chip */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/8 text-primary text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/80" />
              Albion Market
            </div>

            <h1 className="text-3xl xl:text-4xl font-bold leading-[1.2] tracking-tight mb-5">
              Comece a monitorar
              <span className="block text-primary mt-1">seu mercado</span>
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed mb-8">
              Crie sua conta para salvar itens favoritos, comparar cidades e entender
              como o preco se comporta ao longo dos dias.
            </p>

            <ul className="space-y-3">
              {benefits.map((benefit, i) => (
                <li
                  key={benefit}
                  className="flex items-center gap-3 text-sm text-foreground/90 animate-fade-up"
                  style={{ animationDelay: `${0.15 + i * 0.08}s` }}
                >
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="relative flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20 lg:w-1/2 xl:w-[45%]">
          <div className="mx-auto w-full max-w-md animate-fade-up" style={{ animationDelay: "0.08s" }}>
            {/* Mobile chip */}
            <div className="lg:hidden inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/8 text-primary text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/80" />
              Albion Market
            </div>

            <div className="bg-card/60 border border-border/40 backdrop-blur-sm rounded-xl p-7 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-1.5">Criar conta</h2>
                <p className="text-sm text-muted-foreground">
                  Organize seu portfolio de itens e acompanhe precos confiaveis.
                </p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                {/* USERNAME */}
                <div className="field">
                  <Label htmlFor="username" className="text-sm font-medium text-foreground">
                    Usuário
                  </Label>
                  <div className="relative group">
                    <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-opacity duration-200 ${
                      filledFields.has("username") ? "opacity-0" : "opacity-60 group-focus-within:opacity-80"
                    }`} />
                    <Input
                      id="username"
                      type="text"
                      placeholder="nome.albion"
                      autoComplete="username"
                      className="pl-10"
                      {...register("username", {
                        onChange: () => handleFieldChange("username"),
                      })}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-destructive mt-1">{errors.username.message}</p>
                  )}
                </div>

                {/* EMAIL */}
                <div className="field">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </Label>
                  <div className="relative group">
                    <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-opacity duration-200 ${
                      filledFields.has("email") ? "opacity-0" : "opacity-60 group-focus-within:opacity-80"
                    }`} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="voce@exemplo.com"
                      autoComplete="email"
                      className="pl-10"
                      {...register("email", {
                        onChange: () => handleFieldChange("email"),
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* PASSWORD */}
                <div className="field">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Senha
                  </Label>
                  <div className="relative group">
                    <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-opacity duration-200 ${
                      filledFields.has("password") ? "opacity-0" : "opacity-60 group-focus-within:opacity-80"
                    }`} />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="pl-10"
                      {...register("password", {
                        onChange: () => handleFieldChange("password"),
                      })}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="field">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                    Confirmar senha
                  </Label>
                  <div className="relative group">
                    <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-opacity duration-200 ${
                      filledFields.has("confirmPassword") ? "opacity-0" : "opacity-60 group-focus-within:opacity-80"
                    }`} />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repita a senha"
                      autoComplete="new-password"
                      className="pl-10"
                      {...register("confirmPassword", {
                        onChange: () => handleFieldChange("confirmPassword"),
                      })}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {mutation.error && (
                  <p className="text-xs text-destructive mt-1">
                    {mutation.error.message || "Erro ao criar conta."}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full mt-2"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Criando..." : "Criar conta"}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Já possui conta?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Faça login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
