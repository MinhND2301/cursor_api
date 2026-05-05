from __future__ import annotations

import asyncio

from app.prompts.linkedin import build_linkedin_rewrite_prompt


async def gemini_rewrite(api_key: str, casual: str) -> str:
    """Call the Gemini API synchronously in a thread to produce a LinkedIn rewrite."""
    from google import genai  # lazy import — only needed when a key is provided

    prompt = build_linkedin_rewrite_prompt(casual)
    client = genai.Client(api_key=api_key)

    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.0-flash",
        contents=prompt,
    )
    text = response.text or ""
    return text.strip()
