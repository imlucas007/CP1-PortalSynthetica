import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  atualizarConteudo,
  criarConteudo,
  listarEditorias,
  obterConteudo,
} from "../../api/client";
import glass from "../../styles/glass.module.css";
import styles from "./FormularioConteudo.module.css";

const VAZIO = {
  titulo: "",
  chamada: "",
  corpo: "",
  editoria_id: "",
  pagina: "",
  tempo_leitura_min: 5,
  palavra_chave: "",
  status: "rascunho",
};

export default function FormularioConteudo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const ehEdicao = Boolean(id);
  const [editorias, setEditorias] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [meta, setMeta] = useState(null);
  const [carregando, setCarregando] = useState(ehEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    listarEditorias().then(setEditorias).catch((e) => setErro(e.message));
  }, []);

  useEffect(() => {
    if (!ehEdicao) return;
    obterConteudo(id)
      .then((c) => {
        setForm({
          titulo: c.titulo,
          chamada: c.chamada,
          corpo: c.corpo,
          editoria_id: c.editoria_id,
          pagina: c.pagina ?? "",
          tempo_leitura_min: c.tempo_leitura_min,
          palavra_chave: c.palavra_chave,
          status: c.status,
        });
        setMeta(c);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [id, ehEdicao]);

  function atualizarCampo(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar() {
    setSalvando(true);
    setErro(null);
    try {
      const payload = {
        ...form,
        editoria_id: Number(form.editoria_id),
        pagina: form.pagina === "" ? null : Number(form.pagina),
        tempo_leitura_min: Number(form.tempo_leitura_min),
      };
      if (ehEdicao) {
        await atualizarConteudo(id, payload);
      } else {
        await criarConteudo(payload);
      }
      navigate("/admin/conteudos");
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className={styles.pagina}>
        <p className={styles.mensagem}>Carregando…</p>
      </div>
    );
  }

  return (
    <div className={styles.pagina}>
      <button className={`mono ${styles.voltar}`} onClick={() => navigate("/admin/conteudos")}>
        ← CONTEÚDOS
      </button>

      <div className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>{ehEdicao ? "Editar conteúdo" : "Novo conteúdo"}</h1>
          {meta && (
            <p className={`mono ${styles.subtitulo}`}>
              ID #{String(meta.id).padStart(4, "0")} · criado em{" "}
              {new Date(meta.criado_em)
                .toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
                .toUpperCase()}{" "}
              por {meta.autor.nome}
            </p>
          )}
        </div>
        <div className={styles.acoesTopo}>
          <button className={`mono ${styles.cancelar}`} onClick={() => navigate("/admin/conteudos")}>
            CANCELAR
          </button>
          <button className={`mono ${styles.salvar}`} onClick={salvar} disabled={salvando}>
            {salvando ? "SALVANDO…" : ehEdicao ? "SALVAR ALTERAÇÕES" : "CRIAR CONTEÚDO"}
          </button>
        </div>
      </div>

      {erro && <p className={styles.mensagemErro}>{erro}</p>}

      <div className={styles.grade}>
        <div className={styles.colunaPrincipal}>
          <Campo label="TÍTULO">
            <input value={form.titulo} onChange={(e) => atualizarCampo("titulo", e.target.value)} />
          </Campo>
          <Campo label="CHAMADA">
            <input value={form.chamada} onChange={(e) => atualizarCampo("chamada", e.target.value)} />
          </Campo>
          <div>
            <p className={`mono ${styles.rotulo}`}>CORPO DA MATÉRIA</p>
            <div className={`${glass.vidro} ${styles.caixaVidro}`}>
              <div className={glass.vidroConteudo}>
                <textarea
                  rows={8}
                  value={form.corpo}
                  onChange={(e) => atualizarCampo("corpo", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.colunaLateral}>
          <Campo label="EDITORIA">
            <select
              value={form.editoria_id}
              onChange={(e) => atualizarCampo("editoria_id", e.target.value)}
            >
              <option value="" disabled>
                Selecione
              </option>
              {editorias.map((ed) => (
                <option key={ed.id} value={ed.id}>
                  {ed.nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="PÁGINA">
            <input
              type="number"
              min="1"
              value={form.pagina}
              onChange={(e) => atualizarCampo("pagina", e.target.value)}
            />
          </Campo>
          <Campo label="TEMPO DE LEITURA (MIN)">
            <input
              type="number"
              min="1"
              value={form.tempo_leitura_min}
              onChange={(e) => atualizarCampo("tempo_leitura_min", e.target.value)}
            />
          </Campo>
          <Campo label="PALAVRA-CHAVE (SEO)">
            <input
              value={form.palavra_chave}
              onChange={(e) => atualizarCampo("palavra_chave", e.target.value)}
            />
          </Campo>
          <div>
            <p className={`mono ${styles.rotulo}`}>STATUS</p>
            <div className={styles.statusOpcoes}>
              {["rascunho", "publicado"].map((opcao) => (
                <button
                  key={opcao}
                  className={`mono ${styles.statusBotao} ${
                    form.status === opcao ? styles.statusAtivo : ""
                  }`}
                  onClick={() => atualizarCampo("status", opcao)}
                  type="button"
                >
                  {opcao.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <div>
      <p className={`mono ${styles.rotulo}`}>{label}</p>
      <div className={styles.caixaCampo}>{children}</div>
    </div>
  );
}
