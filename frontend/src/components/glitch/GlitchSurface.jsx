import { useGlitchGatilho } from "./useGlitchGatilho";
import styles from "./GlitchSurface.module.css";

/**
 * Envolve uma superfície visual (imagem, vidro, objeto 3D) com uma falha
 * rara: uma linha de varredura atravessa de cima a baixo e o conteúdo sofre
 * um pequeno corte/deslocamento no meio do percurso — como se a interface
 * estivesse sendo processada por um instante, não "quebrando".
 */
export default function GlitchSurface({ children, className = "", intervaloMinMs = 9000, intervaloMaxMs = 21000 }) {
  const { ativo } = useGlitchGatilho({ duracaoMs: 260, intervaloMinMs, intervaloMaxMs });

  return (
    <div className={`${styles.raiz} ${className} ${ativo ? styles.ativo : ""}`}>
      <div className={styles.conteudo}>{children}</div>
      <span aria-hidden="true" className={styles.varredura} />
    </div>
  );
}
