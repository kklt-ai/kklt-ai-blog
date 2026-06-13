import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders the MiMo Code landing page as the project homepage", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "MiMo Code" })).toBeInTheDocument();
    expect(
      screen.getByText("curl -fsSL https://mimo.xiaomi.com/install | bash"),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "为什么选择 MiMo Code" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "无限上下文" })).toBeInTheDocument();
  });
});
