import csv
import io
import os
import re
import unicodedata
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

import pandas as pd
import pdfplumber
from django.db import transaction

from fornecedores.models import Fornecedor
from produtos.models import Categoria, Produto
from estoque.models import MovimentacaoEstoque


COLUNAS_ESPERADAS = {
    "nome": [
        "nome",
        "descricao",
        "descrição",
        "descricao_do_produto",
        "descrição_do_produto",
        "produto",
        "item",
        "material",
        "nome_do_produto",
    ],
    "codigo": [
        "codigo",
        "código",
        "cod",
        "referencia",
        "referência",
        "sku",
    ],
    "categoria": [
        "categoria",
        "grupo",
        "tipo",
        "familia",
        "família",
        "secao",
        "seção",
    ],
    "fornecedor": [
        "fornecedor",
        "marca",
        "fabricante",
    ],
    "unidade": [
        "unidade",
        "und",
        "medida",
        "un",
    ],
    "preco_custo": [
        "preco_custo",
        "preço_custo",
        "custo",
        "valor_custo",
        "preco_de_custo",
        "preço_de_custo",
    ],
    "preco_venda": [
        "preco_venda",
        "preço_venda",
        "preco",
        "preço",
        "valor_venda",
        "valor_de_venda",
    ],
    "estoque_atual": [
        "estoque",
        "quantidade",
        "qtd",
        "saldo",
        "estoque_atual",
        "quantidade_em_estoque",
    ],
    "estoque_minimo": [
        "estoque_minimo",
        "mínimo",
        "minimo",
        "estoque_mínimo",
        "qtd_minima",
        "qtd_mínima",
    ],
    "codigo_barras": [
        "codigo_barras",
        "código_barras",
        "ean",
        "barcode",
        "cod_barras",
    ],
    "marca": [
        "marca",
    ],
}


UNIDADES_VALIDAS = ["UN", "SC", "CX", "LT", "KG", "MT", "M2", "M3"]
DECIMAL_2 = Decimal("0.01")
DECIMAL_ZERO = Decimal("0.00")


def normalizar_coluna(nome):
    nome = str(nome).strip().lower()
    nome = unicodedata.normalize("NFKD", nome)
    nome = nome.encode("ASCII", "ignore").decode("ASCII")
    nome = nome.replace(" ", "_").replace("-", "_")
    nome = re.sub(r"__+", "_", nome)
    return nome


def normalizar_texto_codigo(texto):
    texto = str(texto).strip().upper()
    texto = unicodedata.normalize("NFKD", texto)
    texto = texto.encode("ASCII", "ignore").decode("ASCII")
    texto = re.sub(r"[^A-Z0-9]", "", texto)
    return texto


def valor_invalido_texto(valor):
    texto = str(valor).strip()
    return texto == "" or texto.lower() in ["none", "nan", "null", "-"]


def limpar_texto(valor, default=""):
    if valor is None:
        return default

    texto = str(valor).strip()

    if texto.lower() in ["none", "nan", "null", "-"]:
        return default

    return texto


def mapear_colunas(colunas):
    colunas_normalizadas = {normalizar_coluna(c): c for c in colunas}
    mapeamento = {}

    for campo, aliases in COLUNAS_ESPERADAS.items():
        for alias in aliases:
            alias_norm = normalizar_coluna(alias)
            if alias_norm in colunas_normalizadas:
                mapeamento[campo] = colunas_normalizadas[alias_norm]
                break

    return mapeamento


def linha_parece_cabecalho(valores):
    if not valores:
        return False

    valores_normalizados = [normalizar_coluna(v) for v in valores if str(v).strip()]
    if not valores_normalizados:
        return False

    total_matches = 0
    for aliases in COLUNAS_ESPERADAS.values():
        aliases_normalizados = [normalizar_coluna(a) for a in aliases]
        for valor in valores_normalizados:
            if valor in aliases_normalizados:
                total_matches += 1
                break

    return total_matches >= 2


def encontrar_cabecalho_e_dados(lista_de_linhas):
    for i, linha in enumerate(lista_de_linhas):
        linha_limpa = [str(c).strip() if c is not None else "" for c in linha]
        if linha_parece_cabecalho(linha_limpa):
            headers = linha_limpa
            dados = lista_de_linhas[i + 1 :]
            return headers, dados

    return None, None


def to_decimal(valor, default=DECIMAL_ZERO):
    if valor is None:
        return default

    texto = str(valor).strip()

    if texto == "" or texto.lower() == "nan":
        return default

    texto = texto.replace("R$", "").replace("r$", "").strip()

    if "," in texto and "." in texto:
        texto = texto.replace(".", "").replace(",", ".")
    else:
        texto = texto.replace(",", ".")

    texto = re.sub(r"[^0-9\.\-]", "", texto)

    if texto in {"", "-", ".", "-."}:
        return default

    try:
        return Decimal(texto).quantize(DECIMAL_2, rounding=ROUND_HALF_UP)
    except (InvalidOperation, ValueError):
        return default


def detectar_tipo_arquivo(nome_arquivo):
    ext = os.path.splitext(nome_arquivo)[1].lower()

    if ext == ".pdf":
        return "PDF"
    if ext == ".xlsx":
        return "XLSX"
    if ext == ".xls":
        return "XLS"
    if ext == ".csv":
        return "CSV"

    raise ValueError(
        "Formato de arquivo não suportado. Envie um arquivo .xlsx, .xls, .csv ou .pdf."
    )


def gerar_codigo_automatico(nome_produto):
    base = normalizar_texto_codigo(nome_produto)

    if not base:
        base = "PRODUTO"

    base = base[:20]

    codigo = base
    contador = 2

    while Produto.objects.filter(codigo=codigo).exists():
        sufixo = str(contador)
        codigo = f"{base[:20 - len(sufixo)]}{sufixo}"
        contador += 1

    return codigo


def ler_csv(file_obj):
    file_obj.seek(0)
    conteudo = file_obj.read().decode("utf-8", errors="ignore")
    leitor = csv.reader(io.StringIO(conteudo))
    linhas = list(leitor)

    headers, dados = encontrar_cabecalho_e_dados(linhas)
    if not headers:
        file_obj.seek(0)
        conteudo = file_obj.read().decode("utf-8", errors="ignore")
        leitor_dict = csv.DictReader(io.StringIO(conteudo))
        return list(leitor_dict)

    registros = []
    for linha in dados:
        if not any(str(c).strip() for c in linha):
            continue

        registro = {}
        for i, valor in enumerate(linha):
            chave = headers[i] if i < len(headers) else f"coluna_{i}"
            registro[chave] = valor
        registros.append(registro)

    return registros


def dataframe_para_registros_inteligente(df):
    df = df.fillna("")
    linhas = df.values.tolist()
    colunas_originais = [str(c) for c in df.columns.tolist()]

    if linha_parece_cabecalho(colunas_originais):
        return df.to_dict(orient="records")

    linhas_com_possivel_cabecalho = [colunas_originais] + linhas
    headers, dados = encontrar_cabecalho_e_dados(linhas_com_possivel_cabecalho)

    if not headers:
        return df.to_dict(orient="records")

    registros = []
    for linha in dados:
        if not any(str(c).strip() for c in linha):
            continue

        registro = {}
        for i, valor in enumerate(linha):
            chave = headers[i] if i < len(headers) else f"coluna_{i}"
            registro[chave] = valor
        registros.append(registro)

    return registros


def ler_excel_xlsx(file_obj):
    file_obj.seek(0)
    df = pd.read_excel(file_obj, engine="openpyxl", header=0)
    return dataframe_para_registros_inteligente(df)


def ler_excel_xls(file_obj):
    file_obj.seek(0)
    try:
        df = pd.read_excel(file_obj, engine="xlrd", header=0)
    except Exception as e:
        raise ValueError(
            "Não foi possível ler o arquivo .xls. Abra a planilha no Excel e salve como .xlsx antes de importar."
        ) from e

    return dataframe_para_registros_inteligente(df)


def ler_pdf(file_obj):
    file_obj.seek(0)
    registros = []

    with pdfplumber.open(file_obj) as pdf:
        for pagina in pdf.pages:
            tabelas = pagina.extract_tables()

            for tabela in tabelas:
                if not tabela or len(tabela) < 2:
                    continue

                headers, linhas = encontrar_cabecalho_e_dados(tabela)

                if not headers:
                    headers = [str(h).strip() if h else "" for h in tabela[0]]
                    linhas = tabela[1:]

                for linha in linhas:
                    if not linha or not any(str(c).strip() for c in linha):
                        continue

                    registro = {}
                    for i, valor in enumerate(linha):
                        chave = headers[i] if i < len(headers) else f"coluna_{i}"
                        registro[chave] = valor
                    registros.append(registro)

    return registros


def ler_arquivo(file_obj, tipo):
    if tipo == "CSV":
        return ler_csv(file_obj)
    if tipo == "XLSX":
        return ler_excel_xlsx(file_obj)
    if tipo == "XLS":
        return ler_excel_xls(file_obj)
    if tipo == "PDF":
        return ler_pdf(file_obj)

    raise ValueError("Tipo de arquivo inválido.")


@transaction.atomic
def importar_produtos(file_obj, tipo, usuario=None):
    registros = ler_arquivo(file_obj, tipo)

    if not registros:
        raise ValueError("Nenhum registro encontrado no arquivo.")

    primeira_linha = registros[0]
    colunas_encontradas = list(primeira_linha.keys())
    mapeamento = mapear_colunas(colunas_encontradas)

    print("\n" + "=" * 80)
    print("DEBUG IMPORTAÇÃO")
    print(f"TIPO DO ARQUIVO: {tipo}")
    print(f"TOTAL DE REGISTROS LIDOS: {len(registros)}")
    print("COLUNAS ENCONTRADAS:", colunas_encontradas)
    print("MAPEAMENTO IDENTIFICADO:", mapeamento)
    print("PRIMEIROS 5 REGISTROS:")
    for r in registros[:5]:
        print(r)
    print("=" * 80 + "\n")

    if "nome" not in mapeamento:
        raise ValueError(
            "Não foi possível identificar a coluna de nome do produto. "
            f"Colunas encontradas: {', '.join(map(str, colunas_encontradas))}"
        )

    total_importados = 0

    for linha in registros:
        nome_bruto = linha.get(mapeamento.get("nome", ""), "")
        nome = limpar_texto(nome_bruto)

        if valor_invalido_texto(nome):
            continue

        codigo_bruto = linha.get(mapeamento.get("codigo", ""), "")
        codigo = limpar_texto(codigo_bruto)
        codigo = normalizar_texto_codigo(codigo)

        if not codigo:
            codigo = gerar_codigo_automatico(nome)

        categoria_nome = limpar_texto(
            linha.get(mapeamento.get("categoria", ""), "Geral"),
            default="Geral"
        )
        if not categoria_nome:
            categoria_nome = "Geral"

        fornecedor_nome = limpar_texto(
            linha.get(mapeamento.get("fornecedor", ""), ""),
            default=""
        )

        unidade = limpar_texto(
            linha.get(mapeamento.get("unidade", ""), "UN"),
            default="UN"
        ).upper()

        if unidade not in UNIDADES_VALIDAS:
            unidade = "UN"

        preco_custo = to_decimal(linha.get(mapeamento.get("preco_custo", ""), DECIMAL_ZERO))
        preco_venda = to_decimal(linha.get(mapeamento.get("preco_venda", ""), DECIMAL_ZERO))
        estoque_atual = to_decimal(linha.get(mapeamento.get("estoque_atual", ""), DECIMAL_ZERO))
        estoque_minimo = to_decimal(linha.get(mapeamento.get("estoque_minimo", ""), DECIMAL_ZERO))

        codigo_barras = limpar_texto(
            linha.get(mapeamento.get("codigo_barras", ""), ""),
            default=""
        )

        marca = limpar_texto(
            linha.get(mapeamento.get("marca", ""), ""),
            default=""
        )

        categoria, _ = Categoria.objects.get_or_create(nome=categoria_nome)

        fornecedor = None
        if fornecedor_nome:
            fornecedor, _ = Fornecedor.objects.get_or_create(nome=fornecedor_nome)

        produto, criado = Produto.objects.get_or_create(
            codigo=codigo,
            defaults={
                "nome": nome,
                "codigo_barras": codigo_barras or None,
                "categoria": categoria,
                "fornecedor": fornecedor,
                "marca": marca or None,
                "unidade": unidade,
                "preco_custo": preco_custo,
                "preco_venda": preco_venda,
                "estoque_atual": DECIMAL_ZERO,
                "estoque_minimo": estoque_minimo,
                "descricao": "",
                "ativo": True,
                "importado": True,
                "origem_importacao": tipo,
            },
        )

        if not criado:
            produto.nome = nome
            produto.codigo_barras = codigo_barras or produto.codigo_barras
            produto.categoria = categoria
            produto.fornecedor = fornecedor
            produto.marca = marca or produto.marca
            produto.unidade = unidade
            produto.preco_custo = preco_custo
            produto.preco_venda = preco_venda
            produto.estoque_minimo = estoque_minimo
            produto.importado = True
            produto.origem_importacao = tipo
            produto.save()

        if estoque_atual > DECIMAL_ZERO:
            quantidade_mov = Decimal(str(estoque_atual)).quantize(
                DECIMAL_2,
                rounding=ROUND_HALF_UP
            )

            MovimentacaoEstoque.objects.create(
                produto=produto,
                tipo="ENTRADA",
                quantidade=quantidade_mov,
                motivo="Importação inicial",
                observacao="Entrada gerada automaticamente pela importação",
                usuario=usuario,
            )

        total_importados += 1

    return total_importados