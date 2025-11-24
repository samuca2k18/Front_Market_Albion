import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: () => {
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

  const onSubmit = (values: SignupFormData) => {
    mutation.mutate({
      username: values.username,
      email: values.email,
      password: values.password,
    });
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2>Criar conta</h2>
        <p className="muted">Organize seu portfólio de itens e acompanhe preços confiáveis.</p>

        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          <label>
            Usuário
            <input type="text" placeholder="nome.albion" {...register('username')} />
            {errors.username && <span className="form-error">{errors.username.message}</span>}
          </label>

          <label>
            Email
            <input type="email" placeholder="voce@exemplo.com" {...register('email')} />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </label>

          <label>
            Senha
            <input type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </label>

          <label>
            Confirmar senha
            <input type="password" placeholder="Repita a senha" {...register('confirmPassword')} />
            {errors.confirmPassword && (
              <span className="form-error">{errors.confirmPassword.message}</span>
            )}
          </label>

          {mutation.error && (
            <p className="form-error">
              {mutation.error instanceof Error
                ? mutation.error.message
                : 'Não foi possível criar a conta.'}
            </p>
          )}

          <button type="submit" className="primary-button" disabled={mutation.isPending}>
            {mutation.isPending ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="muted">
          Já possui conta? <Link to="/login">Faça login</Link>
        </p>
      </div>
    </div>
  );
}

