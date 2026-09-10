import styles from "./NucleoAssistente.module.css";

/**
 * CP1 Motion — Opção 1: núcleo do assistente de IA em 3 estados.
 *
 * Princípios de UX Motion aplicados:
 *  - RITMO: cada estado tem uma cadência própria e reconhecível.
 *    idle = respiração lenta (~3.6s), processando = pulso curto e nervoso
 *    (~0.85s) + anel girando, respondendo = um único gesto de expansão que
 *    assenta. O usuário "sente" em que estado a IA está sem ler texto.
 *  - EASING: idle e respondendo usam ease-in-out / back-out (orgânico,
 *    tem peso). Só o anel de "processando" usa linear — rotação mecânica
 *    constante é a linguagem universal de "carregando / trabalhando".
 *  - CLAREZA DE FEEDBACK: o "respondendo" tem anticipation (contrai um
 *    tico antes de expandir) e um pulso que se propaga pra fora — leitura
 *    imediata de "terminei, aqui está".
 *
 * `estado`: "idle" | "processando" | "respondendo"
 */
export default function NucleoAssistente({ estado = "idle", tamanho = 120 }) {
  return (
    <div
      className={`${styles.nucleo} ${styles[estado] || styles.idle}`}
      style={{ width: tamanho, height: tamanho }}
      role="img"
      aria-label={`Assistente de IA: ${estado}`}
    >
      <span className={styles.halo} aria-hidden="true" />
      <span className={styles.pulso} aria-hidden="true" />
      <span className={styles.anel} aria-hidden="true" />
      <span className={styles.anelInterno} aria-hidden="true" />
      <span className={styles.miolo} aria-hidden="true" />
    </div>
  );
}
