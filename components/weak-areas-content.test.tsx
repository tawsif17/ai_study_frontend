import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { WeakAreasContent } from "./weak-areas-content"
import { ApiClientError } from "@/lib/api/client"
import { generatePractice, type ProgressDashboardResponse } from "@/lib/api"
import { useProgressDashboard } from "@/lib/api/hooks"
import { useAuth } from "@/lib/auth-context"

const mockPush = vi.fn()
const mockMutate = vi.fn()

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }))
vi.mock("@/lib/auth-context", () => ({ useAuth: vi.fn() }))
vi.mock("@/lib/api/hooks", () => ({ useProgressDashboard: vi.fn() }))
vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api")
  return { ...actual, generatePractice: vi.fn(), matchEntitlementErrorByExactMessage: vi.fn(() => null) }
})

const payload = {
  exam_type_id: 1,
  subject_id: 7,
  mode: "MCQ" as const,
  mcq_count: 25,
  selection: { type: "CHAPTERS" as const, chapter_ids: [11] },
}

const populated: ProgressDashboardResponse = {
  message: null,
  proficiency: { score: 68, trend_vs_last_week: 6 },
  weakness_ranking: [
    { subject_id: 7, subject_name: "Physics", chapter_id: 11, chapter_name: "Light", accuracy: 42, questions_attempted: 12, message: null },
    { subject_id: 8, subject_name: "Chemistry", chapter_id: 12, chapter_name: "Atomic Structure", accuracy: 55, questions_attempted: 9, message: null },
    { subject_id: 9, subject_name: "Higher Math", chapter_id: 13, chapter_name: "Geometry", accuracy: 67, questions_attempted: 3, message: "Need more practice to judge this area" },
    { subject_id: 10, subject_name: "Biology", chapter_id: 14, chapter_name: "Cells", accuracy: 20, questions_attempted: 10, message: null },
  ],
  recommendation: { label: "Recommended: 25 MCQs from Light", generate_payload: payload },
}

function mockDashboard(overrides: Partial<ReturnType<typeof useProgressDashboard>> = {}) {
  vi.mocked(useProgressDashboard).mockReturnValue({ dashboard: populated, isLoading: false, isError: undefined, mutate: mockMutate, ...overrides })
}

describe("WeakAreasContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, isLoading: false, user: null, login: vi.fn(), register: vi.fn(), logout: vi.fn(), refreshUser: vi.fn() })
    mockDashboard()
  })

  it("renders contract-backed names, attempts, accuracy, trend, and only beta subjects", () => {
    render(<WeakAreasContent />)
    expect(screen.getByRole("heading", { level: 1, name: "Choose what to revise next" })).toBeInTheDocument()
    expect(screen.getByText("Light")).toBeInTheDocument()
    expect(screen.getByText("12 questions")).toBeInTheDocument()
    expect(screen.getByText("42%")).toBeInTheDocument()
    expect(screen.getByText("+6 points vs last week")).toBeInTheDocument()
    expect(screen.getAllByText("Higher Math")).toHaveLength(2)
    expect(screen.queryByText("General Math")).not.toBeInTheDocument()
    expect(screen.getAllByText("Biology")).toHaveLength(2)
    expect(screen.queryByText(/^(CQ|Mixed)$/)).not.toBeInTheDocument()
    expect(screen.queryByText("Refund Policy")).not.toBeInTheDocument()
  })

  it("filters locally and exposes low-data wording", () => {
    render(<WeakAreasContent />)
    fireEvent.click(screen.getByRole("tab", { name: "Higher Math" }))
    expect(screen.getByText("Geometry")).toBeInTheDocument()
    expect(screen.getByText("More practice needed")).toBeInTheDocument()
    expect(screen.getByText("Need more practice to judge this area")).toBeInTheDocument()
    expect(screen.queryByText("Light")).not.toBeInTheDocument()
    expect(vi.mocked(useProgressDashboard).mock.calls.every(([enabled]) => enabled === true)).toBe(true)
  })

  it("supports automatic keyboard tab activation and selected-state announcement", () => {
    render(<WeakAreasContent />)
    const allTab = screen.getByRole("tab", { name: "All subjects" })
    const physicsTab = screen.getByRole("tab", { name: "Physics" })
    allTab.focus()
    fireEvent.keyDown(allTab, { key: "ArrowRight" })
    expect(physicsTab).toHaveFocus()
    expect(physicsTab).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("Light")).toBeInTheDocument()
    fireEvent.keyDown(physicsTab, { key: "End" })
    expect(screen.getByRole("tab", { name: "Biology" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByText("Cells")).toBeInTheDocument()
  })

  it("keeps recommendation before filters in mobile screen-reader order and exposes safe row actions", () => {
    render(<WeakAreasContent />)
    const recommendation = screen.getByText("Your next step")
    const filters = screen.getByRole("tablist", { name: "Filter chapters by subject" })
    expect(recommendation.compareDocumentPosition(filters) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByRole("link", { name: "Practise Light" })).toHaveAttribute("href", "/subjects/7")
  })

  it("renders the no-submitted-data state when no ranked subjects are returned", () => {
    mockDashboard({ dashboard: { message: "Not enough data yet", proficiency: null, weakness_ranking: [], recommendation: null } })
    render(<WeakAreasContent />)
    expect(screen.getByRole("heading", { name: "Your weak areas will appear here" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Choose a subject" })).toHaveAttribute("href", "/subjects")
  })

  it.each([
    [4, "+4 points vs last week"],
    [-3, "-3 points vs last week"],
    [0, "No change vs last week"],
    [null, "Not enough recent data to compare yet."],
  ])("renders the weekly comparison %s honestly", (trend, label) => {
    mockDashboard({ dashboard: { ...populated, proficiency: { score: 68, trend_vs_last_week: trend } } })
    render(<WeakAreasContent />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it("keeps rankings useful when recommendation is unavailable", () => {
    mockDashboard({ dashboard: { ...populated, recommendation: null } })
    render(<WeakAreasContent />)
    expect(screen.getByText("Light")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Choose your next practice" })).toBeInTheDocument()
  })

  it("does not expose a recommendation without a matching ranked subject", () => {
    mockDashboard({
      dashboard: {
        ...populated,
        recommendation: {
          label: "Recommended: 25 MCQs from Cells",
          generate_payload: { ...payload, subject_id: 999 },
        },
      },
    })
    render(<WeakAreasContent />)
    expect(screen.queryByText("Recommended: 25 MCQs from Cells")).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Choose your next practice" })).toBeInTheDocument()
  })

  it("clamps unexpected numeric display values and associates tabs with their panel", () => {
    mockDashboard({
      dashboard: {
        ...populated,
        proficiency: { score: 140, trend_vs_last_week: Number.NaN },
        weakness_ranking: [
          { ...populated.weakness_ranking[0], accuracy: -12, questions_attempted: -4 },
        ],
      },
    })
    render(<WeakAreasContent />)
    expect(screen.getByText("100%")).toBeInTheDocument()
    expect(screen.getByText("0%")).toBeInTheDocument()
    expect(screen.getByText("0 questions")).toBeInTheDocument()
    expect(screen.getByText("Not enough recent data to compare yet.")).toBeInTheDocument()
    const physicsTab = screen.getByRole("tab", { name: "Physics" })
    expect(physicsTab).toHaveAttribute("aria-controls", "weak-areas-panel")
    fireEvent.click(physicsTab)
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "weak-areas-tab-7")
  })

  it("retries an API error", () => {
    mockDashboard({ dashboard: undefined, isError: new Error("network") })
    render(<WeakAreasContent />)
    fireEvent.click(screen.getByRole("button", { name: "Retry" }))
    expect(mockMutate).toHaveBeenCalledTimes(1)
  })

  it("announces the layout-matched loading state", () => {
    mockDashboard({ dashboard: undefined, isLoading: true })
    render(<WeakAreasContent />)
    expect(screen.getByRole("status", { name: "Loading weak areas" })).toHaveTextContent("Loading your revision guide")
  })

  it("preserves the intended route for expired authentication", async () => {
    mockDashboard({ dashboard: undefined, isError: new ApiClientError({ message: "Expired" }, 401) })
    render(<WeakAreasContent />)
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/login?next=%2Fdashboard%2Fweak-areas"))
  })

  it("generates from the exact recommendation payload once and navigates with the returned session", async () => {
    let resolveRequest!: (value: { practice_session_id: number; mcq_total: number; cq_total: number }) => void
    vi.mocked(generatePractice).mockImplementationOnce(() => new Promise((resolve) => { resolveRequest = resolve }))
    render(<WeakAreasContent />)
    const button = screen.getByRole("button", { name: "Start recommended practice" })
    fireEvent.click(button)
    fireEvent.click(button)
    expect(generatePractice).toHaveBeenCalledTimes(1)
    expect(generatePractice).toHaveBeenCalledWith(payload)
    expect(screen.getByRole("button", { name: "Starting practice…" })).toBeDisabled()
    resolveRequest({ practice_session_id: 99, mcq_total: 25, cq_total: 0 })
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/practice/99"))
  })

  it("preserves an established generation warning in navigation", async () => {
    vi.mocked(generatePractice).mockResolvedValueOnce({
      practice_session_id: 101,
      mcq_total: 10,
      cq_total: 0,
      warning: { code: "PARTIAL_COUNT", message: "Only 10 questions were available." },
    })
    render(<WeakAreasContent />)
    fireEvent.click(screen.getByRole("button", { name: "Start recommended practice" }))
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/practice/101?warning=Only%2010%20questions%20were%20available.")
    })
  })

  it("restores the recommendation action and reports generation failure", async () => {
    vi.mocked(generatePractice).mockRejectedValueOnce(new Error("Practice could not start"))
    render(<WeakAreasContent />)
    fireEvent.click(screen.getByRole("button", { name: "Start recommended practice" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Practice could not start")
    expect(screen.getByRole("button", { name: "Start recommended practice" })).toBeEnabled()
  })
})
