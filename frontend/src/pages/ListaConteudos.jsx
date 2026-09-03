import { useEffect, useMemo, useState } from "react";
import { excluirConteudo, listarConteudos } from "../api/client";
import ConfirmarExclusaoModal from "../components/ConfirmarExclusaoModal";
import styles from "./ListaConteudos.module.css";

const EDITORIAS_FILTRO = ["TODAS", "AVANÇOS", "CULTURA", "ÉTICA", "MEMÓRIA"];

function formatarData(iso) {
  const data = new Date(iso);
  return data
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    .replace(".", "")
    .toUpperCase();
}

export default function ListaConteudos({ onNovo, onEditar }) {
  const [conteudos, setConteudos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState("");
  const [editoriaAtiva, setEditoriaAtiva] = useState("TODAS");
  const [paraExcluir, setParaExcluir] = useState(null);

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const filtroEditoria = editoriaAtiva === "TODAS" ? undefined : editoriaAtiva;
      const dados = await listarConteudos({ busca: busca || undefined, editoria: filtroEditoria });
      setConteudos(dados);
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

  const totalRascunhos = useMemo(
    () => conteudos.filter((c) => c.status === "rascunho").length,
    [conteudos]
  );

  async function confirmarExclusao(id) {
    try {
      await excluirConteudo(id);
      setParaExcluir(null);
      carregar();
    } catch (e) {
      setErro(e.message);
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
        <button className={`mono ${styles.botaoNovo}`} onClick={onNovo}>
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

      {erro && <p className={styles.mensagemErro}>{erro}</p>}

      <div className={styles.tabela}>
        <div className={`mono ${styles.linhaCabecalho}`}>
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

        {conteudos.map((c) => (
          <div key={c.id} className={styles.linha}>
            <span className={`mono ${styles.colId} ${styles.textoApoio}`}>
              #{String(c.id).padStart(4, "0")}
            </span>
            <button className={styles.colTitulo + " " + styles.linkTitulo} onClick={() => onEditar(c.id)}>
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
              <button className={`mono ${styles.acaoEditar}`} onClick={() => onEditar(c.id)}>
                EDITAR
              </button>
              <button className={`mono ${styles.acaoExcluir}`} onClick={() => setParaExcluir(c)}>
                EXCLUIR
              </button>
            </span>
          </div>
        ))}
      </div>

      <ConfirmarExclusaoModal
        conteudo={paraExcluir}
        onCancelar={() => setParaExcluir(null)}
        onConfirmar={confirmarExclusao}
      />
    </div>
  );
}
