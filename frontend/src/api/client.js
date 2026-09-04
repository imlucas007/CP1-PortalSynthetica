const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function requisicao(caminho, opcoes = {}) {
  const { token, ...resto } = opcoes;
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...resto,
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

export function listarCartas({ status, busca } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (busca) params.set("busca", busca);
  const query = params.toString();
  return requisicao(`/cartas${query ? `?${query}` : ""}`);
}

export function atualizarCarta(id, dados) {
  return requisicao(`/cartas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}

export function cadastrar({ email, senha, preferencias }) {
  return requisicao("/auth/cadastro", {
    method: "POST",
    body: JSON.stringify({ email, senha, preferencias }),
  });
}

export function entrar({ email, senha }) {
  return requisicao("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}

export function obterAssinanteAtual(token) {
  return requisicao("/auth/eu", { token });
}

export function atualizarPreferenciasAssinante(token, dados) {
  return requisicao("/auth/preferencias", {
    method: "PATCH",
    token,
    body: JSON.stringify(dados),
  });
}

export function apagarSinalAssinante(token, campo) {
  return requisicao(`/auth/preferencias/${campo}`, { method: "DELETE", token });
}
