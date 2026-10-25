from fastapi import APIRouter
from api.schemas import ApiResponse, ChatRequest, ChatResponse
from api.gemini_service import generate_chat_reply

router = APIRouter()

@router.post("/chat", response_model=ApiResponse[ChatResponse])
async def chat_with_assistant(request: ChatRequest):
    response = await generate_chat_reply(
        message=request.message,
        history=request.history,
        project_context=request.project_context
    )
    return ApiResponse(
        success=True,
        data=response
    )
