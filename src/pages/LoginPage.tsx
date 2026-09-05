// src/pages/LoginPage.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate, Link, type Location } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import type { ApiErrorShape } from "../api/client";
import { resendVerificationRequest } from "../api/auth";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { User, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { getSafeReturnTo } from "../utils/returnTo";
import "./auth-pages.css";

type LoginFormData = {
  username: string;
  password: string;
};

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [filledFields, setFilledFields] = useState<Set<string>>(new Set());
  const [infoMessageDismissed, setInfoMessageDismissed] = useState(false);
  const [resendStatus, setResendStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [resendError, setResendError] = useState<string | null>(null);

  const loginSchema = useMemo(
    () =>
      z.object({
        username: z.string().min(3, t("login.invalidUsername")),
        password: z.string().min(6, t("login.invalidPassword")),
      }),
    [t],
  );

  const loginBenefits = useMemo(() => {
    const benefits = t("login.benefits", { returnObjects: true });
    return Array.isArray(benefits) ? (benefits as string[]) : [];
  }, [t]);

  const locationState = location.state as
    | { from?: Location; fromSignup?: boolean; email?: string }
    | null;

  const mutation = useMutation<void, ApiErrorShape, LoginFormData>({
    mutationFn: async (formData) => {
      await login(formData);
    },
    onSuccess: () => {
      const searchParams = new URLSearchParams(location.search);
      const returnTo = getSafeReturnTo(searchParams.get("returnTo"));
      const from = (location.state as { from?: Location })?.from;
      const fromPath =
        from != null ? `${from.pathname}${from.search || ""}` : null;
      const redirectTo = returnTo ?? fromPath ?? "/dashboard";
      navigate(redirectTo, { replace: true });
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const formValues = watch();

  const handleFieldChange = (fieldName: string) => {
    const newSet = new Set(filledFields);
    if (formValues[fieldName as keyof LoginFormData]) {
      newSet.add(fieldName);
    } else {
      newSet.delete(fieldName);
    }
    setFilledFields(newSet);
  };

  const onSubmit = (data: LoginFormData) => mutation.mutate(data);

  const handleResendVerification = async () => {
    const email =
      locationState?.email || window.prompt(t("login.promptEmail"));

    if (!email) return;

    try {
      setResendStatus("loading");
      setResendError(null);
      await resendVerificationRequest(email);
      setResendStatus("success");
    } catch (error) {
      const err = error as ApiErrorShape;
      setResendStatus("error");
      setResendError(err.message || t("login.resendError"));
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Hero gradient overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsla(187,85%,53%,0.12),transparent)] pointer-events-none" />

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left Panel - Branding */}
        <div className="relative hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-center px-12 xl:px-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_50%,hsla(142,71%,45%,0.08),transparent)] pointer-events-none" />

          <div className="relative max-w-lg animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium tracking-wide uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
              {t("login.chip")}
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight mb-6">
              {t("login.welcomeBack")}
              <span className="block text-gradient mt-1">{t("login.welcomePanel")}</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              {t("login.heroDescription")}
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
            <div className="lg:hidden inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium tracking-wide uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
              Albion Market
            </div>

            <div className="glass rounded-3xl p-8 sm:p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {t("login.title")}
                </h2>
                <p className="text-muted-foreground">
                  {t("login.description")}
                </p>
              </div>

              {locationState?.fromSignup && !infoMessageDismissed && (
                <div className="mb-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 flex items-start justify-between gap-3">
                  <span>
                    {t("login.accountCreated")}{" "}
                    <strong>{locationState.email || t("login.yourEmail")}</strong>.{" "}
                    {t("login.confirmBeforeLogin")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setInfoMessageDismissed(true)}
                    className="ml-2 text-emerald-200/70 hover:text-emerald-100 text-[10px] uppercase tracking-wide"
                  >
                    {t("common.close")}
                  </button>
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="field">
                  <Label htmlFor="username" className="text-sm font-medium text-foreground">
                    {t("login.username")}
                  </Label>
                  <div className="relative group">
                    <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-opacity duration-200 ${
                      filledFields.has("username") ? "opacity-0" : "opacity-60 group-focus-within:opacity-80"
                    }`} />
                    <Input
                      id="username"
                      type="text"
                      placeholder={t("login.usernamePlaceholder")}
                      autoComplete="username"
                      className="pl-10"
                      {...register("username", {
                        onChange: () => handleFieldChange("username"),
                      })}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="field">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    {t("login.password")}
                  </Label>
                  <div className="relative group">
                    <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-opacity duration-200 ${
                      filledFields.has("password") ? "opacity-0" : "opacity-60 group-focus-within:opacity-80"
                    }`} />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="pl-10"
                      {...register("password", {
                        onChange: () => handleFieldChange("password"),
                      })}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {mutation.error && (
                  <div className="mt-2 text-xs">
                    <p className="text-destructive">
                      {mutation.error.status === 403
                        ? t("login.emailUnverified")
                        : mutation.error.message || t("login.loginError")}
                    </p>

                    {mutation.error.status === 403 && (
                      <div className="mt-2 flex flex-col gap-1 text-[11px]">
                        <button
                          type="button"
                          onClick={handleResendVerification}
                          className="self-start text-primary hover:underline font-medium"
                          disabled={resendStatus === "loading"}
                        >
                          {resendStatus === "loading"
                            ? t("login.resending")
                            : t("login.resendVerification")}
                        </button>
                        {resendStatus === "success" && (
                          <p className="text-emerald-400">
                            {t("login.resendSuccess")}
                          </p>
                        )}
                        {resendStatus === "error" && resendError && (
                          <p className="text-destructive">{resendError}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full mt-2"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? t("login.enteringDots") : t("login.submit")}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                {t("login.noAccount")}{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  {t("login.createNow")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
