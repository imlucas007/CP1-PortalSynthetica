import json
import unittest
from unittest.mock import patch
from fastapi import HTTPException
from curadoria import PreferenciasCuradoria, selecionar_materias

CATALOGO = [{"id_materia": i, "titulo": f"Artigo {i}", "categoria": "Cultura", "resumo": "Texto"} for i in [1, 2]]


class CuradoriaTests(unittest.TestCase):
    @patch("curadoria.gerar_texto")
    def test_rejeita_ids_inventados_duplicados_e_quantidade_errada(self, gerar):
        for ids in [[1, 99], [1, 1], [1]]:
            gerar.return_value = json.dumps({"escolhas": [{"id_materia": i, "motivo": "Motivo válido para teste"} for i in ids]})
            with self.assertRaises(HTTPException) as erro:
                selecionar_materias(PreferenciasCuradoria(quantidade=2), CATALOGO)
            self.assertEqual(erro.exception.status_code, 502)

    @patch("curadoria.gerar_texto")
    def test_preserva_ordem_e_dados_do_oracle(self, gerar):
        gerar.return_value = json.dumps({"escolhas": [{"id_materia": i, "motivo": "Motivo válido para teste"} for i in [2, 1]]})
        resultado = selecionar_materias(PreferenciasCuradoria(quantidade=5), CATALOGO)
        self.assertEqual([r["materia"]["titulo"] for r in resultado], ["Artigo 2", "Artigo 1"])

    @patch("curadoria.gerar_texto")
    def test_catalogo_vazio_nao_chama_ia(self, gerar):
        self.assertEqual(selecionar_materias(PreferenciasCuradoria(), []), [])
        gerar.assert_not_called()


if __name__ == "__main__":
    unittest.main()
