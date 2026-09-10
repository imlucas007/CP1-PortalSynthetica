import { useGlitchGatilho } from "./useGlitchGatilho";
import styles from "./GlitchWordmark.module.css";

/**
 * O wordmark gigante (SYNTHETICA) com sua aberração cromática permanente
 * (camadas magenta/ciano, sempre visíveis — é a identidade da marca) e,
 * raramente, uma falha curta de transmissão: uma linha atravessa as
 * letras, uma camada se desloca, uma interferência cromática aparece um
 * pouco mais forte, e tudo volta ao normal — sequência de ~320ms.
 */
export default function GlitchWordmark({ texto, className = "", intervaloMinMs = 10000, intervaloMaxMs = 24000 }) {
  const { ativo, disparar } = useGlitchGatilho({
    duracaoMs: 340,
    intervaloMinMs,
    intervaloMaxMs,
  });

  return (
    <div className={`${styles.raiz} ${className} ${ativo ? styles.ativo : ""}`} onMouseEnter={disparar} aria-hidden="true">
      <p className={`${styles.camada} ${styles.magenta}`}>{texto}</p>
      <p className={`${styles.camada} ${styles.ciano}`}>{texto}</p>
      <p className={`${styles.camada} ${styles.base}`} data-lens-scene>
        {texto}
      </p>
      <span className={styles.linha1} />
      <span className={styles.linha2} />
    </div>
  );
}
