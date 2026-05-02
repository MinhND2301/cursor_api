from pydantic import BaseModel, Field


class ConvertRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Casual sentence to rewrite.")


class ConvertResponse(BaseModel):
    linkedin_text: str
