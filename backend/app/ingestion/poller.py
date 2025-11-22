"""
Lightweight poller skeleton for ingestion.

For MVP we keep this minimal: if enabled via settings, a background task
will wake on an interval and can be extended to poll Jenkins or other
sources. By default it is disabled.
"""
import asyncio
import logging
from contextlib import suppress

from app.core.config import settings

logger = logging.getLogger(__name__)


async def poll_once():
    """
    Placeholder poll action.

    Extend this to call Jenkins or other sources, then normalize and
    upsert into events. Currently logs a heartbeat to verify scheduling.
    """
    logger.info("Poller tick (no-op). Extend poll_once for real ingestion.")


async def _run_pollers(stop_event: asyncio.Event, interval_seconds: int):
    while not stop_event.is_set():
        try:
            await poll_once()
        except Exception:  # pragma: no cover - defensive logging
            logger.exception("Poller error")
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=interval_seconds)
        except asyncio.TimeoutError:
            continue


def start_pollers(stop_event: asyncio.Event) -> asyncio.Task | None:
    """
    Start pollers if enabled. Returns the task or None when disabled.
    """
    if not settings.JENKINS_POLL_ENABLED:
        logger.info("Pollers disabled (JENKINS_POLL_ENABLED=false)")
        return None
    interval = max(settings.JENKINS_POLL_INTERVAL, 30)
    logger.info("Starting pollers with interval=%ss", interval)
    return asyncio.create_task(_run_pollers(stop_event, interval))


async def stop_pollers(task: asyncio.Task | None, stop_event: asyncio.Event):
    """Signal stop and await the poller task if running."""
    stop_event.set()
    if task:
        task.cancel()
        with suppress(asyncio.CancelledError):
            await task
