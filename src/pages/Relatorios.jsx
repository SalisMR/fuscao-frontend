import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Relatorios() {
  const { user, token } = useAuth();
  const [filtros, setFiltros] = useState({
    inicio: "",
    fim: "",
    funcionario: "",
    busca: "",
  });
  const [funcionarios, setFuncionarios] = useState([]);
  const [resumo, setResumo] = useState({});
  const [comandas, setComandas] = useState([]);
  const [exportar, setExportar] = useState({
    resumo: true,
    produtos: true,
    servicos: true,
    comandas: true,
  });

  useEffect(() => {
    if (!token || user?.tipo !== "admin") return;
    buscarFuncionarios();
    buscar();
  }, []);

  const buscarFuncionarios = async () => {
    try {
      const res = await axios.get(`${API}/auth/funcionarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFuncionarios(res.data);
    } catch (err) {
      console.error("Erro ao buscar funcionários:", err);
    }
  };

  const buscar = async () => {
    try {
      const params = { ...filtros };
      const res = await axios.get(`${API}/relatorios/comandas/relatorio/detalhado`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setResumo(res.data.resumo);
      setComandas(res.data.comandas);
    } catch (err) {
      console.error("Erro ao buscar relatórios:", err);
    }
  };

  const gerarPDF = async () => {
    try {
      const payload = { filtros, opcoes: exportar };
      const res = await axios.post(`${API}/relatorios/exportar-pdf`, payload, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "relatorio.pdf";
      link.click();
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    }
  };

  const gerarPDFComanda = async (id) => {
    try {
      const res = await axios.get(`${API}/comandas/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `comanda-${id}.pdf`;
      link.click();
    } catch (err) {
      console.error("Erro ao gerar PDF da comanda:", err);
    }
  };

  const excluirComanda = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta comanda?")) return;
    try {
      await axios.delete(`${API}/comandas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComandas((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Erro ao excluir comanda:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Relatórios Detalhados</h1>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 bg-zinc-800 p-4 rounded">
          <input type="date" value={filtros.inicio} onChange={e => setFiltros({ ...filtros, inicio: e.target.value })} className="bg-zinc-900 text-white px-3 py-2 rounded" />
          <input type="date" value={filtros.fim} onChange={e => setFiltros({ ...filtros, fim: e.target.value })} className="bg-zinc-900 text-white px-3 py-2 rounded" />
          <input type="text" placeholder="Buscar cliente ou WhatsApp" value={filtros.busca} onChange={e => setFiltros({ ...filtros, busca: e.target.value })} className="bg-zinc-900 text-white px-3 py-2 rounded" />
          <select value={filtros.funcionario} onChange={e => setFiltros({ ...filtros, funcionario: e.target.value })} className="bg-zinc-900 text-white px-3 py-2 rounded">
            <option value="">Todos Funcionários</option>
            {funcionarios.map(f => <option key={f._id} value={f._id}>{f.nome}</option>)}
          </select>
          <button onClick={buscar} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Buscar</button>
        </div>

        {/* Exportar PDF */}
        <div className="bg-zinc-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Exportar PDF</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <label><input type="checkbox" checked={exportar.resumo} onChange={e => setExportar({ ...exportar, resumo: e.target.checked })} /> Resumo</label>
            <label><input type="checkbox" checked={exportar.produtos} onChange={e => setExportar({ ...exportar, produtos: e.target.checked })} /> Produtos</label>
            <label><input type="checkbox" checked={exportar.servicos} onChange={e => setExportar({ ...exportar, servicos: e.target.checked })} /> Serviços</label>
            <label><input type="checkbox" checked={exportar.comandas} onChange={e => setExportar({ ...exportar, comandas: e.target.checked })} /> Comandas</label>
            <button onClick={gerarPDF} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Gerar PDF</button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-800 p-4 rounded-lg text-sm text-white">
          <div>Comandas: <strong>{resumo.comandas || 0}</strong></div>
          <div>Faturamento: <strong>R$ {(resumo.faturamento || 0).toFixed(2)}</strong></div>
        </div>

        {/* Listas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Serviços Realizados</h2>
            <ul className="bg-zinc-800 rounded p-4 space-y-2">
              {resumo.servicosRealizados
                ? Object.entries(resumo.servicosRealizados).map(([nome, dados]) => (
                  <li key={nome}>{nome}: {dados.quantidade}x - R$ {dados.total.toFixed(2)}</li>
                ))
                : <li>Nenhum serviço registrado.</li>}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Produtos Vendidos</h2>
            <ul className="bg-zinc-800 rounded p-4 space-y-2">
              {resumo.produtosVendidos
                ? Object.entries(resumo.produtosVendidos).map(([nome, dados]) => (
                  <li key={nome}>{nome}: {dados.quantidade}x - R$ {dados.total.toFixed(2)}</li>
                ))
                : <li>Nenhum produto vendido.</li>}
            </ul>
          </div>
        </div>

        {/* Tabela de comandas */}
        <h2 className="text-xl font-bold mt-6">Comandas Criadas</h2>
        <div className="overflow-auto">
          <table className="w-full table-auto text-sm text-left">
            <thead>
              <tr className="bg-zinc-700 text-white">
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Cliente</th>
                <th className="px-3 py-2">WhatsApp</th>
                <th className="px-3 py-2">Veículo</th>
                <th className="px-3 py-2">Funcionário</th>
                <th className="px-3 py-2">Desconto</th>
                <th className="px-3 py-2">Valor Final</th>
                <th className="px-3 py-2">Itens</th>
                <th className="px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {comandas.length === 0 && (
                <tr><td colSpan="9" className="text-center text-gray-400 py-4">Nenhuma comanda encontrada.</td></tr>
              )}
              {comandas.map((c) => (
                <>
                  <tr key={c._id} className="border-b border-zinc-700">
                    <td className="px-3 py-2">{new Date(c.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="px-3 py-2">{c.cliente}</td>
                    <td className="px-3 py-2">{c.whatzapp}</td>
                    <td className="px-3 py-2">{c.veiculo}</td>
                    <td className="px-3 py-2">{c.funcionarioId?.nome || "-"}</td>
                    <td className="px-3 py-2">R$ {c.desconto?.toFixed(2)}</td>
                    <td className="px-3 py-2">R$ {c.valorFinal.toFixed(2)}</td>
                    <td className="px-3 py-2">{c.itens.map(i => `${i.nome} (${i.quantidade}x)`).join(", ")}</td>
                    <td className="px-3 py-2 flex gap-2">
                      <button onClick={() => gerarPDFComanda(c._id)} className="bg-green-600 text-white px-2 py-1 rounded text-xs">PDF</button>
                      <button onClick={() => excluirComanda(c._id)} className="bg-red-600 text-white px-2 py-1 rounded text-xs">Excluir</button>
                    </td>
                  </tr>
                  {c.observacoes && (
                    <tr>
                      <td colSpan="9" className="px-3 pb-4 italic text-gray-400">Observações: {c.observacoes}</td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
