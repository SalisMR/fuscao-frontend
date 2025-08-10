import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ✅ variável de ambiente para API (funciona local e na Vercel)
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Admin() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [periodo, setPeriodo] = useState("mes");
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [novaMeta, setNovaMeta] = useState("");

  async function carregarDashboard() {
    try {
      const res = await axios.get(
        `${API}/admin/dashboard?periodo=${periodo}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDados(res.data);
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
    }
  }

  useEffect(() => {
    if (!token || user?.tipo !== "admin") {
      navigate("/");
      return;
    }
    carregarDashboard();
  }, [token, user, periodo]);

  async function salvarNovaMeta() {
    try {
      const valor = parseFloat(novaMeta);
      if (isNaN(valor) || valor <= 0) {
        alert("Digite um valor válido.");
        return;
      }

      await axios.put(
        `${API}/admin/meta`,
        { valor },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditandoMeta(false);
      setNovaMeta("");
      carregarDashboard();
    } catch (err) {
      console.error("Erro ao atualizar meta:", err);
      alert("Erro ao salvar nova meta.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-red-900 text-white">
      {/* Topbar */}
      <div className="w-full bg-black/80 border-b border-red-600 px-6 py-3 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-red-500 font-extrabold tracking-tight">Fuscão Stop Car</span>
          <span className="text-sm text-zinc-400 hidden sm:inline">
            Painel Administrativo
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-400">Bem-vindo, {user?.nome || "admin"}.</span>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="bg-black/60 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="hoje">Hoje</option>
            <option value="semana">Semana</option>
            <option value="mes">Mês</option>
          </select>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-10">
        {/* Ações rápidas */}
        <div className="flex flex-wrap gap-3">
          <Botao to="/GerenciarFuncionarios" label="Gerenciar Funcionários" />
          <Botao to="/Estoque" label="Estoque" />
          <Botao to="/comanda" label="Comanda" />
          <Botao to="/relatorios" label="Relatórios" />
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Resumo label="Comandas" valor={dados?.totalComandas ?? "—"} />
          <Resumo
            label="Faturamento"
            valor={dados ? `R$ ${dados.faturamento.toFixed(2)}` : "—"}
          />
          <Resumo label="Clientes únicos" valor={dados?.clientesUnicos ?? "—"} />
          <Resumo
            label="Estoque crítico"
            valor={dados?.estoqueCritico?.length ?? "—"}
          />
        </div>

        {/* Meta do mês */}
        {dados?.meta && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-red-500">Meta do Mês</h2>
              {!editandoMeta ? (
                <button
                  onClick={() => setEditandoMeta(true)}
                  className="text-sm text-red-400 hover:text-red-300 underline underline-offset-4"
                >
                  Editar Meta
                </button>
              ) : (
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={novaMeta}
                    onChange={(e) => setNovaMeta(e.target.value)}
                    placeholder="Nova meta"
                    className="bg-black/60 border border-white/10 px-2 py-1 text-sm rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <button
                    onClick={salvarNovaMeta}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm rounded"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setEditandoMeta(false);
                      setNovaMeta("");
                    }}
                    className="text-red-400 text-sm hover:text-red-300 underline underline-offset-4"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4">
              {dados.meta.progresso >= 100 && (
                <div className="bg-green-600 text-white p-2 rounded mb-2 shadow text-center font-semibold">
                  🎉 Parabéns! A meta do mês foi atingida!
                </div>
              )}

              <p className="mb-2 text-sm text-zinc-300">
                Meta: <span className="font-semibold">R$ {dados.meta.valor}</span> | Progresso:{" "}
                <span className="font-semibold">{dados.meta.progresso.toFixed(1)}%</span>
              </p>

              <div className="w-full bg-zinc-800/70 h-4 rounded overflow-hidden ring-1 ring-white/10">
                <div
                  className="h-full bg-red-600"
                  style={{ width: `${Math.min(dados.meta.progresso, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Gráfico de faturamento */}
        <div>
          <h2 className="text-lg font-semibold text-red-500 mb-2">Faturamento por Dia</h2>
          <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4 h-[300px]">
            {dados?.comandasPorDia?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dados.comandasPorDia.map((c) => ({
                    dia: `${c._id.dia}/${c._id.mes}`,
                    faturado: c.totalFaturado,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="dia" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{ background: "#0b0b0b", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  />
                  <Bar dataKey="faturado" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-zinc-300 h-full flex items-center justify-center">
                Nenhum dado de comanda nesse período.
              </div>
            )}
          </div>
        </div>

        {/* Últimas comandas */}
        <div>
          <h2 className="text-lg font-semibold text-red-500 mb-2">Últimas Comandas</h2>
          <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4 space-y-2 text-sm text-zinc-200">
            {dados?.ultimasComandas?.length > 0 ? (
              dados.ultimasComandas.map((c) => (
                <div key={c._id} className="border-b border-white/10 pb-2 last:border-none">
                  <p><strong>Cliente:</strong> {c.cliente}</p>
                  <p><strong>Funcionário:</strong> {c.funcionarioId?.nome}</p>
                  <p><strong>Valor:</strong> R$ {c.valorFinal.toFixed(2)}</p>
                  <p><strong>Data:</strong> {new Date(c.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
              ))
            ) : (
              <p className="text-zinc-400">Nenhuma comanda registrada.</p>
            )}
          </div>
        </div>

        {/* Desempenho dos Funcionários */}
        <div>
          <h2 className="text-lg font-semibold text-red-500 mb-2">Desempenho dos Funcionários</h2>
          <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4 overflow-x-auto">
            {dados?.trackingFuncionarios?.length > 0 ? (
              <table className="w-full text-sm text-left text-zinc-200">
                <thead>
                  <tr className="text-zinc-300">
                    <th className="py-2 border-b border-red-600/60">Funcionário</th>
                    <th className="py-2 border-b border-red-600/60">Comandas</th>
                    <th className="py-2 border-b border-red-600/60">Faturamento</th>
                    <th className="py-2 border-b border-red-600/60">Ticket Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.trackingFuncionarios.map((f, i) => (
                    <tr key={i} className="border-b border-white/10">
                      <td className="py-2">{f.nome}</td>
                      <td className="py-2">{f.totalComandas}</td>
                      <td className="py-2">R$ {f.faturamento.toFixed(2)}</td>
                      <td className="py-2">R$ {f.ticketMedio.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-zinc-400">Nenhum dado disponível.</p>
            )}
          </div>
        </div>

        {/* Alertas */}
        <div>
          <h2 className="text-lg font-semibold text-red-500 mb-2">Alertas</h2>
          <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4 text-zinc-300">
            {dados?.estoqueCritico?.length > 0 ? (
              <ul className="list-disc pl-5">
                {dados.estoqueCritico.map((item) => (
                  <li key={item._id}>
                    {item.nome} — estoque: {item.estoque}
                  </li>
                ))}
              </ul>
            ) : (
              "Nenhum alerta de estoque."
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Botao({ to, label }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow ring-1 ring-white/10"
    >
      {label}
    </button>
  );
}

function Resumo({ label, valor }) {
  return (
    <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4 shadow flex flex-col justify-between">
      <span className="text-sm text-zinc-300">{label}</span>
      <span className="text-xl font-semibold mt-2">{valor}</span>
    </div>
  );
}
