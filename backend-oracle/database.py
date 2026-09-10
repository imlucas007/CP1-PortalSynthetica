"""
database.py
-----------
Este arquivo cuida de UMA responsabilidade: abrir a conexao com o Oracle.

"""

import os

import oracledb
from dotenv import load_dotenv

# Le o .env e joga as variaveis para dentro de os.environ.
load_dotenv()

# Faz o driver devolver CLOB ja como str (em vez de um objeto LOB que
# precisaria de .read()). A materia tem 'corpo' CLOB e a revista le esse
# texto direto — sem isso, cada leitura exigiria uma chamada extra ao banco.
oracledb.defaults.fetch_lobs = False

# Cada credencial vem de variavel de ambiente.
# NUNCA escreva usuario e senha direto no codigo.
ORACLE_USER = os.getenv("ORACLE_USER")
ORACLE_PASSWORD = os.getenv("ORACLE_PASSWORD")
ORACLE_HOST = os.getenv("ORACLE_HOST")
ORACLE_PORT = os.getenv("ORACLE_PORT", "1521")
ORACLE_SERVICE = os.getenv("ORACLE_SERVICE")


def get_connection():
    """
    Devolve uma conexao NOVA com o Oracle.

    Como usamos nas rotas:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT ...")
        ...
        cursor.close()
        conn.close()

    Biblioteca 'oracledb' em modo THIN (padrao) = Python puro, NAO precisa
    do Oracle Instant Client. So 'pip install oracledb' e pronto.
    """
    # host:porta/service_name -> formato que o Oracle entende.
    dsn = f"{ORACLE_HOST}:{ORACLE_PORT}/{ORACLE_SERVICE}"

    return oracledb.connect(
        user=ORACLE_USER,
        password=ORACLE_PASSWORD,
        dsn=dsn,
    )
