import { useState } from "react";

export default function ImagemMateria({ conteudo, className, fallback }) {
  const [falhou, setFalhou] = useState(null);
  const url = conteudo.imagem_url?.trim();
  const permitido = url && (/^https?:\/\//i.test(url) || /^\/(?!\/)/.test(url));
  if (!permitido || falhou === url) return fallback ?? null;
  return <img src={url} alt={`Ilustração da matéria: ${conteudo.titulo}`}
    className={className} loading="lazy" decoding="async"
    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    onError={() => setFalhou(url)} />;
}
