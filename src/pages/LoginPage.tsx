// src/pages/LoginPage.tsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate, Link, type Location } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ApiErrorShape } from '../api/client';
import '../components/common/common.css';

const loginSchema = z.object({
  username: z.string().min(3, 'Usuário obrigatório'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

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
        (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
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
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-hero">
          <span className="auth-chip">Albion Market • Login</span>
          <h1 className="auth-title">Bem-vindo de volta</h1>
          <p className="auth-subtitle">
            Acesse o painel inteligente e acompanhe seus itens, cidades e oportunidades
            de mercado em tempo real.
          </p>

          <ul className="auth-benefits">
            <li>• Visual profissional para leitura rápida dos preços</li>
            <li>• Itens favoritos sincronizados na nuvem</li>
            <li>• Histórico para entender o comportamento do mercado</li>
          </ul>
        </div>

        <div className="card auth-card">
          <h2 className="auth-card-title">Entrar na sua conta</h2>
          <p className="muted auth-card-subtitle">
            Use seu usuário configurado no Albion Market.  
          </p>

          <form className="form auth-form" onSubmit={handleSubmit(onSubmit)}>
            <label className="form-field">
              <span className="form-label">Usuário</span>
              <input
                type="text"
                placeholder="nome.albion"
                autoComplete="username"
                {...register('username')}
              />
              {errors.username && (
                <span className="form-error">{errors.username.message}</span>
              )}
            </label>

            <label className="form-field">
              <span className="form-label">Senha</span>
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <span className="form-error">{errors.password.message}</span>
              )}
            </label>

            {mutation.error && (
              <p className="form-error auth-error">
                {mutation.error.message || 'Não foi possível fazer login.'}
              </p>
            )}

            <button
              type="submit"
              className="primary-button auth-submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="muted auth-footer-text">
            Ainda não tem conta? <Link to="/signup">Crie uma agora</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
