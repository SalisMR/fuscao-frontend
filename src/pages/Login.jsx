import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  // Base da API pega da variável de ambiente ou usa localhost no dev
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email,
        senha,
      });

      const { token, user } = res.data;
      login(user, token);

      setTimeout(() => {
        if (user.tipo.toLowerCase() === "admin") {
          navigate("/admin");
        } else {
          navigate("/comanda");
        }
      }, 100);
    } catch {
      setErro("Credenciais inválidas");
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-red-900">
      <img
        src="/fusca.svg"
        alt=""
        className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 w-[1200px] max-w-none"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
        draggable="false"
      />

      <div className="relative z-10 w-full max-w-md text-white rounded-2xl bg-black/70 backdrop-blur-sm ring-1 ring-white/10 shadow-2xl p-8 md:p-10">
        <img
          src="/fusca.svg"
          alt="FUSCÃO STOP CAR"
          className="h-16 md:h-20 mx-auto mb-4"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          draggable="false"
        />

        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-red-500 mb-6">
          FUSCÃO STOP CAR
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full p-3 rounded bg-zinc-900 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm mb-1">
              Senha
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              className="w-full p-3 rounded bg-zinc-900 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {erro && <p className="text-red-400 text-sm">{erro}</p>}

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 transition py-3 rounded font-semibold"
          >
            Entrar
          </button>

          <div className="text-center text-sm mt-4">
            <a href="#" className="text-white underline">
              Esqueci minha senha
            </a>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            2025 | Desenvolvido por Fuscao Team
          </p>
        </form>
      </div>
    </div>
  );
}
