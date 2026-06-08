from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel

from .tools import REGISTERED_TOOLS

app = FastAPI(title="Module 08 Customer Support Agent")


class ChatRequest(BaseModel):
    message: str
    user_id: str = "lab-user"


class ChatResponse(BaseModel):
    message: str
    blocked: bool = False
    category: str | None = None


class CustomerSupportAgent:
    def generate(self, message: str) -> str:
        lowered = message.lower()
        if "refund" in lowered:
            return REGISTERED_TOOLS["refund_order"]("A100", 25.00)
        if "email" in lowered:
            return REGISTERED_TOOLS["send_email"]("customer@example.com", "Support update", message)
        if "catalog" in lowered or "part" in lowered:
            return REGISTERED_TOOLS["search_catalog"](message)
        return REGISTERED_TOOLS["read_order_status"]("A100")


agent = CustomerSupportAgent()


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    response_text = agent.generate(request.message)
    return ChatResponse(message=response_text)

