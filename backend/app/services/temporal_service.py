import datetime
import os
import sys
from typing import Optional
try:
    from app.config import get_settings
except Exception:
    get_settings = None

# Common Windows timezone key names to IANA timezone identifiers
WINDOWS_TO_IANA = {
    "India Standard Time": "Asia/Kolkata",
    "Pacific Standard Time": "America/Los_Angeles",
    "Eastern Standard Time": "America/New_York",
    "Central Standard Time": "America/Chicago",
    "Mountain Standard Time": "America/Denver",
    "US Mountain Standard Time": "America/Phoenix",
    "Hawaiian Standard Time": "Pacific/Honolulu",
    "Alaskan Standard Time": "America/Anchorage",
    "GMT Standard Time": "Europe/London",
    "Greenwich Standard Time": "Atlantic/Reykjavik",
    "W. Europe Standard Time": "Europe/Berlin",
    "Central Europe Standard Time": "Europe/Prague",
    "Romance Standard Time": "Europe/Paris",
    "E. Europe Standard Time": "Europe/Bucharest",
    "FLE Standard Time": "Europe/Helsinki",
    "Russian Standard Time": "Europe/Moscow",
    "Tokyo Standard Time": "Asia/Tokyo",
    "China Standard Time": "Asia/Shanghai",
    "Singapore Standard Time": "Asia/Singapore",
    "Korea Standard Time": "Asia/Seoul",
    "Arabian Standard Time": "Asia/Dubai",
    "Israel Standard Time": "Asia/Jerusalem",
    "AUS Eastern Standard Time": "Australia/Sydney",
    "AUS Central Standard Time": "Australia/Darwin",
    "W. Australia Standard Time": "Australia/Perth",
    "New Zealand Standard Time": "Pacific/Auckland",
    "UTC": "UTC",
}


def get_iana_timezone() -> str:
    """
    Dynamically detect or resolve the server's IANA timezone identifier.
    Priority:
    1. settings.TIMEZONE or environment variable TZ / TIMEZONE
    2. Linux /etc/timezone or /etc/localtime symlink target
    3. Windows registry TimeZoneKeyName mapped to standard IANA name
    4. Python datetime tzname fallback
    """
    if get_settings:
        try:
            settings = get_settings()
            if getattr(settings, "TIMEZONE", None):
                return settings.TIMEZONE.strip()
        except Exception:
            pass

    tz_env = os.environ.get("TZ") or os.environ.get("TIMEZONE")
    if tz_env:
        return tz_env.strip()

    # Linux / Docker standard files
    if os.path.exists("/etc/timezone"):
        try:
            with open("/etc/timezone", "r", encoding="utf-8") as f:
                val = f.read().strip()
                if val:
                    return val
        except Exception:
            pass

    if os.path.exists("/etc/localtime"):
        try:
            target = os.path.realpath("/etc/localtime")
            if "zoneinfo/" in target:
                return target.split("zoneinfo/")[-1]
        except Exception:
            pass

    # Windows registry lookup
    now = datetime.datetime.now().astimezone()
    tz_name = now.tzname() or "UTC"

    if sys.platform == "win32":
        try:
            import winreg

            with winreg.OpenKey(
                winreg.HKEY_LOCAL_MACHINE,
                r"SYSTEM\CurrentControlSet\Control\TimeZoneInformation",
            ) as key:
                val, _ = winreg.QueryValueEx(key, "TimeZoneKeyName")
                if val:
                    tz_name = val
        except Exception:
            pass

    if tz_name in WINDOWS_TO_IANA:
        return WINDOWS_TO_IANA[tz_name]

    return tz_name


def get_temporal_context() -> str:
    """
    Dynamically generates the real-time temporal context from the server clock.
    Includes current date, time, year, day of the week, and IANA timezone,
    accompanied by clear grounding instructions for the model.
    """
    now = datetime.datetime.now().astimezone()

    date_str = now.strftime("%B %d, %Y").replace(" 0", " ")
    hour = now.strftime("%I").lstrip("0") or "12"
    minute_ampm = now.strftime("%M %p")
    time_str = f"{hour}:{minute_ampm}"
    year_str = str(now.year)
    day_str = now.strftime("%A")
    tz_str = get_iana_timezone()

    return (
        "=== REAL-TIME TEMPORAL CONTEXT ===\n"
        f"Current date: {date_str}\n"
        f"Current time: {time_str}\n"
        f"Year: {year_str}\n"
        f"Day: {day_str}\n"
        f"Timezone: {tz_str}\n\n"
        "TEMPORAL INSTRUCTIONS:\n"
        "- You have direct access to the live, accurate server clock provided above.\n"
        "- You MUST use this temporal context whenever the user asks about the current date, current time, current year, day of the week, relative dates like 'today', 'tomorrow', 'yesterday', 'this week', or recent events.\n"
        "- Never claim you do not know the current date or time, and never revert to an outdated training cutoff date when temporal context is requested.\n"
        "- All temporal references in the conversation should be anchored to this real-time context."
    )


def build_effective_system_prompt(
    base_prompt: str,
    web_search_context: Optional[str] = None,
) -> str:
    """
    Combines the master VickyAI system prompt with real-time temporal context
    and optional web search grounding context.
    """
    temporal_context = get_temporal_context()
    prompt_parts = [base_prompt, temporal_context]

    if web_search_context:
        prompt_parts.append(web_search_context)

    return "\n\n".join(prompt_parts)
