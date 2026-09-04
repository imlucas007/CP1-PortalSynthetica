import { useState } from "react";
import { useNavigate } from "react-router-dom";
import glass from "../styles/glass.module.css";
import luzHalo from "../assets/checkout/luz-halo.svg";
import gota1 from "../assets/checkout/gota-1.svg";
import styles from "./Checkout.module.css";

export default function Checkout() {
  const navigate = useNavigate();
  const [metodo, setMetodo] = useState("cartao");
  const [confirmando, setConfirmando] = useState(false);

  function confirmar(e) {
    e.preventDefault();
    // Protótipo acadêmico: nenhum dado de pagamento é enviado a lugar nenhum.
    // Isso só simula o passo seguinte do fluxo.
    setConfirmando(true);
    setTimeout(() => navigate("/assinatura-confirmada"), 500);
  }

  return (
    <div className={styles.pagina}>
      <img src={luzHalo} alt="" className={styles.halo} />
      <img src={gota1} alt="" className={styles.gota} />

      <div className={`${glass.vidro} ${styles.nav}`}>
        <div className={glass.vidroConteudo}>
          <button className={`mono ${styles.voltar}`} onClick={() => navigate("/")}>
            ← VOLTAR AOS PLANOS
          </button>
          <button className={`mono ${styles.marca}`} onClick={() => navigate("/")}>
            SYNTHETICA
          </button>
          <p className={`mono ${styles.passo}`}>PASSO 2 DE 3</p>
        </div>
      </div>

      <h1 className={styles.titulo}>Finalize sua assinatura</h1>
      <p className={styles.subtitulo}>
        Sete dias grátis. Você só é cobrado depois, e pode cancelar antes sem custo.
      </p>

      <form onSubmit={confirmar} className={styles.corpo}>
        <div className={styles.colunaEsquerda}>
          <div className={`${glass.vidro} ${styles.painel}`}>
            <div className={glass.vidroConteudo}>
              <p className={`mono ${styles.painelTitulo}`}>SEUS DADOS</p>
              <Campo rotulo="NOME COMPLETO" placeholder="Isabella Tragante" />
              <Campo rotulo="E-MAIL" placeholder="seu@e-mail.com" type="email" />
            </div>
          </div>

          <div className={`${glass.vidro} ${styles.painel}`}>
            <div className={glass.vidroConteudo}>
              <p className={`mono ${styles.painelTitulo}`}>PAGAMENTO</p>
              <div className={styles.metodo}>
                <button
                  type="button"
                  className={`mono ${styles.metodoBotao} ${metodo === "cartao" ? styles.metodoAtivo : ""}`}
                  onClick={() => setMetodo("cartao")}
                >
                  CARTÃO
                </button>
                <button
                  type="button"
                  className={`mono ${styles.metodoBotao} ${metodo === "pix" ? styles.metodoAtivo : ""}`}
                  onClick={() => setMetodo("pix")}
                >
                  PIX
                </button>
              </div>
              {metodo === "cartao" ? (
                <>
                  <Campo rotulo="NÚMERO DO CARTÃO" placeholder="0000 0000 0000 0000" />
                  <div className={styles.linha3}>
                    <Campo rotulo="VALIDADE" placeholder="MM / AA" />
                    <Campo rotulo="CVV" placeholder="000" />
                    <Campo rotulo="CPF" placeholder="000.000.000-00" />
                  </div>
                </>
              ) : (
                <p className={styles.pixInfo}>
                  A chave Pix é gerada na confirmação (protótipo — não gera cobrança real).
                </p>
              )}
            </div>
          </div>

          <p className={styles.termos}>
            Ao confirmar, você concorda com os termos de uso e a política de privacidade.
          </p>
        </div>

        <div className={`${glass.vidro} ${styles.resumo}`}>
          <div className={glass.vidroConteudo}>
            <p className={`mono ${styles.resumoTitulo}`}>RESUMO DO PEDIDO</p>
            <div className={styles.planoEscolhido}>
              <p className="mono">PLANO ANUAL · ECONOMIZE 21%</p>
              <div className={styles.preco}>
                <span>R$ 179</span>
                <span>/ano</span>
              </div>
              <button type="button" className={styles.trocarPlano}>
                Trocar plano
              </button>
            </div>
            <div className={styles.linhaResumo}>
              <span>Plano anual</span>
              <span>R$ 179,00</span>
            </div>
            <div className={styles.linhaResumo}>
              <span>Teste de 7 dias</span>
              <span>− R$ 179,00</span>
            </div>
            <div className={styles.divisor} />
            <div className={styles.linhaTotal}>
              <span>Total hoje</span>
              <span>R$ 0,00</span>
            </div>
            <p className={styles.notaResumo}>
              Depois, R$ 179,00 por ano. Renovação automática, cancelável a qualquer momento.
            </p>
            <button className={`mono ${styles.botaoConfirmar}`} disabled={confirmando}>
              {confirmando ? "CONFIRMANDO…" : "CONFIRMAR ASSINATURA"}
            </button>
            <p className={`mono ${styles.seloSeguranca}`}>
              PAGAMENTO CRIPTOGRAFADO · SEM FIDELIDADE
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

function Campo({ rotulo, placeholder, type = "text" }) {
  return (
    <label className={styles.campo}>
      <span className="mono">{rotulo}</span>
      <input type={type} placeholder={placeholder} />
    </label>
  );
}
