'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { CanvaButton } from '@/components/canva/CanvaButton';
import {
  CanvaCard,
  CanvaCardBody,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
  CanvaCardFooter,
} from '@/components/canva/CanvaCard';
import Image from 'next/image';

interface SetupData {
  secret: string;
  qrCodeURL: string;
}

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<'loading' | 'scan' | 'verify'>('loading');
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Fetch setup data on mount
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchSetupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  const fetchSetupData = async () => {
    try {
      const response = await fetch('/api/auth/setup-2fa', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.error === '2FA zaten aktif') {
          toast.info('2FA zaten aktif');
          router.push('/queue');
          return;
        }
        throw new Error(data.error || 'Setup başlatılamadı');
      }

      setSetupData(data);
      setStep('scan');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
      router.push('/login');
    }
  };

  const copySecret = async () => {
    if (!setupData) return;

    try {
      await navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      toast.success('Secret kopyalandı');
      setTimeout(() => setCopied(false), 2000);
    } catch (copyError) {
      toast.error('Kopyalama başarısız');
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      const char = pastedData[i];
      if (char !== undefined) {
        newCode[i] = char;
      }
    }
    setCode(newCode);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      toast.error('Lütfen 6 haneli kodu girin');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/setup-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: fullCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Doğrulama başarısız');
      }

      toast.success('2FA başarıyla aktifleştirildi!');
      router.push('/queue');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Doğrulama başarısız',
      );
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50">
        <CanvaCard className="w-full max-w-md">
          <CanvaCardBody className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">
              2FA kurulumu hazırlanıyor...
            </p>
          </CanvaCardBody>
        </CanvaCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <CanvaCard className="w-full max-w-md">
        <CanvaCardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <CanvaCardTitle className="text-2xl">2FA Kurulumu</CanvaCardTitle>
          <CanvaCardSubtitle>
            {step === 'scan'
              ? 'Authenticator uygulamanızla QR kodu tarayın'
              : 'Uygulamadaki 6 haneli kodu girin'}
          </CanvaCardSubtitle>
        </CanvaCardHeader>

        <CanvaCardBody className="space-y-6">
          {step === 'scan' && setupData && (
            <>
              {/* QR Code */}
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-lg border bg-card p-4">
                  <Image
                    src={setupData.qrCodeURL}
                    alt="2FA QR Code"
                    width={200}
                    height={200}
                    className="rounded"
                  />
                </div>

                {/* Manual Entry */}
                <div className="w-full space-y-2">
                  <p className="text-center text-sm text-muted-foreground">
                    QR tarayamıyorsanız bu kodu manuel girin:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono break-all">
                      {setupData.secret}
                    </code>
                    <CanvaButton
                      type="button"
                      variant="primary"
                      size="sm"
                      iconOnly
                      onClick={copySecret}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </CanvaButton>
                  </div>
                </div>
              </div>

              <CanvaButton
                onClick={() => {
                  setStep('verify');
                  setTimeout(() => inputRefs.current[0]?.focus(), 100);
                }}
                className="w-full"
              >
                Devam Et
              </CanvaButton>
            </>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="h-14 w-12 text-center text-2xl font-semibold"
                    disabled={isLoading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <CanvaButton
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Doğrulanıyor...
                  </>
                ) : (
                  '2FA Aktifleştir'
                )}
              </CanvaButton>

              <CanvaButton
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('scan')}
                disabled={isLoading}
              >
                QR Kodu Tekrar Göster
              </CanvaButton>
            </form>
          )}
        </CanvaCardBody>

        <CanvaCardFooter className="flex justify-center">
          <p className="text-xs text-muted-foreground text-center">
            Google Authenticator, Authy veya benzer bir <br />
            TOTP uygulaması kullanın
          </p>
        </CanvaCardFooter>
      </CanvaCard>
    </div>
  );
}
