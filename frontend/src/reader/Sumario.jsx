import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import glass from "../styles/glass.module.css";
import { obterAssinanteAtual } from "../api/client";
import { listarMaterias } from "../api/revista";
import { lerPreferencias } from "../onboarding/preferencias";
import { lerToken } from "../onboarding/sessao";
import styles from "./Sumario.module.css";

export default function Sumario() {
  const navigate = useNavigate();
  const [conteudos, setConteudos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [proporcao, setProporcao] = useState(lerPreferencias().proporcaoAvancos ?? 62);
  const [assinante, setAssinante] = useState(null);

  useEffect(() => {
    let ativo = true;
    listarMaterias()
      .then((itens) => {
        if (ativo) {
          setConteudos([...itens].sort((a, b) => (a.pagina ?? 999) - (b.pagina ?? 999)));
        }
      })
      .catch(() => ativo && setErro(true))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    const token = lerToken();
    if (!token) return;
    let ativo = true;
    obterAssinanteAtual(token)
      .then((a) => {
        if (!ativo) return;
        setAssinante(a);
        if (a.proporcao_avancos != null) setProporcao(a.proporcao_avancos);
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <div className={styles.pagina}>
      <div className={styles.topbar}>
        <button className={`mono ${styles.marca}`} onClick={() => navigate("/home")}>
          REVISTA SYNTHETICA
        </button>
        {assinante && (
          <p className={`mono ${styles.usuaria}`}>
            {assinante.nome.toUpperCase()} · ASSINANTE
          </p>
        )}
      </div>

      <div className={styles.cabecalho}>
        <div className={styles.selo}>
          <p className="mono">EDITOR-CHEFE IA</p>
        </div>
        <h1 className={styles.titulo}>Sumário da edição #07</h1>
        <p className={styles.descricao}>
          {conteudos.length} matéria(s), fechadas para você em 20 de agosto de 2047. Proporção de{" "}
          {proporcao}% avanços e {100 - proporcao}% cultura, definida na sua ficha.
        </p>
        <div className={styles.barraProporcao}>
          <div style={{ width: `${proporcao}%` }} />
          <div style={{ width: `${100 - proporcao}%` }} />
        </div>
      </div>

      <div className={styles.lista}>
        {carregando && <p className={styles.mensagem}>Carregando…</p>}
        {!carregando && erro && (
          <div className={styles.mensagem} role="alert">
            <p>Não foi possível carregar o sumário.</p>
            <button
              className={`mono ${styles.tentarNovamente}`}
              onClick={() => window.location.reload()}
            >
              TENTAR DE NOVO
            </button>
          </div>
        )}
        {!carregando && !erro &&
          conteudos.map((c) => (
            <button
              key={c.id}
              className={`${glass.vidro} ${styles.item}`}
              onClick={() => navigate(`/leitura/${c.id}`)}
            >
              <div className={glass.vidroConteudo}>
                <p className={`mono ${styles.itemPagina}`}>P. {String(c.pagina ?? "—").padStart(2, "0")}</p>
                <p className={`mono ${styles.editoria}`}>{c.editoria.nome.toUpperCase()}</p>
                <div className={styles.foto}>
                  <span className="mono">FOTO</span>
                </div>
                <div className={styles.textos}>
                  <p className={styles.itemTitulo}>{c.titulo}</p>
                  <p className={styles.itemChamada}>{c.chamada}</p>
                </div>
                <p className={`mono ${styles.tempo}`}>{c.tempo_leitura_min} MIN</p>
              </div>
            </button>
          ))}
        {!carregando && !erro && conteudos.length === 0 && (
          <p className={styles.mensagem}>Nenhuma matéria publicada ainda.</p>
        )}
      </div>

      <p className={styles.notaFinal}>
        Esta edição fecha aqui. A próxima é fechada na terça, às 7h.
      </p>
    </div>
  );
}
