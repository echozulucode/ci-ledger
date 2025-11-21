"""
Legacy items API tests are skipped because /api/items was retired in favor of CI Ledger domain endpoints.
"""
import pytest

pytestmark = pytest.mark.skip(reason="Legacy /api/items endpoints removed")
