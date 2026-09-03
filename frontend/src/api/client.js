const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function requisicao(caminho, opcoes = {}) {
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    headers: { "Content-Type": "application/json" },
    ...opcoes,
  });

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}));
    throw new Error(corpo.detail || `Erro ${resposta.status} em ${caminho}`);
  }

  if (resposta.status === 204) return null;
  return resposta.json();
}

export function listarConteudos({ busca, editoria, status } = {}) {
  const params = new URLSearchParams();
  if (busca) params.set("busca", busca);
  if (editoria) params.set("editoria", editoria);
  if (status) params.set("status", status);
  const query = params.toString();
  return requisicao(`/conteudos${query ? `?${query}` : ""}`);
}

export function obterConteudo(id) {
  return requisicao(`/conteudos/${id}`);
}

export function criarConteudo(dados) {
  return requisicao("/conteudos", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function atualizarConteudo(id, dados) {
  return requisicao(`/conteudos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}

export function excluirConteudo(id) {
  return requisicao(`/conteudos/${id}`, { method: "DELETE" });
}

export function listarEditorias() {
  return requisicao("/editorias");
}
