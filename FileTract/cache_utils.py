import json
import os
from typing import Any, Callable, Optional, TypeVar

try:
    import redis
except ImportError:  # pragma: no cover - dependency may be omitted locally
    redis = None


T = TypeVar("T")

DEFAULT_TTL_SECONDS = int(os.environ.get("REDIS_CACHE_TTL_SECONDS", "300"))
REDIS_URL = os.environ.get("REDIS_URL")


class RedisCache:
    def __init__(self, redis_url: Optional[str] = REDIS_URL):
        self.client = None
        if redis_url and redis is not None:
            try:
                self.client = redis.Redis.from_url(
                    redis_url,
                    socket_connect_timeout=1,
                    socket_timeout=1,
                    decode_responses=True,
                )
                self.client.ping()
            except Exception:
                self.client = None

    @property
    def enabled(self) -> bool:
        return self.client is not None

    def get_json(self, key: str) -> Optional[Any]:
        if not self.client:
            return None
        try:
            raw_value = self.client.get(key)
            return json.loads(raw_value) if raw_value else None
        except Exception:
            return None

    def set_json(self, key: str, value: Any, ttl_seconds: int = DEFAULT_TTL_SECONDS) -> None:
        if not self.client:
            return
        try:
            self.client.setex(key, ttl_seconds, json.dumps(value))
        except Exception:
            return

    def delete_pattern(self, pattern: str) -> None:
        if not self.client:
            return
        try:
            for key in self.client.scan_iter(match=pattern):
                self.client.delete(key)
        except Exception:
            return

    def get_or_set(self, key: str, loader: Callable[[], T], ttl_seconds: int = DEFAULT_TTL_SECONDS) -> T:
        cached_value = self.get_json(key)
        if cached_value is not None:
            return cached_value

        value = loader()
        self.set_json(key, value, ttl_seconds)
        return value


cache = RedisCache()
