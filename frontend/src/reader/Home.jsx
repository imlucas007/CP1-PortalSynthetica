import { useCallback, useRef, useState } from "react";
import glass from "../styles/glass.module.css";
import HomeConteudo from "./HomeConteudo";
import { lerPreferencias } from "../onboarding/preferencias";
import logo from "../assets/home/logo.svg";
import styles from "./Home.module.css";

const BARRAS = [6, 2, 4, 2, 8, 2, 2, 4, 6, 2, 4, 2, 2, 6, 2, 4, 2, 6, 2, 2, 4, 2, 6, 2, 2, 4, 6, 2, 2, 4, 2];

export default function Home() {
  const preferencias = lerPreferencias();
  const [divisoria, setDivisoria] = useState(preferencias.proporcaoAvancos ?? 62);
  const [arrastando, setArrastando] = useState(false);
  const cartaoRef = useRef(null);

  const calcularValor = useCallback((clientX) => {
    const cartao = cartaoRef.current;
    if (!cartao) return null;
    const { left, width } = cartao.getBoundingClientRect();
    const fracao = (clientX - left) / width;
    return Math.min(96, Math.max(4, Math.round(fracao * 100)));
  }, []);

  function mover(e) {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const novoValor = calcularValor(clientX);
    if (novoValor !== null) setDivisoria(novoValor);
  }

  function iniciarArraste(e) {
    setArrastando(true);
    mover(e);
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.topbar}>
        <div className={styles.marca}>
          <span className={styles.logoBadge}>
            <img src={logo} alt="" />
          </span>
          <div className="mono">
            <p>REVISTA</p>
            <p>SYNTHETICA</p>
          </div>
        </div>
        <nav className={styles.nav}>
          <span>PESQUISA</span>
          <span>REPORTAGENS</span>
          <span>ENSAIOS</span>
          <span>COLUNAS</span>
        </nav>
        <div className={styles.navDireita}>
          <span>SOBRE</span>
          <span>EDIÇÕES</span>
          <span>APOIE</span>
          <span className={styles.buscar}>BUSCAR</span>
        </div>
      </div>

      <div className={styles.corpo}>
        <aside className={`${glass.vidro} ${styles.sidebar}`}>
          <div className={glass.vidroConteudo}>
            <div className={styles.blocoSidebar}>
              <Campo rotulo="EDIÇÃO" valor="#07" />
              <Campo rotulo="ANO" valor="02" />
              <Campo rotulo="DATA" valor="AGO 2047" />
              <Campo rotulo="DISTRIBUIÇÃO" valor="PERSONALIZADA" />
              <Campo rotulo="PERIODICIDADE" valor="POR LEITOR" />
            </div>
            <div className={styles.barcode}>
              <div className={styles.barras}>
                {BARRAS.map((largura, i) => (
                  <span key={i} style={{ width: `${largura}px`, height: `${18 + (i % 3) * 6}px` }} />
                ))}
              </div>
              <p className="mono">7 899999 070200</p>
            </div>
          </div>
        </aside>

        <div
          ref={cartaoRef}
          className={`${glass.vidro} ${styles.cartaoPrincipal}`}
          onMouseMove={(e) => arrastando && mover(e)}
          onMouseUp={() => setArrastando(false)}
          onMouseLeave={() => setArrastando(false)}
          onTouchMove={mover}
          onTouchEnd={() => setArrastando(false)}
        >
          <div className={`${glass.vidroConteudo} ${styles.camadaConteudo}`}>
            <HomeConteudo faceB={false} />
          </div>
          <div
            className={styles.camadaFaceB}
            style={{ clipPath: `inset(0 0 0 ${divisoria}%)` }}
          >
            <HomeConteudo faceB />
          </div>

          <div
            className={styles.agulha}
            style={{ left: `${divisoria}%` }}
            onMouseDown={iniciarArraste}
            onTouchStart={iniciarArraste}
          >
            <div className={styles.linha} />
            <div className={`mono ${styles.pega}`}>||</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Campo({ rotulo, valor }) {
  return (
    <div className={styles.campo}>
      <div className={styles.campoLinha} />
      <p className={`mono ${styles.campoRotulo}`}>{rotulo}</p>
      <p className={`mono ${styles.campoValor}`}>{valor}</p>
    </div>
  );
}
