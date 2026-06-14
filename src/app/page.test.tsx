import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders the Kakaluote AI works landing page as the project homepage", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "卡卡罗特AI" })).toBeInTheDocument();
    expect(screen.queryByText("关注公众号：卡卡罗特AI｜持续分享有用的 AI 内容")).not.toBeInTheDocument();
    expect(
      screen.getByText((_, element) => element?.tagName === "P" && element.textContent === "持续分享有用的 AI 内容～"),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "卡卡罗特AI 的 Vibe Coding 作品" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "md生成卡片" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "自媒体封面" })).toBeInTheDocument();
  });
});
