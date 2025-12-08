// src/pages/SignupPage.tsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ApiErrorShape } from '../api/client';
import '../components/common/common.css';

const signupSchema = z
  .object({
    username: z.string().min(3, 'Informe um usuário válido'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo de 6 caracteres'),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem',
  });

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const mutation = useMutation<void, ApiErrorShape, SignupFormData>({
    mutationFn: async (values) => {
      await signup({
        username: values.username,
        email: values.email,
        password: values.password,
      });
    },
    onSuccess: () => {
      // AuthContext já faz login automático após signup
      navigate('/dashboard');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (values: SignupFormData) => mutation.mutate(values);

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-hero">
          <span className="auth-chip">Albion Market • Cadastro</span>
          <h1 className="auth-title">Comece a monitorar seu mercado</h1>
          <p className="auth-subtitle">
            Crie sua conta para salvar itens favoritos, comparar cidades e entender
            como o preço se comporta ao longo dos dias.
          </p>

          <ul className="auth-benefits">
            <li>• Itens sincronizados por usuário</li>
            <li>• Visual profissional para decisões rápidas</li>
            <li>• Histórico de preço integrado ao painel</li>
          </ul>
        </div>

        <div className="card auth-card">
          <h2 className="auth-card-title">Criar conta</h2>
          <p className="muted auth-card-subtitle">
            Organize seu portfólio de itens e acompanhe preços confiáveis.
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
              <span className="form-label">Email</span>
              <input
                type="email"
                placeholder="voce@exemplo.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <span className="form-error">{errors.email.message}</span>
              )}
            </label>

            <label className="form-field">
              <span className="form-label">Senha</span>
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('password')}
              />
              {errors.password && (
                <span className="form-error">{errors.password.message}</span>
              )}
            </label>

            <label className="form-field">
              <span className="form-label">Confirmar senha</span>
              <input
                type="password"
                placeholder="Repita a senha"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <span className="form-error">
                  {errors.confirmPassword.message}
                </span>
              )}
            </label>

            {mutation.error && (
              <p className="form-error auth-error">
                {mutation.error.message || 'Não foi possível criar a conta.'}
              </p>
            )}

            <button
              type="submit"
              className="primary-button auth-submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Criando...' : 'Criar conta'}
            </button>
          </form>

          <p className="muted auth-footer-text">
            Já possui conta? <Link to="/login">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
