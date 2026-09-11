import os
import unittest
from unittest.mock import patch

import httpx
from fastapi import HTTPException
from ia import gerar_resumo


class ResumoTests(unittest.TestCase):
    def setUp(self):
        gerar_resumo.cache_clear()
        self.env = patch.dict(os.environ, {"GEMINI_API_KEY": "chave-de-teste"})
        self.env.start()
        self.addCleanup(self.env.stop)
        self.addCleanup(gerar_resumo.cache_clear)

    @patch("ia.httpx.post")
    def test_cache_invalida_quando_artigo_muda(self, post):
        post.return_value = httpx.Response(200, json={"candidates": [{
            "finishReason": "STOP", "content": {"parts": [{"text": "Resumo de teste."}]}
        }]})
        for corpo in ["Texto original", "Texto original", "Texto alterado"]:
            self.assertEqual(gerar_resumo("Título", corpo, "modelo"), "Resumo de teste.")
        self.assertEqual(post.call_count, 2)

    @patch("ia.httpx.post")
    def test_falhas_nao_vazam_resposta_do_provedor(self, post):
        for status, esperado in [(429, 429), (403, 502), (500, 502)]:
            post.return_value = httpx.Response(status, text="informação interna")
            with self.assertRaises(HTTPException) as erro:
                gerar_resumo("Título", "Corpo", "modelo")
            self.assertEqual(erro.exception.status_code, esperado)
            self.assertNotIn("informação interna", erro.exception.detail)

    @patch("ia.httpx.post")
    def test_rejeita_resumo_truncado(self, post):
        post.return_value = httpx.Response(200, json={"candidates": [{
            "finishReason": "MAX_TOKENS", "content": {"parts": [{"text": "Incompleto"}]}
        }]})
        with self.assertRaises(HTTPException):
            gerar_resumo("Título", "Corpo", "modelo")

    @patch("ia.httpx.post")
    def test_sem_chave_nao_chama_google(self, post):
        with patch.dict(os.environ, {"GEMINI_API_KEY": ""}):
            with self.assertRaises(HTTPException) as erro:
                gerar_resumo("Título", "Corpo", "modelo")
        self.assertEqual(erro.exception.status_code, 503)
        post.assert_not_called()


if __name__ == "__main__":
    unittest.main()
