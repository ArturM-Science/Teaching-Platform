from agent.main import agent


def test_core_order_status_still_works() -> None:
    response = agent.generate("Where is my order?")
    assert "Order" in response


def test_catalog_search_still_works() -> None:
    response = agent.generate("Find a replacement part")
    assert "catalog" in response.lower()

