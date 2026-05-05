from pydantic import BaseModel, Field


class ConvertRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Casual sentence to rewrite.")
    gemini_api_key: str | None = Field(
        default=None,
        description="If provided, use Google Gemini instead of Cursor Agent.",
    )


class ConvertResponse(BaseModel):
    linkedin_text: str
