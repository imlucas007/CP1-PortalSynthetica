import { useCallback, useRef, useState } from "react";
import styles from "./SliderProporcao.module.css";

export default function SliderProporcao({ valor, onChange }) {
  const trilhoRef = useRef(null);
  const [arrastando, setArrastando] = useState(false);

  const calcularValor = useCallback((clientX) => {
    const trilho = trilhoRef.current;
    if (!trilho) return null;
    const { left, width } = trilho.getBoundingClientRect();
    const fracao = (clientX - left) / width;
    return Math.min(96, Math.max(4, Math.round(fracao * 100)));
  }, []);

  function iniciarArraste(e) {
    setArrastando(true);
    mover(e);
  }

  function mover(e) {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const novoValor = calcularValor(clientX);
    if (novoValor !== null) onChange(novoValor);
  }

  function pararArraste() {
    setArrastando(false);
  }

  return (
    <div className={styles.controle}>
      <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 13 }}>
        <span>AVANÇOS TECNOLÓGICOS</span>
        <span>IA NA ARTE E CULTURA</span>
      </div>
      <div
        ref={trilhoRef}
        className={styles.trilho}
        onMouseDown={iniciarArraste}
        onMouseMove={(e) => arrastando && mover(e)}
        onMouseUp={pararArraste}
        onMouseLeave={pararArraste}
        onTouchStart={iniciarArraste}
        onTouchMove={mover}
        onTouchEnd={pararArraste}
      >
        <div className={styles.segmentoEsquerda} style={{ width: `${valor}%` }} />
        <div className={styles.segmentoDireita} style={{ width: `${100 - valor}%` }} />
        <div className={`mono ${styles.divisoria}`} style={{ left: `${valor}%` }}>
          ||
        </div>
      </div>
      <div className={styles.legenda}>
        <p className={styles.numeroAtivo}>{valor}%</p>
        <p className={styles.numeroInativo}>{100 - valor}%</p>
      </div>
      <p className={styles.nota}>
        Sua capa vai abrir na face {valor >= 50 ? "de avanços tecnológicos" : "institucional"}.
      </p>
    </div>
  );
}
