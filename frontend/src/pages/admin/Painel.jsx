import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarConteudos } from "../../api/client";
import glass from "../../styles/glass.module.css";
import styles from "./Painel.module.css";

const ATIVIDADE = [
  { quando: "HÁ 12 MIN", quem: "JÚLIA", texto: 'publicou "Réplicas e replicantes"' },
  { quando: "HÁ 1 H", quem: "EDITOR-CHEFE IA", texto: "fechou 38 edições do dia" },
  { quando: "HÁ 3 H", quem: "MARCO", texto: "recusou uma carta do assinante #0291" },
  { quando: "ONTEM 7H02", quem: "SISTEMA", texto: "falhou ao fechar a edição do #0388" },
  { quando: "ONTEM", quem: "NÁDIA", texto: 'criou o rascunho "O trabalho que virou fila"' },
];

export default function Painel() {
  const [conteudos, setConteudos] = useState([]);

  useEffect(() => {
    listarConteudos().then(setConteudos).catch(() => {});
  }, []);

  const rascunhos = conteudos.filter((c) => c.status === "rascunho");
  const publicados = conteudos.filter((c) => c.status === "publicado");
  const total = conteudos.length || 1;
  const fracaoPublicadas = publicados.length / total;
  const fracaoRascunho = rascunhos.length / total;

  return (
    <div className={styles.pagina}>
      <h1 className={styles.titulo}>O que precisa de você hoje</h1>
      <p className={styles.subtitulo}>
        Terça, 27 de agosto de 2047 · a edição #08 fecha em 4 dias
      </p>

      <div className={styles.alertas}>
        <CartaoAlerta
          numero={rascunhos.length}
          titulo="rascunhos aguardando publicação"
          descricao={
            rascunhos[0] ? `Mais recente: "${rascunhos[0].titulo}"` : "Nenhum rascunho pendente"
          }
          acao="VER CONTEÚDOS"
          destino="/admin/conteudos"
          destacado
        />
        <CartaoAlerta
          numero={3}
          titulo="cartas aguardando moderação"
          descricao="A mais antiga espera há 6 dias"
          acao="MODERAR"
          destino="/admin/cartas"
        />
        <CartaoAlerta
          numero={publicados.length}
          titulo="matérias publicadas no acervo"
          descricao={`${conteudos.length} conteúdo(s) no total`}
          acao="VER CONTEÚDOS"
          destino="/admin/conteudos"
        />
        <CartaoAlerta
          numero={1}
          titulo="falha no fechamento"
          descricao="Assinante #0388, ontem às 7h02"
          acao="INVESTIGAR"
          destino="/admin/assinantes"
          destacado
        />
      </div>

      <div className={styles.linhaInferior}>
        <div className={`${glass.vidro} ${styles.progresso}`}>
          <div className={glass.vidroConteudo}>
            <p className={`mono ${styles.rotulo}`}>EDIÇÃO #08 · FECHA EM 31/08 ÀS 7H</p>
            <div className={styles.barraProgresso}>
              <div className={styles.segmentoPublicado} style={{ flexGrow: fracaoPublicadas || 0.01 }} />
              <div className={styles.segmentoRascunho} style={{ flexGrow: fracaoRascunho || 0.01 }} />
              <div className={styles.segmentoFaltando} style={{ flexGrow: 1 - fracaoPublicadas - fracaoRascunho || 0.01 }} />
            </div>
            <div className={`mono ${styles.legenda}`}>
              <span>{publicados.length} PUBLICADAS</span>
              <span>{rascunhos.length} EM REVISÃO</span>
            </div>
            <p className={styles.nota}>
              Abaixo de 12 matérias publicadas, o editor-chefe não consegue montar edições distintas
              para todos os perfis.
            </p>
          </div>
        </div>

        <div className={`${glass.vidro} ${styles.atividade}`}>
          <div className={glass.vidroConteudo}>
            <p className={`mono ${styles.rotulo}`}>ATIVIDADE RECENTE</p>
            {ATIVIDADE.map((evento, i) => (
              <div key={i} className={styles.evento}>
                <p className={`mono ${styles.eventoQuando}`}>
                  {evento.quando} · {evento.quem}
                </p>
                <p className={styles.eventoTexto}>{evento.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CartaoAlerta({ numero, titulo, descricao, acao, destino, destacado }) {
  return (
    <div className={`${glass.vidro} ${styles.alerta} ${destacado ? styles.alertaDestacado : ""}`}>
      <div className={`${glass.vidroConteudo} ${styles.alertaConteudo}`}>
        <p className={styles.alertaNumero}>{numero}</p>
        <p className={styles.alertaTitulo}>{titulo}</p>
        <p className={styles.alertaDescricao}>{descricao}</p>
        <Link to={destino} className={`mono ${styles.alertaAcao}`}>
          {acao} →
        </Link>
      </div>
    </div>
  );
}
