import { useEffect, useRef, useState } from "react";

/**
 * Agenda ocorrências raras de glitch com timing orgânico: o intervalo entre
 * disparos é sorteado dentro de uma faixa a cada vez (nunca fixo, nunca em
 * loop previsível), então elementos diferentes nunca ficam sincronizados.
 *
 * Retorna `ativo` (true só durante a curta janela do efeito, ~300ms) e
 * `disparar()` para acionar manualmente — hover, entrada na viewport, etc.
 * Sempre desligado se o usuário pedir menos movimento no sistema.
 */
export function useGlitchGatilho({
  duracaoMs = 320,
  intervaloMinMs = 7000,
  intervaloMaxMs = 18000,
  automatico = true,
} = {}) {
  const [ativo, setAtivo] = useState(false);
  const reduzMovimentoRef = useRef(false);
  const timeoutAgendaRef = useRef(null);
  const timeoutFimRef = useRef(null);

  useEffect(() => {
    reduzMovimentoRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  function disparar() {
    if (reduzMovimentoRef.current) return;
    setAtivo(true);
    clearTimeout(timeoutFimRef.current);
    timeoutFimRef.current = setTimeout(() => setAtivo(false), duracaoMs);
  }

  useEffect(() => {
    if (!automatico) return undefined;

    function agendarProximo() {
      const espera = intervaloMinMs + Math.random() * (intervaloMaxMs - intervaloMinMs);
      timeoutAgendaRef.current = setTimeout(() => {
        disparar();
        agendarProximo();
      }, espera);
    }

    if (!reduzMovimentoRef.current) agendarProximo();

    return () => clearTimeout(timeoutAgendaRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automatico, intervaloMinMs, intervaloMaxMs, duracaoMs]);

  useEffect(() => () => clearTimeout(timeoutFimRef.current), []);

  return { ativo, disparar };
}
