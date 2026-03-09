import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ProfileForm } from "@/components/profile/profile-form";

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("submits profile data and shows a saved state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            profile: {
              id: "profile-123",
              displayName: "Fujun",
              targetRoles: ["AI Product Intern"],
              targetCity: "Shanghai",
              resumeText: "Built AI workflow products.",
              resumeSummary: "Product-minded builder.",
              selfIntroDraft: "I turn AI ideas into product systems.",
              createdAt: "2026-03-09T00:00:00.000Z",
              updatedAt: "2026-03-09T00:00:00.000Z",
            },
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      ),
    );

    render(<ProfileForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Fujun" },
    });
    fireEvent.change(screen.getByLabelText(/target roles/i), {
      target: { value: "AI Product Intern, PM Intern" },
    });
    fireEvent.change(screen.getByLabelText(/target city/i), {
      target: { value: "Shanghai" },
    });
    fireEvent.change(screen.getByLabelText(/resume text/i), {
      target: {
        value: "Built AI workflow products and interview prep systems.",
      },
    });
    fireEvent.change(screen.getByLabelText(/resume summary/i), {
      target: {
        value: "Product-minded builder with applied AI experience.",
      },
    });
    fireEvent.change(screen.getByLabelText(/self intro draft/i), {
      target: {
        value: "I connect user needs, product logic, and AI execution.",
      },
    });

    fireEvent.submit(screen.getByRole("button", { name: /save profile/i }));

    await waitFor(() => {
      expect(screen.getByText(/profile saved/i)).toBeInTheDocument();
    });
  });
});
