"""Extract the supplied directory without modifying the source workbook.

Run with the bundled Python runtime (openpyxl is used only for reading).
"""
import collections
import hashlib
import json
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs/knowledge-base/sources/PostOffice_68_07.xlsx"
TARGET = ROOT / "src/data/postOffices.json"


def main():
    workbook = openpyxl.load_workbook(SOURCE, read_only=True, data_only=True)
    sheet = workbook["ปณ."]
    assert sheet["B2"].value == "สถานะ วันที่ 31 ก.ค. 2568"
    assert [sheet.cell(3, col).value for col in range(2, 7)] == [
        "ลำดับ", "สังกัด", "รหัสไปรษณีย์", "ที่ทำการไปรษณีย์", "ไลน์กลุ่ม CEC ปน./ปข.",
    ]
    offices = []
    for row_number, row in enumerate(sheet.iter_rows(min_row=4, max_col=6, values_only=True), 4):
        _, sequence, division, raw_code, name, group = row
        if all(value is None for value in row):
            continue
        if isinstance(raw_code, (float, int)):
            assert int(raw_code) == raw_code, f"Non-integer code at row {row_number}"
            code = str(int(raw_code)).zfill(5)
        else:
            code = str(raw_code).strip()
        assert len(code) == 5 and code.isascii() and code.isdigit(), row_number
        assert division and name and group == f"CEC {division}", row_number
        offices.append({
            "code": code, "name": str(name).strip(), "division": str(division).strip(),
            "cecCode": str(group).strip(), "sourceRow": row_number,
        })
    codes = [office["code"] for office in offices]
    assert len(codes) == len(set(codes)), "Duplicate office codes require explicit resolution"
    groups = collections.Counter(office["cecCode"] for office in offices)
    expected = [f"CEC ปน.{i}" for i in range(1, 5)] + [f"CEC ปข.{i}" for i in range(1, 11)]
    assert set(groups) == set(expected)
    output = {
        "source": SOURCE.name, "sheet": sheet.title, "asOf": "2025-07-31",
        "asOfLabel": "31 ก.ค. 2568", "sha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        "groups": [{"id": i, "code": code, "officeCount": groups[code]} for i, code in enumerate(expected, 1)],
        "offices": offices,
    }
    TARGET.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    workbook.close()
    print(json.dumps({"offices": len(offices), "groups": len(groups), "sha256": output["sha256"]}))


if __name__ == "__main__":
    main()
