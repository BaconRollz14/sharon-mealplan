#!/usr/bin/env python3
"""Extract ordered, reviewable text from the source cookbook DOCX.

Usage:
    python3 scripts/extract-cookbook-source.py path/to/cookbook.docx > cookbook-source.txt

This uses only Python's standard library so the extraction step stays portable.
The resulting text is an intermediate review file; app/cookbook-data.ts remains
the typed, validated source consumed by the website.
"""

from __future__ import annotations

import argparse
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree


WORD_NAMESPACE = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
W = f"{{{WORD_NAMESPACE}}}"


def node_text(node: ElementTree.Element) -> str:
    return "".join(text.text or "" for text in node.iter(f"{W}t")).strip()


def extract_lines(docx_path: Path) -> list[str]:
    with zipfile.ZipFile(docx_path) as archive:
        document_xml = archive.read("word/document.xml")

    document = ElementTree.fromstring(document_xml)
    body = document.find(f"{W}body")
    if body is None:
        raise ValueError("The DOCX does not contain a Word document body.")

    lines: list[str] = []
    for child in body:
        if child.tag == f"{W}p":
            text = node_text(child)
            if text:
                lines.append(text)
        elif child.tag == f"{W}tbl":
            for row in child.findall(f"{W}tr"):
                cells = [node_text(cell) for cell in row.findall(f"{W}tc")]
                if any(cells):
                    lines.append(" | ".join(cells))
    return lines


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("docx", type=Path, help="Path to the cookbook DOCX")
    args = parser.parse_args()

    if not args.docx.is_file():
        parser.error(f"Cookbook not found: {args.docx}")

    try:
        lines = extract_lines(args.docx)
    except (KeyError, ValueError, zipfile.BadZipFile) as error:
        print(f"Could not extract cookbook: {error}", file=sys.stderr)
        return 1

    print("\n".join(lines))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

