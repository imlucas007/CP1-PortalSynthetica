import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { atualizarConteudo, excluirConteudo, listarConteudos } from "../../api/client";
import ConfirmarExclusaoModal from "../../components/ConfirmarExclusaoModal";
import glass from "../../styles/glass.module.css";
import styles from "./ListaConteudos.module.css";

const EDITORIAS_FILTRO = ["TODAS", "AVANÇOS", "CULTURA", "ÉTICA", "MEMÓRIA"];
const POR_PAGINA = 25;

function formatarData(iso) {
  return new Date(iso)
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    .replace(".", "")
    .toUpperCase();
}

export default function ListaConteudos() {
  const navigate = useNavigate();
  const [conteudos, setConteudos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState("");
  const [editoriaAtiva, setEditoriaAtiva] = useState("TODAS");
  const [pagina, setPagina] = useState(1);
  const [selecionados, setSelecionados] = useState(new Set());
  const [paraExcluir, setParaExcluir] = useState(null);
  const [processandoAcaoEmMassa, setProcessandoAcaoEmMassa] = useState(false);

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const filtroEditoria = editoriaAtiva === "TODAS" ? undefined : editoriaAtiva;
      const dados = await listarConteudos({ busca: busca || undefined, editoria: filtroEditoria });
      setConteudos(dados);
      setSelecionados(new Set());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const debounce = setTimeout(carregar, 250);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, editoriaAtiva]);

  useEffect(() => {
    setPagina(1);
  }, [busca, editoriaAtiva]);

  const totalRascunhos = useMemo(
    () => conteudos.filter((c) => c.status === "rascunho").length,
    [conteudos]
  );

  const totalPaginas = Math.max(1, Math.ceil(conteudos.length / POR_PAGINA));
  const pagosVisiveis = conteudos.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  function alternarSelecao(id) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  async function confirmarExclusao(id) {
    try {
      await excluirConteudo(id);
      setParaExcluir(null);
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function executarAcaoEmMassa(acao) {
    const ids = [...selecionados];
    if (ids.length === 0) return;
    setProcessandoAcaoEmMassa(true);
    setErro(null);
    try {
      if (acao === "publicar") {
        await Promise.all(ids.map((id) => atualizarConteudo(id, { status: "publicado" })));
      } else if (acao === "rascunho") {
        await Promise.all(ids.map((id) => atualizarConteudo(id, { status: "rascunho" })));
      } else if (acao === "atribuir_autor") {
        // MVP: único autor cadastrado hoje é a conta "Redação" (id 1).
        await Promise.all(ids.map((id) => atualizarConteudo(id, { autor_id: 1 })));
      } else if (acao === "excluir") {
        await Promise.all(ids.map((id) => excluirConteudo(id)));
      }
      carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setProcessandoAcaoEmMassa(false);
    }
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Conteúdos</h1>
          <p className={`mono ${styles.subtitulo}`}>
            {conteudos.length} matéria(s) no acervo · {totalRascunhos} rascunho(s)
          </p>
        </div>
        <button className={`mono ${styles.botaoNovo}`} onClick={() => navigate("novo")}>
          + NOVO CONTEÚDO
        </button>
      </div>

      <div className={styles.filtros}>
        <div className={styles.busca}>
          <input
            placeholder="Buscar por título"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        {EDITORIAS_FILTRO.map((editoria) => (
          <button
            key={editoria}
            className={`mono ${styles.chip} ${editoriaAtiva === editoria ? styles.chipAtivo : ""}`}
            onClick={() => setEditoriaAtiva(editoria)}
          >
            {editoria}
          </button>
        ))}
      </div>

      <div className={`mono ${styles.linhaResultado}`}>
        <p>
          {conteudos.length} CONTEÚDOS · MOSTRANDO{" "}
          {conteudos.length === 0 ? 0 : (pagina - 1) * POR_PAGINA + 1}–
          {Math.min(pagina * POR_PAGINA, conteudos.length)} · FILTRO: {editoriaAtiva}
        </p>
        <p className={styles.ordenar}>ORDENAR: MAIS RECENTES ▾</p>
      </div>

      {erro && <p className={styles.mensagemErro}>{erro}</p>}

      {selecionados.size > 0 && (
        <div className={`mono ${styles.barraSelecao}`}>
          <p>{selecionados.size} SELECIONADO(S)</p>
          <div className={styles.acoesEmMassa}>
            <button disabled={processandoAcaoEmMassa} onClick={() => executarAcaoEmMassa("publicar")}>
              PUBLICAR
            </button>
            <button disabled={processandoAcaoEmMassa} onClick={() => executarAcaoEmMassa("rascunho")}>
              MUDAR PARA RASCUNHO
            </button>
            <button disabled={processandoAcaoEmMassa} onClick={() => executarAcaoEmMassa("atribuir_autor")}>
              ATRIBUIR AUTOR
            </button>
            <button
              className={styles.acaoExcluirMassa}
              disabled={processandoAcaoEmMassa}
              onClick={() => executarAcaoEmMassa("excluir")}
            >
              EXCLUIR
            </button>
            <button onClick={() => setSelecionados(new Set())}>LIMPAR</button>
          </div>
        </div>
      )}

      <div className={`${glass.vidro} ${styles.tabela}`}>
        <div className={glass.vidroConteudo}>
          <div className={`mono ${styles.linhaCabecalho}`}>
            <span className={styles.colCheckbox} />
            <span className={styles.colId}>ID</span>
            <span className={styles.colTitulo}>TÍTULO</span>
            <span className={styles.colEditoria}>EDITORIA</span>
            <span className={styles.colStatus}>STATUS</span>
            <span className={styles.colAtualizado}>ATUALIZADO</span>
            <span className={styles.colAcoes}>AÇÕES</span>
          </div>

          {carregando && <p className={styles.mensagem}>Carregando…</p>}
          {!carregando && conteudos.length === 0 && (
            <p className={styles.mensagem}>Nenhum conteúdo encontrado.</p>
          )}

          {pagosVisiveis.map((c) => (
            <div key={c.id} className={styles.linha}>
              <span className={styles.colCheckbox}>
                <input
                  type="checkbox"
                  checked={selecionados.has(c.id)}
                  onChange={() => alternarSelecao(c.id)}
                />
              </span>
              <span className={`mono ${styles.colId} ${styles.textoApoio}`}>
                #{String(c.id).padStart(4, "0")}
              </span>
              <button
                className={styles.colTitulo + " " + styles.linkTitulo}
                onClick={() => navigate(`${c.id}/editar`)}
              >
                {c.titulo}
              </button>
              <span className={`mono ${styles.colEditoria} ${styles.textoApoio}`}>
                {c.editoria.nome.toUpperCase()}
              </span>
              <span className={styles.colStatus}>
                <span
                  className={`mono ${styles.selo} ${
                    c.status === "publicado" ? styles.seloPublicado : styles.seloRascunho
                  }`}
                >
                  {c.status === "publicado" ? "PUBLICADO" : "RASCUNHO"}
                </span>
              </span>
              <span className={`mono ${styles.colAtualizado} ${styles.textoApoio}`}>
                {formatarData(c.atualizado_em)}
              </span>
              <span className={styles.colAcoes}>
                <button className={`mono ${styles.acaoEditar}`} onClick={() => navigate(`${c.id}/editar`)}>
                  EDITAR
                </button>
                <button className={`mono ${styles.acaoExcluir}`} onClick={() => setParaExcluir(c)}>
                  EXCLUIR
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>

      {totalPaginas > 1 && (
        <div className={`mono ${styles.paginacao}`}>
          <p>{POR_PAGINA} POR PÁGINA ▾</p>
          <div className={styles.paginas}>
            <button disabled={pagina === 1} onClick={() => setPagina((p) => Math.max(1, p - 1))}>
              ←
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={n === pagina ? styles.paginaAtiva : ""}
                onClick={() => setPagina(n)}
              >
                {n}
              </button>
            ))}
            <button
              disabled={pagina === totalPaginas}
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            >
              →
            </button>
          </div>
        </div>
      )}

      <ConfirmarExclusaoModal
        conteudo={paraExcluir}
        onCancelar={() => setParaExcluir(null)}
        onConfirmar={confirmarExclusao}
      />
    </div>
  );
}
