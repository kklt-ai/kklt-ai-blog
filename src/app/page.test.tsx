import { render, screen, within } from "@testing-library/react";
import { WECHAT_URL } from "@/home/content";
import Home from "./page";

describe("Home", () => {
  it("renders the kklt AI works landing page as the project homepage", () => {
    const { container } = render(<Home />);

    expect(screen.getByRole("heading", { name: "卡卡罗特AI" })).toBeInTheDocument();
    expect(container.querySelector("main")).toHaveStyle({
      "--font-mincho": '"Huiwen Mincho", "Huiwen-mincho", "Noto Serif SC", "Songti SC", "STSong", Georgia, serif',
    });
    expect(screen.queryByText("关注公众号：卡卡罗特AI｜持续分享有用的 AI 内容")).not.toBeInTheDocument();
    expect(
      screen.getByText((_, element) => element?.tagName === "P" && element.textContent === "持续分享有用的 AI 内容～"),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "卡卡罗特AI 的 Vibe Coding 作品" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "md生成卡片" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "自媒体封面" })).toBeInTheDocument();

    const mainNavigation = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(mainNavigation).queryByRole("link", { name: "公众号" })).not.toBeInTheDocument();

    const wechatLinks = screen.getAllByRole("link", { name: "公众号" });
    expect(wechatLinks).toHaveLength(1);
    expect(wechatLinks[0]).toHaveAttribute("href", WECHAT_URL);
    expect(wechatLinks[0]).toHaveAttribute("target", "_blank");
    expect(wechatLinks[0]).toHaveAttribute("rel", "noreferrer");

    const footer = screen.getByRole("contentinfo");
    const authorLink = within(footer).getByRole("link", { name: "卡卡罗特AI" });
    expect(authorLink).toHaveAttribute("href", WECHAT_URL);
    expect(authorLink).toHaveAttribute("target", "_blank");
    expect(authorLink).toHaveAttribute("rel", "noreferrer");
    expect(screen.getByText("公众号作者：")).toBeInTheDocument();
    expect(screen.queryByText(/Copyright/)).not.toBeInTheDocument();
    expect(screen.queryByText("卡卡罗特AI Vibe Coding Works")).not.toBeInTheDocument();
    expect(screen.queryByText("AI 内容分享与工具实验室")).not.toBeInTheDocument();
    expect(screen.queryByText("Cookie Policy")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cookie Preferences" })).not.toBeInTheDocument();
  });
});
