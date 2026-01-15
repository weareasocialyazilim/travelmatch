'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { CanvaButton } from '@/components/canva/CanvaButton';
import {
  CanvaCard,
  CanvaCardBody,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
} from '@/components/canva/CanvaCard';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);

      if (result.requires2FA) {
        router.push('/2fa');
      } else {
        toast.success('Giriş başarılı');
        router.push('/queue');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Giriş başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <CanvaCard className="w-full max-w-md">
        <CanvaCardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <span className="text-xl font-bold text-primary-foreground">
              Lovendo
            </span>
          </div>
          <CanvaCardTitle className="text-2xl">Admin Girişi</CanvaCardTitle>
          <CanvaCardSubtitle>
            Lovendo yönetim paneline giriş yapın
          </CanvaCardSubtitle>
        </CanvaCardHeader>
        <CanvaCardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@lovendo.xyz"
                {...register('email')}
                error={!!errors.email}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  error={!!errors.password}
                  disabled={isLoading}
                />
                <CanvaButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  iconOnly
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </CanvaButton>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <CanvaButton type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Giriş Yap
            </CanvaButton>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Erişim sorunu mu yaşıyorsunuz?{' '}
              <a
                href="mailto:support@lovendo.xyz"
                className="text-primary hover:underline"
              >
                İletişime geçin
              </a>
            </p>
          </div>
        </CanvaCardBody>
      </CanvaCard>
    </div>
  );
}
