import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_BASE = API.replace(/\/api\/?$/, ""); // para abrir PDFs no window.open

export default function Comanda() {
  const { user, token } = useAuth();

  const [cliente, setCliente] = useState("");
  const [whatzapp, setWhatzapp] = useState("");
  const [veiculo, setVeiculo] = useState("");
  const [obs, setObs] = useState("");
  const [busca, setBusca] = useState("");
  const [estoque, setEstoque] = useState([]);
  const [itens, setItens] = useState([]);
  const [desconto, setDesconto] = useState(0);
  const [resumoComanda, setResumoComanda] = useState(null);

  useEffect(() => {
    if (!token || !["admin", "gerente", "recepcao", "funcionario"].includes(user?.tipo)) {
      window.location.href = "/";
    }
  }, [token, user]);

  useEffect(() => {
    const buscarItens = async () => {
      if (busca.trim().length === 0) {
        setEstoque([]);
        return;
      }
      try {
        const res = await axios.get(
          `${API}/itens/quantidade?nome=${encodeURIComponent(busca)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEstoque(res.data);
      } catch (err) {
        console.error("Erro ao buscar itens:", err);
      }
    };
    buscarItens();
  }, [busca, token]);

  const adicionarItem = (item) => {
    const existente = itens.find((i) => i._id === item._id);
    if (existente) return;
    setItens([...itens, { ...item, qtd: 1 }]);
    setBusca("");
  };

  const removerItem = (id) => {
    setItens(itens.filter((i) => i._id !== id));
  };

  const alterarQtd = (id, qtd) => {
    setItens(itens.map((i) => (i._id === id ? { ...i, qtd: qtd > 0 ? qtd : 1 } : i)));
  };

  const total = itens.reduce((acc, i) => acc + i.valor * i.qtd, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      cliente,
      whatzapp,
      veiculo,
      itens: itens.map((item) => ({
        itemId: item._id,
        nome: item.nome,
        tipo: item.tipo,
        quantidade: item.qtd,
        valorUnitario: item.valor,
      })),
      total,
      desconto,
      valorFinal: total - desconto,
      observacoes: obs,
    };

    try {
      const res = await axios.post(`${API}/comandas`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumoComanda(res.data.comanda);
      alert("Comanda salva com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar comanda:", err);
      const msg = err?.response?.data?.msg || "Erro ao salvar comanda.";
      alert(msg);
    }
  };

  const gerarPDF = () => {
    if (!resumoComanda?._id) return alert("Comanda ainda não disponível.");
    window.open(`${API_BASE}/api/comandas/${resumoComanda._id}/pdf`, "_blank");
  };

  const resultados = busca
    ? estoque.filter((item) => item.nome.toLowerCase().includes(busca.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-red-900 text-white px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Título */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-red-500">Nova</span> Comanda
          </h1>
          <span className="text-sm text-zinc-300">
            Funcionário: <strong>{user?.nome || "-"}</strong>
          </span>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente / WhatsApp */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4">
              <label className="block text-sm mb-2 text-zinc-300">Cliente</label>
              <input
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full rounded bg-zinc-900 border border-white/10 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>
            <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4">
              <label className="block text-sm mb-2 text-zinc-300">WhatsApp</label>
              <input
                type="text"
                value={whatzapp}
                onChange={(e) => setWhatzapp(e.target.value)}
                placeholder="(XX) XXXXX-XXXX"
                className="w-full rounded bg-zinc-900 border border-white/10 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>
          </div>

          {/* Veículo */}
          <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4">
            <label className="block text-sm mb-2 text-zinc-300">Veículo</label>
            <input
              type="text"
              value={veiculo}
              onChange={(e) => setVeiculo(e.target.value)}
              className="w-full rounded bg-zinc-900 border border-white/10 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>

          {/* Busca de item */}
          <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4">
            <label className="block text-sm mb-2 text-zinc-300">Buscar item</label>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded bg-zinc-900 border border-white/10 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Digite o nome do produto/serviço"
            />
            {resultados.length > 0 && (
              <ul className="bg-black/80 ring-1 ring-white/10 mt-2 rounded-lg divide-y divide-white/10 max-h-60 overflow-auto">
                {resultados.map((item) => (
                  <li
                    key={item._id}
                    className="p-2 hover:bg-zinc-800/80 cursor-pointer text-sm"
                    onClick={() => adicionarItem(item)}
                    title="Adicionar à comanda"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium text-zinc-100">
                        {item.nome}
                        <span className="ml-2 text-xs text-zinc-400">({item.tipo})</span>
                      </span>
                      <span className="text-zinc-200">R$ {item.valor}</span>
                    </div>
                    {item.tipo === "produto" && (
                      <span className="block text-xs text-zinc-400 mt-1">
                        Estoque: {item.quantidade ?? "-"}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Itens */}
          {itens.length > 0 && (
            <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-red-500 mb-3">Itens</h2>
              <ul className="space-y-2">
                {itens.map((item) => (
                  <li
                    key={item._id}
                    className="bg-zinc-900/60 ring-1 ring-white/10 p-3 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-zinc-100">{item.nome}</p>
                      <p className="text-xs text-zinc-400">
                        {item.tipo === "produto" ? `Estoque disponível: ${item.quantidade ?? "-"}` : "Serviço"}
                      </p>
                      <div className="text-sm text-zinc-300 mt-1 flex items-center">
                        <input
                          type="number"
                          min={1}
                          value={item.qtd}
                          onChange={(e) => alterarQtd(item._id, parseInt(e.target.value))}
                          className="w-20 rounded bg-zinc-900 border border-white/10 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-600 mr-2"
                        />
                        x R$ {item.valor}
                      </div>
                    </div>
                    <button
                      onClick={() => removerItem(item._id)}
                      className="text-sm text-red-400 hover:text-red-300 underline underline-offset-4 self-start sm:self-auto"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Observações */}
          <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4">
            <label className="block text-sm mb-2 text-zinc-300">Observações</label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              className="w-full rounded bg-zinc-900 border border-white/10 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              rows={3}
            />
          </div>

          {/* Funcionário / Desconto */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4">
              <label className="block text-sm mb-2 text-zinc-300">Funcionário</label>
              <input
                type="text"
                value={user?.nome || ""}
                disabled
                className="w-full rounded bg-zinc-800 text-zinc-400 px-3 py-3"
              />
            </div>
            <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 rounded-lg p-4">
              <label className="block text-sm mb-2 text-zinc-300">Desconto (R$)</label>
              <input
                type="number"
                value={desconto}
                onChange={(e) => setDesconto(Number(e.target.value))}
                min={0}
                className="w-full rounded bg-zinc-900 border border-white/10 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          {/* Total + botão */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xl font-bold">
              Total: <span className="text-red-500">R$ {(total - desconto).toFixed(2)}</span>
            </span>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded text-white font-semibold ring-1 ring-white/10"
            >
              Finalizar Comanda
            </button>
          </div>
        </form>

        {/* Resumo da comanda finalizada */}
        {resumoComanda && (
          <div className="bg-black/60 backdrop-blur-md ring-1 ring-white/10 p-4 rounded space-y-2">
            <h2 className="text-xl font-semibold text-red-500">Comanda Finalizada</h2>
            <p><strong>Cliente:</strong> {resumoComanda.cliente}</p>
            <p><strong>WhatsApp:</strong> {resumoComanda.whatzapp}</p>
            <p><strong>Total:</strong> R$ {resumoComanda.total}</p>
            <p><strong>Desconto:</strong> R$ {resumoComanda.desconto}</p>
            <p><strong>Valor Final:</strong> R$ {resumoComanda.valorFinal}</p>
            <button
              onClick={gerarPDF}
              className="mt-3 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold ring-1 ring-white/10"
            >
              Gerar PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
