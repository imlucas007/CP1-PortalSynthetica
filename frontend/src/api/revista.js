// Cliente da API Oracle (backend-oracle, porta 8010) — é ela que serve o
// CONTEÚDO da revista (matérias) para as telas do leitor: Home, Sumário e
// Leitura.
//
// O outro cliente (./client.js, porta 8000) continua cuidando de auth,
// assinante, ficha e de todo o painel da redação (/admin), que gravam no
// SQLite. São dois bancos: o leitor lê do Oracle, o admin escreve no SQLite.
//
// Aqui a resposta do Oracle é traduzida para o MESMO formato que os
// componentes do leitor já esperavam (`editoria.nome`, `autor.nome`,
// `tempo_leitura_min`…), então nenhum componente precisou mudar.

const BASE_ORACLE = import.meta.env.VITE_ORACLE_API_URL || "http://127.0.0.1:8010";

async function buscar(caminho, opcoes) {
  const resposta = await fetch(`${BASE_ORACLE}${caminho}`, opcoes);
  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}));
    const erro = new Error(corpo.detail || `Erro ${resposta.status} em ${caminho}`);
    erro.status = resposta.status;
    throw erro;
  }
  return resposta.json();
}

// MATERIA (Oracle) -> Conteudo (formato que o leitor consome)
function paraConteudo(m) {
  return {
    id: m.id_materia,
    titulo: m.titulo,
    chamada: m.resumo ?? "",
    corpo: m.corpo ?? "",
    imagem_url: m.imagem_url || ([1, 2, 3, 4, 5].includes(m.id_materia) ? `/images/materias/${m.id_materia}.jpg` : ""),
    editoria: { nome: m.categoria ?? "" },
    autor: { nome: m.autor ?? "" },
    pagina: m.pagina ?? null,
    tempo_leitura_min: m.tempo_leitura ?? null,
    palavra_chave: m.palavras_chave ?? "",
    // No Oracle toda matéria carregada já está publicada — não há rascunho.
    status: "publicado",
  };
}

export function listarMaterias() {
  return buscar("/materias").then((lista) => lista.map(paraConteudo));
}

export function obterMateria(id) {
  return buscar(`/materias/${id}`).then(paraConteudo);
}

export function resumirMateria(id, signal) {
  return buscar(`/materias/${id}/resumo-ia`, { method: "POST", signal });
}

export async function gerarCuradoria(preferencias, signal) {
  const resultado = await buscar("/curadoria", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preferencias), signal,
  });
  return resultado.recomendacoes.map((r) => ({ ...paraConteudo(r.materia), motivo: r.motivo }));
}
