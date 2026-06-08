from agent.agent import run, web_search


def test_agent_returns_support_scope() -> None:
    response = run("What can you help with?")
    assert "order status" in response


def test_policy_question_uses_search_stub() -> None:
    response = web_search("warranty policy")
    assert "Search result" in response

