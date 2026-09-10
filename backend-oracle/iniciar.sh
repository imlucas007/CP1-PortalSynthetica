#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo
echo "=========================================="
echo "  Portal Synthetica - API FastAPI + Oracle"
echo "=========================================="
echo

# 1) Descobre qual comando python usar (3.10 ate 3.14, preferindo o 3.14)
PY=""
for cand in python3.14 python3.13 python3.12 python3.11 python3.10 python3 python; do
    if command -v "$cand" >/dev/null 2>&1; then
        ver=$("$cand" -c 'import sys; print((3,10) <= sys.version_info < (3,15))' 2>/dev/null || echo False)
        if [ "$ver" = "True" ]; then
            PY="$cand"
            break
        fi
    fi
done

if [ -z "$PY" ]; then
    echo "[ERRO] Nenhum Python entre 3.10 e 3.14 encontrado."
    exit 1
fi
echo "Usando: $($PY --version) ($PY)"

# 2) Cria o venv se nao existir
if [ ! -x ".venv/bin/python" ]; then
    echo "[1/4] Criando ambiente virtual .venv ..."
    "$PY" -m venv .venv
else
    echo "[1/4] Ambiente virtual .venv ja existe."
fi

# 3) Instala/atualiza dependencias
echo "[2/4] Instalando dependencias ..."
.venv/bin/python -m pip install --upgrade pip --quiet
.venv/bin/pip install -r requirements.txt --quiet

# 4) Garante que o .env exista
if [ ! -f ".env" ]; then
    echo "[3/4] .env nao encontrado - copiando de .env.exemplo ..."
    cp .env.exemplo .env
    echo
    echo "=========================================="
    echo "  ATENCAO: preencha o .env com as"
    echo "  credenciais do Oracle antes de rodar."
    echo "=========================================="
    ${EDITOR:-nano} .env
    echo "Depois de salvar, rode este script de novo."
    exit 0
else
    echo "[3/4] Arquivo .env encontrado."
fi

# 5) Sobe a API
echo "[4/4] Subindo API em http://127.0.0.1:8010"
echo "      Documentacao Swagger: http://127.0.0.1:8010/docs"
echo "      Pressione CTRL+C para parar."
echo

exec .venv/bin/uvicorn main:app --reload --port 8010
