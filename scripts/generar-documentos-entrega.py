"""Genera los PDF y el ZIP de entrega desde docs/entrega (requiere reportlab).

Uso opcional: python3 scripts/generar-documentos-entrega.py
No se ejecuta durante la instalación o el arranque de la aplicación.
"""
from pathlib import Path
from xml.sax.saxutils import escape
from zipfile import ZipFile, ZIP_DEFLATED
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph

ROOT = Path(__file__).resolve().parent.parent
DESTINO = ROOT / 'docs/entrega/pdf'
DESTINO.mkdir(parents=True, exist_ok=True)
# Fuente Unicode opcional. Helvetica mantiene el generador utilizable en otros equipos.
FUENTE, NEGRITA = 'Helvetica', 'Helvetica-Bold'
carpeta = Path('/usr/share/fonts/truetype/dejavu')
if (carpeta / 'DejaVuSans.ttf').exists():
    pdfmetrics.registerFont(TTFont('Entrega', str(carpeta / 'DejaVuSans.ttf')))
    pdfmetrics.registerFont(TTFont('EntregaBold', str(carpeta / 'DejaVuSans-Bold.ttf')))
    FUENTE, NEGRITA = 'Entrega', 'EntregaBold'
NEGRO = colors.black
ESTILOS = {
    'titulo': ParagraphStyle('titulo', fontName=NEGRITA, fontSize=25, leading=31, textColor=NEGRO, spaceAfter=13),
    'seccion': ParagraphStyle('seccion', fontName=NEGRITA, fontSize=12, leading=17, textColor=NEGRO, spaceBefore=9, spaceAfter=6, keepWithNext=True),
    'texto': ParagraphStyle('texto', fontName=FUENTE, fontSize=9.5, leading=13.7, textColor=NEGRO, spaceAfter=5, alignment=TA_LEFT),
    'lista': ParagraphStyle('lista', fontName=FUENTE, fontSize=9.5, leading=13.7, textColor=NEGRO, spaceAfter=5, leftIndent=10),
}

def pie(canvas, doc):
    ancho, alto = A4
    canvas.saveState()
    canvas.setFillColor(NEGRO)
    canvas.rect(0, alto - 8, ancho, 8, fill=1, stroke=0)
    canvas.setStrokeColor(NEGRO)
    canvas.line(44, 40, ancho - 44, 40)
    canvas.setFillColor(NEGRO)
    canvas.setFont(FUENTE, 7.5)
    canvas.drawString(44, 27, 'Sistema de gestión de clases | Documentación de entrega')
    canvas.drawRightString(ancho - 44, 27, f'Página {doc.page}')
    canvas.restoreState()

for nombre in ('guia-administrador', 'respaldo-recuperacion', 'validacion-entrega'):
    origen = ROOT / 'docs/entrega' / f'{nombre}.md'
    bloques = origen.read_text().strip().split('\n\n')
    elementos = []
    for bloque in bloques:
        if bloque.startswith('# '):
            elementos.append(Paragraph(escape(bloque[2:]), ESTILOS['titulo']))
        elif bloque.startswith('## '):
            elementos.append(Paragraph(escape(bloque[3:]), ESTILOS['seccion']))
        elif bloque.startswith('- '):
            for linea in bloque.splitlines():
                elementos.append(Paragraph('• ' + escape(linea[2:]), ESTILOS['lista']))
        elif bloque.startswith('1. '):
            for linea in bloque.splitlines():
                elementos.append(Paragraph(escape(linea), ESTILOS['lista']))
        else:
            elementos.append(Paragraph(escape(bloque).replace('\n', ' '), ESTILOS['texto']))
    titulo = bloques[0].removeprefix('# ')
    pdf = SimpleDocTemplate(str(DESTINO / f'{nombre}.pdf'), pagesize=A4, rightMargin=44, leftMargin=44, topMargin=42, bottomMargin=55, title=titulo, author='Sistema de gestión de clases')
    pdf.build(elementos, onFirstPage=pie, onLaterPages=pie)
    print(f'Generado: {nombre}.pdf')

with ZipFile(DESTINO / 'documentacion-entrega.zip', 'w', ZIP_DEFLATED) as archivo:
    for nombre in ('guia-administrador', 'respaldo-recuperacion', 'validacion-entrega'):
        archivo.write(DESTINO / f'{nombre}.pdf', arcname=f'Documentacion-del-sistema/{nombre}.pdf')
print('Generado: documentacion-entrega.zip')
