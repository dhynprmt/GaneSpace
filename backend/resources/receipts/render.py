"""Render one private registration receipt or QR from UTF-8 JSON on stdin."""
import io
import json
import sys
from pathlib import Path
from xml.sax.saxutils import escape

import reportlab
import qrcode
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer


def qr_png(url):
    code = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=4)
    code.add_data(url)
    code.make(fit=True)
    output = io.BytesIO()
    code.make_image().save(output, format="PNG")
    return output.getvalue()


def render_pdf(data, qr):
    font = Path(reportlab.__file__).parent / "fonts" / "Vera.ttf"
    pdfmetrics.registerFont(TTFont("ReceiptSans", str(font)))
    output = io.BytesIO()
    document = SimpleDocTemplate(output, pagesize=A4, title="Bukti pendaftaran GaneSpace",
                                 author="GaneSpace", leftMargin=46, rightMargin=46)
    heading = ParagraphStyle("Heading", fontName="ReceiptSans", fontSize=21, leading=27,
                             textColor=colors.HexColor("#102B69"))
    label = ParagraphStyle("Label", fontName="ReceiptSans", fontSize=9, leading=13,
                           textColor=colors.HexColor("#41536B"), spaceBefore=6)
    value = ParagraphStyle("Value", fontName="ReceiptSans", fontSize=12, leading=16)
    story = [Paragraph("GaneSpace", heading), Paragraph("Bukti pendaftaran akademik", value), Spacer(1, 12)]
    for name, content in data["fields"].items():
        story.extend([Paragraph(escape(name), label), Paragraph(escape(str(content or "—")), value)])
    image = Image(io.BytesIO(qr), width=144, height=144, hAlign="LEFT")
    story.extend([Spacer(1, 12), image, Paragraph("Pindai untuk memeriksa status bukti pendaftaran.", label)])
    document.build(story)
    return output.getvalue()


if __name__ == "__main__":
    payload = json.loads(sys.stdin.buffer.read())
    qr = qr_png(payload["url"])
    result = qr if sys.argv[1] == "qr" else render_pdf(payload, qr)
    sys.stdout.buffer.write(result)
