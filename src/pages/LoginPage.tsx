import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate, Link, type Location } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
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
      <div className="card auth-card">
        <h2>Entrar</h2>
        <p className="muted">Acesse o painel completo e acompanhe seus itens em tempo real.</p>

        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          <label>
            Usuário
            <input type="text" placeholder="nome.albion" {...register('username')} />
            {errors.username && <span className="form-error">{errors.username.message}</span>}
          </label>

          <label>
            Senha
            <input type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </label>

          {mutation.error && (
            <p className="form-error">
              {mutation.error instanceof Error
                ? mutation.error.message
                : 'Não foi possível fazer login.'}
            </p>
          )}

          <button type="submit" className="primary-button" disabled={mutation.isPending}>
            {mutation.isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="muted">
          Ainda não tem conta? <Link to="/signup">Crie uma agora</Link>
        </p>
      </div>
    </div>
  );
}

