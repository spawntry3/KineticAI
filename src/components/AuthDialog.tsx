import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AuthDialog({ open, onOpenChange }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canPasswordAuth = useMemo(() => email.trim().length > 3 && password.length >= 6, [email, password]);
  const canMagicLink = useMemo(() => email.trim().length > 3, [email]);

  const signInWithPassword = async () => {
    if (!canPasswordAuth) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      toast.success("Вы вошли в аккаунт");
      onOpenChange(false);
    } catch (err: unknown) {
      console.error("signInWithPassword error:", err);
      toast.error(err instanceof Error ? err.message : "Не удалось войти");
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async () => {
    if (!canPasswordAuth) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) throw error;
      toast.success("Аккаунт создан. Проверьте почту (если включено подтверждение).");
    } catch (err: unknown) {
      console.error("signUp error:", err);
      toast.error(err instanceof Error ? err.message : "Не удалось зарегистрироваться");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMagicLink = async () => {
    if (!canMagicLink) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      toast.success("Ссылка для входа отправлена на почту");
    } catch (err: unknown) {
      console.error("signInWithOtp error:", err);
      toast.error(err instanceof Error ? err.message : "Не удалось отправить ссылку");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel neon-border border-border/60">
        <DialogHeader>
          <DialogTitle className="font-display">Вход</DialogTitle>
          <DialogDescription>Войдите, чтобы синхронизировать данные между устройствами.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="auth-password">Пароль (необязательно для magic-link)</Label>
            <Input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={sendMagicLink} disabled={isLoading || !canMagicLink}>
              Отправить ссылку
            </Button>
            <Button variant="outline" onClick={signUp} disabled={isLoading || !canPasswordAuth}>
              Регистрация
            </Button>
            <Button onClick={signInWithPassword} disabled={isLoading || !canPasswordAuth}>
              Войти
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

