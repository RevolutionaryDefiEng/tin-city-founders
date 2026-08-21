from __future__ import annotations

import json
import re
import hashlib
from collections import Counter
from pathlib import Path
from typing import Any

import pandas as pd


UPLOAD_DIR = Path("/home/ubuntu/upload")
OUTPUT_PATH = Path("/home/ubuntu/directory_consolidation_report.json")
PROFILE_OUTPUT_PATH = Path("/home/ubuntu/directory_consolidated_profiles.json")

SOURCES = {
    "directory": UPLOAD_DIR / "BuiltinJos—Directory(responses)-FormResponses1.csv",
    "mixer": UPLOAD_DIR / "TinCityFoundersMixer-Guests-2026-08-21-10-47-04.csv",
    "give_and_grow": UPLOAD_DIR / "TinCityFounders002—GIVE&GROW.-Guests-2026-08-21-10-46-08.csv",
}


def text(value: Any) -> str:
    if value is None or pd.isna(value):
        return ""
    return str(value).strip()


def normalize_email(value: Any) -> str:
    return text(value).lower()


def normalize_phone(value: Any) -> str:
    digits = re.sub(r"\D+", "", text(value))
    if digits.startswith("234") and len(digits) == 13:
        return "0" + digits[3:]
    return digits


def normalize_name(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", text(value).lower())


def count_distribution(values: list[str]) -> list[dict[str, Any]]:
    counts = Counter(value for value in values if value)
    return [
        {"label": label, "count": count}
        for label, count in sorted(counts.items(), key=lambda item: (-item[1], item[0].lower()))
    ]


def merge_records(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    parent = list(range(len(records)))

    def find(index: int) -> int:
        while parent[index] != index:
            parent[index] = parent[parent[index]]
            index = parent[index]
        return index

    def union(left: int, right: int) -> None:
        left_root = find(left)
        right_root = find(right)
        if left_root != right_root:
            parent[right_root] = left_root

    seen_keys: dict[str, int] = {}
    for index, record in enumerate(records):
        keys = []
        if record["email"]:
            keys.append(f"email:{record['email']}")
        if record["phone"]:
            keys.append(f"phone:{record['phone']}")
        if not keys and record["name"]:
            keys.append(f"name:{record['name']}")
        for key in keys:
            if key in seen_keys:
                union(index, seen_keys[key])
            else:
                seen_keys[key] = index

    grouped: dict[int, list[dict[str, Any]]] = {}
    for index, record in enumerate(records):
        grouped.setdefault(find(index), []).append(record)

    consolidated = []
    for group in grouped.values():
        directory_record = next((item for item in group if item["source"] == "directory"), None)
        preferred = directory_record or group[0]
        consolidated.append(
            {
                "name": next((item["display_name"] for item in group if item["display_name"]), ""),
                "email": next((item["raw_email"] for item in group if item["raw_email"]), ""),
                "phone": next((item["raw_phone"] for item in group if item["raw_phone"]), ""),
                "venture_name": preferred["venture_name"],
                "sector": preferred["sector"],
                "stage": preferred["stage"],
                "location": preferred["location"],
                "directory_listed": any(item["directory_listed"] for item in group),
                "sources": sorted({item["source"] for item in group}),
            }
        )
    return consolidated


def main() -> None:
    directory = pd.read_csv(SOURCES["directory"], dtype=str, keep_default_na=False, encoding="utf-8-sig")
    mixer = pd.read_csv(SOURCES["mixer"], dtype=str, keep_default_na=False, encoding="utf-8-sig")
    give_and_grow = pd.read_csv(SOURCES["give_and_grow"], dtype=str, keep_default_na=False, encoding="utf-8-sig")

    consent_column = "Can we list you in the public Built in Jos directory?"
    directory_records: list[dict[str, Any]] = []
    for _, row in directory.iterrows():
        consent = text(row[consent_column]).lower()
        directory_records.append(
            {
                "source": "directory",
                "display_name": text(row["Your name"]),
                "name": normalize_name(row["Your name"]),
                "raw_email": "",
                "email": "",
                "raw_phone": text(row["Contact — WhatsApp or phone"]),
                "phone": normalize_phone(row["Contact — WhatsApp or phone"]),
                "venture_name": text(row["Startup / venture name"]),
                "sector": text(row["Sector"]),
                "stage": text(row["Stage"]),
                "location": text(row["Where are you based?"]),
                "directory_listed": consent.startswith("yes") or consent in {"y", "true"},
            }
        )

    def guest_records(frame: pd.DataFrame, source: str) -> list[dict[str, Any]]:
        records: list[dict[str, Any]] = []
        for _, row in frame.iterrows():
            records.append(
                {
                    "source": source,
                    "display_name": text(row["name"]),
                    "name": normalize_name(row["name"]),
                    "raw_email": text(row["email"]),
                    "email": normalize_email(row["email"]),
                    "raw_phone": text(row["phone_number"]),
                    "phone": normalize_phone(row["phone_number"]),
                    "venture_name": "",
                    "sector": "",
                    "stage": "",
                    "location": "",
                    "directory_listed": False,
                }
            )
        return records

    all_records = directory_records + guest_records(mixer, "mixer") + guest_records(give_and_grow, "give_and_grow")
    consolidated = merge_records(all_records)
    public_directory = [record for record in consolidated if record["directory_listed"]]

    report = {
        "source_rows": {
            "built_in_jos_directory": len(directory),
            "tin_city_founders_mixer": len(mixer),
            "give_and_grow": len(give_and_grow),
            "total": len(all_records),
        },
        "consent": {
            "directory_rows_with_public_consent": sum(record["directory_listed"] for record in directory_records),
            "directory_consent_responses": count_distribution([text(value) for value in directory[consent_column].tolist()]),
        },
        "consolidation": {
            "unique_community_records": len(consolidated),
            "duplicate_records_collapsed": len(all_records) - len(consolidated),
            "public_directory_founders": len(public_directory),
        },
        "public_directory_statistics": {
            "venture_profiles": sum(bool(record["venture_name"]) for record in public_directory),
            "sectors_represented": len({record["sector"].lower() for record in public_directory if record["sector"]}),
            "locations_represented": len({record["location"].lower() for record in public_directory if record["location"]}),
            "sector_distribution": count_distribution([record["sector"] for record in public_directory]),
            "stage_distribution": count_distribution([record["stage"] for record in public_directory]),
        },
        "privacy_note": "Only records with explicit public-directory consent are included in public directory statistics. Event registration details remain excluded from the public display.",
    }

    OUTPUT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    profiles = []
    for record in consolidated:
        identity = "|".join(
            value for value in [record["email"].lower(), normalize_phone(record["phone"]), normalize_name(record["name"])] if value
        )
        profiles.append(
            {
                "profileKey": hashlib.sha256(identity.encode("utf-8")).hexdigest(),
                "canonicalName": record["name"],
                "email": record["email"],
                "phone": record["phone"],
                "ventureName": record["venture_name"],
                "sector": record["sector"],
                "stage": record["stage"],
                "location": record["location"],
                "directoryListed": record["directory_listed"],
                "sources": ",".join(record["sources"]),
            }
        )
    PROFILE_OUTPUT_PATH.write_text(json.dumps(profiles, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
