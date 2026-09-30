"""Load the age-rating catalog from the skill's authoritative reference."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


CATALOG_PATH = Path(__file__).resolve().parents[2] / "references" / "age-rating-catalog.json"


def _load_catalog() -> dict[str, Any]:
    with CATALOG_PATH.open("r", encoding="utf-8") as source:
        return json.load(source)


AGE_RATING_CATALOG = _load_catalog()
