import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Estoque() {
  const { token } = useAuth();
  const [estoque, setEstoque] = useState([]);
  const [itensMaisVendidos, setItensMaisVendidos] = useState([]);
  const [tipoFiltro, setTipoFiltro] = useState("produto");
  const [novoItem, setNovoItem] = useState({
    nome: "", tipo: "produto", quantidade: 0, valor: 0,
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    if (!token) return;
    buscarEstoque();
    buscarComandas();
  }, []);

  const buscarEstoque = async () => {
    try {
      const res = await axios.get(`${API}/itens`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEstoque(res.data);
    } catch (err) {
      console.error("Erro ao buscar estoque:", err);
    }
  };

  const buscarComandas = async () => {
    try {
      const res = await axios.get(`${API}/comandas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const agrupado = {};
      res.data.forEach((comanda) => {
        comanda.itens.forEach((item) => {
          const chave = item.nome?.trim();
          const tipoNormalizado = item.tipo === "produto" ? "produto" : "servico";
          if (!chave || !item.quantidade) return;
          if (!agrupado[chave]) {
            agrupado[chave] = { nome: chave, tipo: tipoNormalizado, quantidade: item.quantidade };
          } else {
            agrupado[chave].quantidade += item.quantidade;
          }
        });
      });
      setItensMaisVendidos(Object.values(agrupado));
    } catch (err) {
      console.error("Erro ao buscar comandas:", err);
    }
  };

  const salvarItem = async () => {
    try {
      if (editando) {
        await axios.put(`${API}/itens/${editando._id}`, novoItem, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API}/itens`, novoItem, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setNovoItem({ nome: "", tipo: "produto", quantidade: 0, valor: 0 });
      setEditando(null);
      buscarEstoque();
    } catch (err) {
      console.error("Erro ao salvar item:", err);
    }
  };

  const removerItem = async (id) => {
    if (!confirm("Tem certeza que deseja remover este item?")) return;
    try {
      await axios.delete(`${API}/itens/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      buscarEstoque();
    } catch (err) {
      console.error("Erro ao remover item:", err);
    }
  };

  const iniciarEdicao = (item) => {
    setNovoItem({
      nome: item.nome,
      tipo: item.tipo,
      quantidade: item.quantidade || 0,
      valor: item.valor || 0,
    });
    setEditando(item);
  };

  const dadosFiltrados = itensMaisVendidos
    .filter((item) => item.tipo === tipoFiltro)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-red-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-red-500">Gestão</span> de Estoque
          </h1>

          <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-1 flex">
            <button
              onClick={() => setTipoFiltro("produto")}
              className={`px-3 py-1 rounded-md text-sm transition ${
                tipoFiltro === "produto" ? "bg-red-600" : "hover:bg-white/5 text-zinc-300"
              }`}
            >
              Produtos
            </button>
            <button
              onClick={() => setTipoFiltro("servico")}
              className={`px-3 py-1 rounded-md text-sm transition ${
                tipoFiltro === "servico" ? "bg-red-600" : "hover:bg-white/5 text-zinc-300"
              }`}
            >
              Serviços
            </button>
          </div>
        </div>

        {/* Form novo item / edição */}
        <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-red-500">
              {editando ? "Editar Item" : "Adicionar Novo Item"}
            </h2>
            {editando && (
              <span className="text-xs text-zinc-300">Editando: <strong>{editando.nome}</strong></span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Nome"
              value={novoItem.nome}
              onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
              className="bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <select
              value={novoItem.tipo}
              onChange={(e) => setNovoItem({ ...novoItem, tipo: e.target.value })}
              className="bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="produto">Produto</option>
              <option value="servico">Serviço</option>
            </select>
            {novoItem.tipo === "produto" && (
              <input
                type="number"
                placeholder="Quantidade"
                value={novoItem.quantidade}
                onChange={(e) => setNovoItem({ ...novoItem, quantidade: Number(e.target.value) })}
                className="bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded w-32 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            )}
            <input
              type="number"
              placeholder="Valor R$"
              value={novoItem.valor}
              onChange={(e) => setNovoItem({ ...novoItem, valor: Number(e.target.value) })}
              className="bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded w-32 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <button
              onClick={salvarItem}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold ring-1 ring-white/10"
            >
              {editando ? "Salvar Alterações" : "Adicionar Item"}
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4 overflow-auto">
          <h2 className="text-lg font-semibold text-red-500 mb-2">Itens no Estoque</h2>
          <table className="w-full table-auto text-sm text-left">
            <thead>
              <tr className="text-zinc-300">
                <th className="px-3 py-2 border-b border-red-600/60">Nome</th>
                <th className="px-3 py-2 border-b border-red-600/60">Tipo</th>
                <th className="px-3 py-2 border-b border-red-600/60">Quantidade</th>
                <th className="px-3 py-2 border-b border-red-600/60">Valor</th>
                <th className="px-3 py-2 border-b border-red-600/60">Ações</th>
              </tr>
            </thead>
            <tbody>
              {estoque.map((item) => (
                <tr key={item._id} className="border-b border-white/10">
                  <td className="px-3 py-2">{item.nome}</td>
                  <td className="px-3 py-2 capitalize">{item.tipo}</td>
                  <td className="px-3 py-2">{item.tipo === "produto" ? item.quantidade : "-"}</td>
                  <td className="px-3 py-2">R$ {Number(item.valor ?? 0).toFixed(2)}</td>
                  <td className="px-3 py-2 space-x-2">
                    <button className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 ring-1 ring-white/10" onClick={() => iniciarEdicao(item)} title="Editar">✏️</button>
                    <button className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 ring-1 ring-white/10" onClick={() => removerItem(item._id)} title="Remover">🗑️</button>
                  </td>
                </tr>
              ))}
              {estoque.length === 0 && (
                <tr><td colSpan="5" className="text-center text-zinc-400 py-4">Nenhum item no estoque.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Gráfico */}
        <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-red-500">
              {tipoFiltro === "produto" ? "Produtos Mais Vendidos" : "Serviços Mais Realizados"}
            </h2>
          </div>

          {dadosFiltrados.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosFiltrados}>
                  <XAxis dataKey="nome" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{ background: "#0b0b0b", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  />
                  <Bar dataKey="quantidade" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-zinc-300">Sem dados suficientes para exibir o gráfico.</p>
          )}
        </div>
      </div>
    </div>
  );
}
