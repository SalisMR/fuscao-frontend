import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function GerenciarFuncionarios() {
  const { token, user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    tipo: "funcionario",
    comissaoProduto: "",
    comissaoServico: ""
  });
  const [editando, setEditando] = useState(null);

  const carregar = async () => {
    const res = await axios.get(`${API}/auth/usuarios`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsuarios(res.data);
  };

  const salvar = async () => {
    try {
      const payload = {
        ...form,
        comissaoProduto: Number(form.comissaoProduto),
        comissaoServico: Number(form.comissaoServico),
      };

      if (editando) {
        await axios.put(`${API}/auth/usuarios/${editando}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API}/auth/register`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setForm({
        nome: "",
        email: "",
        senha: "",
        tipo: "funcionario",
        comissaoProduto: "",
        comissaoServico: ""
      });
      setEditando(null);
      carregar();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  const editar = (u) => {
    setForm({
      nome: u.nome,
      email: u.email,
      senha: "",
      tipo: u.tipo,
      comissaoProduto: u.comissaoProduto || "",
      comissaoServico: u.comissaoServico || ""
    });
    setEditando(u._id);
  };

  const excluir = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      await axios.delete(`${API}/auth/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      carregar();
    }
  };

  useEffect(() => {
    if (token && user?.tipo === "admin") carregar();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-red-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-red-500">Gerenciar</span> Funcionários e Admins
        </h1>

        <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <input
              placeholder="Nome"
              value={form.nome}
              onChange={e => setForm({ ...form, nome: e.target.value })}
              className="w-full px-3 py-2 rounded bg-zinc-900 border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <input
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 rounded bg-zinc-900 border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <input
              placeholder="Senha"
              type="password"
              value={form.senha}
              onChange={e => setForm({ ...form, senha: e.target.value })}
              className="w-full px-3 py-2 rounded bg-zinc-900 border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <select
              value={form.tipo}
              onChange={e => setForm({ ...form, tipo: e.target.value })}
              className="w-full px-3 py-2 rounded bg-zinc-900 border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="funcionario">Funcionário</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <input
              placeholder="Comissão Produto (%)"
              type="number"
              value={form.comissaoProduto}
              onChange={e => setForm({ ...form, comissaoProduto: e.target.value })}
              className="w-full px-3 py-2 rounded bg-zinc-900 border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <input
              placeholder="Comissão Serviço (%)"
              type="number"
              value={form.comissaoServico}
              onChange={e => setForm({ ...form, comissaoServico: e.target.value })}
              className="w-full px-3 py-2 rounded bg-zinc-900 border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={salvar}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold ring-1 ring-white/10"
            >
              {editando ? "Salvar Alterações" : "Cadastrar"}
            </button>
            {editando && (
              <button
                onClick={() => { setEditando(null); setForm({
                  nome: "", email: "", senha: "", tipo: "funcionario", comissaoProduto: "", comissaoServico: ""
                }); }}
                className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 ring-1 ring-white/10"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-zinc-300">
                <th className="px-3 py-2 border-b border-red-600/60">Nome</th>
                <th className="px-3 py-2 border-b border-red-600/60">Email</th>
                <th className="px-3 py-2 border-b border-red-600/60">Tipo</th>
                <th className="px-3 py-2 border-b border-red-600/60">Comissão Produto</th>
                <th className="px-3 py-2 border-b border-red-600/60">Comissão Serviço</th>
                <th className="px-3 py-2 border-b border-red-600/60">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u._id} className="border-b border-white/10">
                  <td className="px-3 py-2">{u.nome}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2 capitalize">{u.tipo}</td>
                  <td className="px-3 py-2">{u.comissaoProduto ?? 0}%</td>
                  <td className="px-3 py-2">{u.comissaoServico ?? 0}%</td>
                  <td className="px-3 py-2 space-x-2">
                    <button
                      onClick={() => editar(u)}
                      className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 ring-1 ring-white/10"
                      title="Editar"
                    >
                      ✏️ Editar
                    </button>
                    {user?._id !== u._id && (
                      <button
                        onClick={() => excluir(u._id)}
                        className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white ring-1 ring-white/10"
                        title="Excluir"
                      >
                        🗑️ Excluir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-zinc-400 py-4">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default GerenciarFuncionarios;
