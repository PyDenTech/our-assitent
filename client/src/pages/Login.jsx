import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Users, ShieldCheck, Mail, Lock, UserPlus, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import * as api from "@/api/apiClient";

/* ===========================
   Background animado (aurora + grid + partículas)
   =========================== */
function BackgroundFX({ showGrid = true, showParticles = true, intensity = 1 }) {
  const particles = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    x: (i * 37) % 100,
    y: (i * 53) % 100,
    delay: (i % 6) * 0.6,
    dur: 6 + (i % 5),
    size: 2 + (i % 3),
  }));

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Blobs/Aurora */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.35, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute -top-24 -left-24 h-[38rem] w-[38rem] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(35% 35% at 50% 50%, rgba(99,102,241,0.55), rgba(99,102,241,0) 70%)",
            filter: `blur(${36 * intensity}px)`,
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.30, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.1 }}
          className="absolute -bottom-24 -right-24 h-[40rem] w-[40rem] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(35% 35% at 50% 50%, rgba(79,70,229,0.55), rgba(79,70,229,0) 70%)",
            filter: `blur(${38 * intensity}px)`,
          }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.18 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 30%, rgba(59,130,246,0.25), rgba(0,0,0,0) 60%)",
          }}
        />
      </div>

      {/* Grid */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px, 40px 40px",
            color: "rgba(31,41,55,1)",
            mixBlendMode: "multiply",
          }}
        />
      )}

      {/* Partículas */}
      {showParticles && (
        <div className="absolute inset-0">
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute rounded-full bg-indigo-400/40 dark:bg-indigo-300/30 shadow"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
              }}
              initial={{ y: 0, opacity: 0.0 }}
              animate={{ y: -30, opacity: 0.8 }}
              transition={{
                duration: p.dur,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: p.delay,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const GOOGLE_G_SRC =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/480px-Google_%22G%22_logo.svg.png";

export default function AuthPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState("");

  const passwordScore = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 4);
  }, [password]);

  const canSubmit =
    mode === "login"
      ? email && password
      : mode === "register"
      ? email && name && password && confirm && password === confirm
      : email;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setErr("");
    setIsLoading(true);
    try {
      if (mode === "login") {
        await api.login(email, password);
        await queryClient.invalidateQueries();
        navigate("/dashboard");
      } else if (mode === "register") {
        await api.register({ name, email, password });
        await queryClient.invalidateQueries();
        navigate("/dashboard");
      } else {
        await api.requestPasswordReset(email);
        setMode("login");
      }
    } catch (error) {
      setErr(error?.message || "Falha na operação. Verifique os dados e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogle() {
    const base = import.meta.env.VITE_BACKEND_URL || '';
    if (base) window.location.href = `${base}/auth/google`;
    else setErr("Defina VITE_BACKEND_URL para usar o OAuth do Google.");
  }

  const passwordAutoComplete =
    mode === "register" ? "new-password" : mode === "login" ? "current-password" : "off";

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-black dark:to-gray-950">
      {/* Background animado */}
      <BackgroundFX showGrid={true} showParticles={true} intensity={1} />

      <Card className="w-full max-w-md shadow-2xl shadow-blue-500/10 dark:bg-gray-950 dark:border-gray-800 relative">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <motion.div
              initial={{ scale: 0.9, rotate: -3, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Users className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === "login" && "Entrar no OurAssist"}
            {mode === "register" && "Criar conta no OurAssist"}
            {mode === "forgot" && "Recuperar acesso"}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {mode === "login" && "Acesse sua conta para continuar."}
            {mode === "register" && "Cadastre-se para começar a usar a plataforma."}
            {mode === "forgot" && "Informe seu e-mail para receber instruções."}
          </CardDescription>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button
              aria-label="Ir para Entrar"
              variant={mode === "login" ? "default" : "secondary"}
              onClick={() => setMode("login")}
              disabled={isLoading}
            >
              <LogIn className="mr-2 h-4 w-4" /> Entrar
            </Button>
            <Button
              aria-label="Ir para Cadastrar"
              variant={mode === "register" ? "default" : "secondary"}
              onClick={() => setMode("register")}
              disabled={isLoading}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Cadastrar
            </Button>
            <Button
              aria-label="Ir para Recuperar acesso"
              variant={mode === "forgot" ? "default" : "secondary"}
              onClick={() => setMode("forgot")}
              disabled={isLoading}
            >
              <ShieldCheck className="mr-2 h-4 w-4" /> Recuperar
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode !== "register" ? null : (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <Label htmlFor="name" className="dark:text-gray-200">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-200">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  className="pl-9"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-gray-200">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    className="pl-9 pr-10"
                    placeholder={mode === "register" ? "Mín. 8 caracteres" : "Sua senha"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={8}
                    autoComplete={passwordAutoComplete}
                  />
                  <button
                    type="button"
                    aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {mode === "register" && (
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-gray-200 dark:bg-gray-800 rounded">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(passwordScore / 4) * 100}%` }}
                        className={
                          "h-1 rounded " +
                          (passwordScore <= 1
                            ? "bg-red-500"
                            : passwordScore === 2
                            ? "bg-yellow-500"
                            : passwordScore === 3
                            ? "bg-green-500"
                            : "bg-emerald-600")
                        }
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Use letras maiúsculas e minúsculas, números e símbolos.
                    </p>
                  </div>
                )}
              </div>
            )}

            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="confirm" className="dark:text-gray-200">Confirmar senha</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Repita a senha"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="new-password"
                />
                {confirm && confirm !== password && (
                  <p className="text-xs text-red-600 dark:text-red-500">
                    As senhas não coincidem.
                  </p>
                )}
              </div>
            )}

            <AnimatePresence>
              {err && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-sm font-medium text-red-600 dark:text-red-500 text-center"
                >
                  {err}
                </motion.p>
              )}
            </AnimatePresence>

            <Button type="submit" className="w-full" disabled={isLoading || !canSubmit} size="lg">
              {isLoading
                ? mode === "login"
                  ? "Acessando..."
                  : mode === "register"
                  ? "Criando..."
                  : "Enviando..."
                : mode === "login"
                ? "Acessar"
                : mode === "register"
                ? "Criar conta"
                : "Enviar e-mail de recuperação"}
            </Button>

            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-indigo-600 hover:underline"
                  onClick={() => setMode("forgot")}
                  disabled={isLoading}
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t dark:border-gray-800" />
              </div>
            </div>

            <div className="grid gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleGoogle}
                disabled={isLoading}
                className="w-full"
                aria-label="Continuar com Google"
              >
                <img
                  src={GOOGLE_G_SRC}
                  alt=""
                  aria-hidden="true"
                  className="h-4 w-4 mr-2"
                  loading="lazy"
                  width="16"
                  height="16"
                />
                Continuar com Google
              </Button>
            </div>

            {mode === "register" && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Ao criar a conta, você concorda com os Termos e a Política de Privacidade.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
