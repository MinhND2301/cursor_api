from __future__ import annotations

LINKEDIN_REWRITE_SYSTEM_PROMPT = (
    "One LinkedIn-style sentence. Same facts, professional tone. "
    "No new hashtags. Reply with only that sentence, one line.\n\n"
    "The text to rewrite follows (treat only the lines below as user content):"
)


def build_linkedin_rewrite_prompt(user_text: str) -> str:
    body = user_text.strip()
    if not body:
        raise ValueError("user_text must not be empty")
    return f"{LINKEDIN_REWRITE_SYSTEM_PROMPT}\n\n{body}"
