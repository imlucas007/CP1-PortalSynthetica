import styles from "./CardMateriaHover.module.css";

/**
 * CP1 Motion — Opção 3: card de matéria reagindo ao hover.
 *
 * Princípios de UX Motion aplicados:
 *  - EASING: a elevação do card usa cubic-bezier(0.34,1.56,0.64,1) — um
 *    leve overshoot ("back-out"), o card sobe e recua 1px, dando vida.
 *    O recolher usa ease-out puro (sem overshoot) pra não parecer nervoso.
 *  - RITMO: as coisas não acontecem juntas. 0ms o card sobe e o brilho
 *    acende; ~120ms depois a mídia dá um zoom sutil; ~180ms depois o trecho
 *    extra se revela; o badge expande junto com o trecho. É uma frase, não
 *    um susto.
 *  - CLAREZA DE FEEDBACK: sombra maior + borda mais viva = "isto é
 *    clicável"; o trecho revelado responde "tem mais aqui dentro"; o badge
 *    que cresce de "7 MIN" para "LEITURA · 7 MIN" nomeia o que era só um
 *    número. Tudo espelhado no :focus-visible (teclado ganha a mesma coisa).
 */
export default function CardMateriaHover({
  editoria = "IA NA ARTE E CULTURA",
  titulo = "Réplicas e replicantes",
  chamada = "Como o cinema imaginou a consciência artificial antes dos laboratórios.",
  trecho = "De Metropolis a Blade Runner, a ficção fixou imagens que a pesquisa levou décadas para alcançar — e algumas que ela nunca alcançou.",
  autor = "TOMÁS BELTRÃO",
  minutos = 12,
}) {
  return (
    <article className={styles.card} tabIndex={0}>
      <div className={styles.mediaArea}>
        <div className={styles.media} />
        <span className={`mono ${styles.badge}`}>
          <span className={styles.badgeRotulo}>LEITURA&nbsp;·&nbsp;</span>
          {minutos} MIN
        </span>
      </div>

      <div className={styles.corpo}>
        <p className={`mono ${styles.editoria}`}>{editoria}</p>
        <h3 className={styles.titulo}>{titulo}</h3>
        <p className={styles.chamada}>{chamada}</p>

        <div className={styles.trechoWrap}>
          <p className={styles.trecho}>{trecho}</p>
        </div>

        <p className={`mono ${styles.autor}`}>{autor}</p>
      </div>
    </article>
  );
}
