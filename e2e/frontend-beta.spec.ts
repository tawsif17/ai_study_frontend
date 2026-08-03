import { expect, test, type Page, type Route } from "@playwright/test"
import { BANGLADESH_DISTRICT_NAMES } from "../lib/api/types"

const API_BASE = "**/api"
const now = "2026-07-22T12:00:00.000Z"

const verifiedUser = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "student@example.com",
  full_name: "Beta Student",
  role: "student",
  plan_tier: "free",
  school: "Example School",
  city: "Chattogram",
  student_class: 9,
  email_verified_at: now,
  last_login_at: now,
  created_at: now,
  updated_at: now,
} as const

async function fulfillData(route: Route, data: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify({ success: status >= 200 && status < 300, data }),
  })
}

async function fulfillError(route: Route, status: number, message: string) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify({ success: false, error: { message } }),
  })
}

async function mockDistricts(page: Page) {
  await page.route(`${API_BASE}/auth/csrf`, (route) =>
    fulfillError(route, 401, "Authentication session missing or invalid")
  )
  await page.route(`${API_BASE}/locations/districts`, (route) =>
    fulfillData(route, { districts: [...BANGLADESH_DISTRICT_NAMES] })
  )
}

async function fulfillJson(route: Route, data: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(data),
  })
}

async function mockSubjectSetup(page: Page, planTier: "free" | "pro") {
  await page.route(`${API_BASE}/auth/me`, (route) =>
    fulfillData(route, { user: { ...verifiedUser, plan_tier: planTier } })
  )
  await page.route(`${API_BASE}/exam-types`, (route) =>
    fulfillJson(route, [{ id: 1, code: "SSC", name: "Secondary School Certificate" }])
  )
  await page.route(`${API_BASE}/subjects?*`, (route) =>
    fulfillData(route, {
      exam_type: "SSC",
      subjects: [{
        id: 2,
        name: "Physics",
        exam_type_id: 1,
        exam_type_code: "SSC",
        exam_type_name: "Secondary School Certificate",
      }],
    })
  )
  await page.route(`${API_BASE}/questions?*`, (route) =>
    fulfillData(route, {
      questions: [{
        id: 9,
        exam_type_id: 1,
        subject_id: 2,
        chapter_id: 7,
        question_type: "MCQ",
        stem_text: "What is 2 + 2?",
        difficulty: 1,
        source: "Dhaka Board 2025",
        source_badge: "Dhaka Board · 2025",
        language: "en",
        created_at: now,
      }],
    })
  )
  await page.route(`${API_BASE}/subjects/2/chapters`, (route) =>
    fulfillData(route, {
      subject_id: "2",
      chapters: [{ id: 7, subject_id: 2, chapter_name: "Motion", order_no: 1 }],
    })
  )
  if (planTier === "pro") {
    await page.route(`${API_BASE}/revision/summary`, (route) =>
      fulfillData(route, {
        bookmark_total: 0,
        active_mistake_total: 0,
        saved_question_total: 0,
        subjects: [],
      })
    )
  }
}

async function completeSignupForm(page: Page, verifyScrollable = false) {
  await page.getByLabel("Full Name").fill("Beta Student")
  await page.getByLabel("Email").fill("  Student@Example.com ")
  await page.getByLabel("Password").fill("StrongPass1")
  await page.getByLabel("School Name").fill("Example School")
  await page.getByRole("combobox", { name: "District" }).click()
  if (verifyScrollable) {
    const listbox = page.getByRole("listbox")
    await expect(listbox).toHaveCSS("overflow-y", "auto")
    expect(await listbox.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true)
  }
  await page.getByRole("combobox", { name: "Search districts" }).fill("chat")
  await page.getByRole("option", { name: "Chattogram" }).click()
  await page.getByRole("combobox", { name: "Class" }).click()
  await page.keyboard.press("Home")
  await page.keyboard.press("Enter")
}

test.beforeEach(async ({ page }) => {
  await page.route(`${API_BASE}/auth/me`, (route) =>
    fulfillError(route, 401, "Authentication session missing or invalid")
  )
})

test("signup 201 stays in place and offers prefilled verification recovery", async ({ page }) => {
  await mockDistricts(page)
  let registrationPayload: unknown
  await page.route(`${API_BASE}/auth/register`, async (route) => {
    registrationPayload = route.request().postDataJSON()
    await fulfillData(route, { message: "Registration successful. Please verify your email." }, 201)
  })

  await page.goto("/signup")
  await completeSignupForm(page, true)
  await page.getByRole("button", { name: "Create Account" }).click()

  expect(registrationPayload).toEqual({
    email: "student@example.com",
    password: "StrongPass1",
    fullName: "Beta Student",
    school: "Example School",
    city: "Chattogram",
    studentClass: 9,
  })
  await expect(page).toHaveURL(/\/signup$/)
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible()
  await expect(page.getByText("student@example.com")).toBeVisible()
  await expect(page.getByRole("link", { name: "Resend verification email" })).toHaveAttribute(
    "href",
    "/resend-verification?email=student%40example.com"
  )
})

test("signup 202 preserves the capacity waitlist confirmation", async ({ page }) => {
  await mockDistricts(page)
  await page.route(`${API_BASE}/auth/register`, (route) =>
    fulfillData(route, { message: "We’ve reached our current 200-user capacity. Your waitlist request has been received, and we’ll contact you when access becomes available." }, 202)
  )

  await page.goto("/signup")
  await completeSignupForm(page)
  await page.getByRole("button", { name: "Create Account" }).click()

  await expect(page.getByText("Request received")).toBeVisible()
  await expect(page.getByText(/We’ve reached our current 200-user capacity/)).toBeVisible()
  await expect(page.getByRole("heading", { name: "Check your email" })).toHaveCount(0)
})

test("signup retries district loading without losing entered form values", async ({ page }) => {
  let districtAttempts = 0
  await page.route(`${API_BASE}/auth/csrf`, (route) =>
    fulfillError(route, 401, "Authentication session missing or invalid")
  )
  await page.route(`${API_BASE}/locations/districts`, (route) => {
    districtAttempts += 1
    return districtAttempts === 1
      ? fulfillError(route, 500, "District lookup unavailable")
      : fulfillData(route, { districts: [...BANGLADESH_DISTRICT_NAMES] })
  })

  await page.goto("/signup")
  await page.getByLabel("Full Name").fill("Beta Student")
  await expect(page.getByText(/couldn't load the district list/i)).toBeVisible()
  await page.getByRole("button", { name: "Retry districts" }).click()

  await expect(page.getByRole("combobox", { name: "District" })).toBeEnabled()
  await expect(page.getByLabel("Full Name")).toHaveValue("Beta Student")
  expect(districtAttempts).toBe(2)
})

test("unverified login exposes the normalized resend destination", async ({ page }) => {
  await page.route(`${API_BASE}/auth/login`, (route) =>
    fulfillError(route, 403, "Email verification required")
  )

  await page.goto("/login")
  await page.getByLabel("Email").fill(" Student@Example.com ")
  await page.getByLabel("Password").fill("StrongPass1")
  await page.getByRole("button", { name: "Sign In" }).click()

  await expect(page.getByText("Email verification required", { exact: true })).toBeVisible()
  await expect(page.getByRole("link", { name: "Resend verification email" })).toHaveAttribute(
    "href",
    "/resend-verification?email=student%40example.com"
  )
})

test("verification removes the token from history before showing success", async ({ page }) => {
  await page.route(`${API_BASE}/auth/verify-email`, (route) =>
    fulfillData(route, { message: "Email verified successfully" })
  )

  await page.goto("/verify-email?token=secret-token&source=email")
  await expect(page).toHaveURL(/\/verify-email\?source=email$/)
  await expect(page.getByText("Email verified successfully")).toBeVisible()
  await expect(page.getByRole("link", { name: "Go to login" })).toBeVisible()
})

test("password recovery requests a generic email, removes its token, and returns to login", async ({ page }) => {
  await page.route(`${API_BASE}/auth/forgot-password`, (route) =>
    fulfillData(route, { message: "If the account is eligible, a password reset email has been sent." })
  )
  await page.route(`${API_BASE}/auth/reset-password`, (route) =>
    fulfillData(route, { message: "Password reset successful. Please log in with your new password." })
  )

  await page.goto("/login")
  await expect(page.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/forgot-password")

  await page.goto("/forgot-password")
  const email = page.getByLabel("Email")
  const submit = page.getByRole("button", { name: "Send password reset link" })
  await expect(email).toBeEditable()
  await email.fill(" Student@Example.com ")
  await expect(submit).toBeEnabled()
  await submit.click()
  await expect(page.getByText("If the account is eligible, a password reset email has been sent.")).toBeVisible()

  await page.goto("/reset-password?token=secret-reset-token&source=email")
  await expect(page).toHaveURL(/\/reset-password\?source=email$/)
  await page.getByLabel("New password", { exact: true }).fill("NewPassword123")
  await page.getByLabel("Confirm new password", { exact: true }).fill("NewPassword123")
  await page.getByRole("button", { name: "Reset password" }).click()
  await expect(page.getByText("Password reset successful. Please log in with your new password.")).toBeVisible()
  await expect(page.getByRole("link", { name: "Go to login" })).toHaveAttribute("href", "/login")
})

test("password reset broadcasts all-session revocation to authenticated tabs", async ({ context, page }) => {
  let sessionActive = true
  await context.route(`${API_BASE}/auth/me`, (route) =>
    sessionActive
      ? fulfillData(route, { user: verifiedUser })
      : fulfillError(route, 401, "Invalid or expired session")
  )
  await page.route(`${API_BASE}/auth/reset-password`, async (route) => {
    sessionActive = false
    await fulfillData(route, {
      message: "Password reset successful. Please log in with your new password.",
    })
  })

  const authenticatedPage = await context.newPage()
  await authenticatedPage.goto("/profile")
  await expect(
    authenticatedPage.getByRole("heading", { name: /Welcome back, Beta/ })
  ).toBeVisible()

  await page.goto("/reset-password?token=secret-reset-token")
  await page.getByLabel("New password", { exact: true }).fill("NewPassword123")
  await page.getByLabel("Confirm new password", { exact: true }).fill("NewPassword123")
  await page.getByRole("button", { name: "Reset password" }).click()

  await expect(page.getByText("Password reset successful. Please log in with your new password.")).toBeVisible()
  await expect(authenticatedPage).toHaveURL(/\/login\?next=%2Fprofile$/)
})

test("temporary account restoration failure stays indeterminate and recovers", async ({ page }) => {
  let attempts = 0
  await page.route(`${API_BASE}/auth/me`, async (route) => {
    attempts += 1
    if (attempts === 1) await fulfillError(route, 503, "Internal provider details")
    else await fulfillData(route, { user: verifiedUser })
  })

  await page.goto("/profile")
  await expect(page.getByText("We could not verify your session")).toBeVisible()
  await expect(page.getByText("Check your connection and retry before continuing.")).toBeVisible()
  await page.getByRole("button", { name: "Retry" }).click()
  await expect(page.getByRole("heading", { name: /Welcome back, Beta/ })).toBeVisible()
  await expect(page.getByText("We could not verify your session")).toHaveCount(0)
  expect(await page.evaluate(() => localStorage.getItem("auth_token"))).toBeNull()
})

test("logout synchronizes across open tabs", async ({ context, page }) => {
  let logoutCalled = false
  await context.route(`${API_BASE}/auth/me`, (route) => fulfillData(route, { user: verifiedUser }))
  await page.route(`${API_BASE}/auth/me`, (route) => fulfillData(route, { user: verifiedUser }))
  await context.route(`${API_BASE}/auth/csrf`, (route) =>
    fulfillData(route, { csrfToken: "logout-csrf" })
  )
  await context.route(`${API_BASE}/auth/logout`, async (route) => {
    expect(route.request().headers()["x-csrf-token"]).toBe("logout-csrf")
    logoutCalled = true
    await fulfillData(route, { message: "Logged out successfully" })
  })

  const secondPage = await context.newPage()
  await Promise.all([page.goto("/profile"), secondPage.goto("/profile")])
  await expect(page.getByRole("heading", { name: /Welcome back, Beta/ })).toBeVisible()
  await expect(secondPage.getByRole("heading", { name: /Welcome back, Beta/ })).toBeVisible()

  await page.getByRole("button", { name: "Open Beta Student's account menu" }).click()
  await page.getByRole("menuitem", { name: "Logout" }).click()

  await expect(secondPage).toHaveURL(/\/login\?next=%2Fprofile$/)
  expect(logoutCalled).toBe(true)
})

test("practice saves an answer, submits, and transitions to results", async ({ page }) => {
  let submitted = false
  let saved = false
  await page.route(`${API_BASE}/**`, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname

    if (path === "/api/auth/me") return fulfillData(route, { user: verifiedUser })
    if (path === "/api/auth/csrf") return fulfillData(route, { csrfToken: "practice-csrf" })
    if (path === "/api/practice/42/summary") {
      return fulfillData(route, {
        session: {
          id: 42,
          user_id: verifiedUser.id,
          exam_type_id: 1,
          subject_id: 2,
          selection_mode: "CHAPTERS",
          syllabus_version_id: null,
          mode: "MCQ",
          question_pool: "STANDARD",
          mcq_requested: 1,
          cq_requested: 0,
          attempt_status: submitted ? "SUBMITTED" : "IN_PROGRESS",
          created_at: now,
          submitted_at: submitted ? now : null,
        },
        totals: { mcq_total: 1, cq_total: 0 },
      })
    }
    if (path === "/api/practice/42/items") {
      return fulfillData(route, {
        practice_session_id: 42,
        section: "MCQ",
        page: 1,
        page_size: 20,
        total_in_section: 1,
        items: [{ section_order_no: 1, order_no: 1, practice_item_id: 7, question_id: 9, section: "MCQ" }],
      })
    }
    if (path === "/api/practice/42/answers" && request.method() === "GET") {
      return fulfillData(route, { answers: [] })
    }
    if (path === "/api/practice/42/answers" && request.method() === "PATCH") {
      expect(request.headers()["x-csrf-token"]).toBe("practice-csrf")
      saved = true
      return fulfillData(route, { saved: true })
    }
    if (path === "/api/questions/9") {
      return fulfillData(route, {
        question: {
          id: 9,
          exam_type_id: 1,
          subject_id: 2,
          chapter_id: 7,
          question_type: "MCQ",
          stem_text: "What is 2 + 2?",
          difficulty: 1,
          source: "Dhaka Board 2025",
          source_badge: "Dhaka Board · 2025",
          language: "en",
          status: "PUBLISHED",
          created_at: now,
          updated_at: now,
        },
        parts: [],
        media: [],
        options: [
          { id: 1, question_id: 9, label: "A", option_text: "3" },
          { id: 2, question_id: 9, label: "B", option_text: "4" },
        ],
      })
    }
    if (path === "/api/practice/42/submit") {
      expect(request.headers()["x-csrf-token"]).toBe("practice-csrf")
      submitted = true
      return fulfillData(route, { practice_session_id: 42, mcq_total: 1, mcq_correct: 1, mcq_score: 1 })
    }
    if (path === "/api/practice/42/results") {
      return fulfillData(route, {
        practice_session_id: 42,
        section: "MCQ",
        page: 1,
        page_size: 20,
        total_in_section: 1,
        explanation_access: {
          unlocked: false,
          required_plan: "pro",
          message: "Upgrade to Beta Pro to unlock explanations and revision.",
        },
        items: [{
          section_order_no: 1,
          order_no: 1,
          practice_item_id: 7,
          question: {
            id: 9,
            question_type: "MCQ",
            stem_text: "What is 2 + 2?",
            explanation: null,
            difficulty: 1,
            source: "Dhaka Board 2025",
            source_badge: "Dhaka Board · 2025",
            language: "en",
          },
          user_answer: { selected_option_label: "B" },
          mcq: {
            correct_option_label: "B",
            is_correct: true,
            options: [
              { label: "A", option_text: "3" },
              { label: "B", option_text: "4" },
            ],
          },
          media: [],
        }],
      })
    }
    if (path === "/api/subjects") {
      return fulfillData(route, {
        exam_type: "SSC",
        subjects: [{ id: 2, name: "General Math", exam_type_id: 1, exam_type_code: "SSC", exam_type_name: "SSC" }],
      })
    }
    return fulfillError(route, 404, `Unmocked request: ${request.method()} ${path}`)
  })

  await page.goto("/practice/42")
  await expect(page.getByText("What is 2 + 2?")).toBeVisible()
  await expect(page.getByText("Dhaka Board · 2025")).toBeVisible()
  await page.getByRole("button", { name: /4/ }).click()
  await expect(page.getByText("Saved")).toBeVisible()
  await page.getByRole("button", { name: "Submit" }).click()

  await expect.poll(() => saved).toBe(true)
  await expect.poll(() => submitted).toBe(true)
  await expect(page.getByText("Correct").first()).toBeVisible()
  await expect(page.getByText("Upgrade to Beta Pro to unlock explanations and revision.")).toBeVisible()
  await expect(page.getByText("Two pairs make four.")).toHaveCount(0)
})

test("Free Board-only selection opens Beta Pro without generating practice", async ({ page }) => {
  await mockSubjectSetup(page, "free")
  let generationCalls = 0
  await page.route(`${API_BASE}/practice/generate`, async (route) => {
    generationCalls += 1
    await fulfillError(route, 403, "Board-only practice requires Beta Pro.")
  })

  await page.goto("/subjects/2")
  await page.getByRole("checkbox", { name: "Motion" }).check()
  await page.getByRole("radio", { name: /Board-only/i }).click()

  await expect(page).toHaveURL(/\/pricing\?next=%2Fsubjects%2F2$/)
  expect(generationCalls).toBe(0)
})

for (const count of [10, 20, 25]) {
  test(`Free Standard generation submits exactly ${count} MCQs`, async ({ page }) => {
    await mockSubjectSetup(page, "free")
    await page.route(`${API_BASE}/auth/csrf`, (route) =>
      fulfillData(route, { csrfToken: `standard-${count}-csrf` })
    )
    const practiceId = 200 + count
    let generationPayload: unknown
    await page.route(`${API_BASE}/practice/generate`, async (route) => {
      generationPayload = route.request().postDataJSON()
      expect(route.request().headers()["x-csrf-token"]).toBe(`standard-${count}-csrf`)
      await fulfillData(route, {
        practice_session_id: practiceId,
        mcq_total: count,
        cq_total: 0,
        ...(count === 20
          ? { warning: { code: "MIX_DEVIATION", message: "The available Board mix was adjusted." } }
          : {}),
      }, 201)
    })
    await page.route(`${API_BASE}/practice/${practiceId}/summary`, (route) =>
      fulfillData(route, {
        session: {
          id: practiceId,
          user_id: verifiedUser.id,
          exam_type_id: 1,
          subject_id: 2,
          selection_mode: "CHAPTERS",
          syllabus_version_id: null,
          mode: "MCQ",
          question_pool: "STANDARD",
          mcq_requested: count,
          cq_requested: 0,
          attempt_status: "IN_PROGRESS",
          created_at: now,
          submitted_at: null,
        },
        totals: { mcq_total: count, cq_total: 0 },
      })
    )

    await page.goto("/subjects/2")
    await page.getByRole("checkbox", { name: "Motion" }).check()
    if (count !== 10) {
      await page.getByRole("combobox", { name: "Number of questions" }).click()
      await page.getByRole("option", { name: `${count} questions` }).click()
    }
    await page.getByRole("button", { name: "Start Practice" }).click()

    await expect.poll(() => generationPayload).toEqual({
      exam_type_id: 1,
      subject_id: 2,
      selection: { type: "CHAPTERS", chapter_ids: [7] },
      mode: "MCQ",
      question_pool: "STANDARD",
      mcq_count: count,
      cq_count: 0,
      language: "en",
    })
    await expect(page).toHaveURL(new RegExp(`/practice/${practiceId}`))
    if (count === 20) {
      await expect(page.getByText("The available Board mix was adjusted.")).toBeVisible()
    }
  })
}

test("Beta Pro generates the exact Board-only practice request", async ({ page }) => {
  await mockSubjectSetup(page, "pro")
  await page.route(`${API_BASE}/auth/csrf`, (route) =>
    fulfillData(route, { csrfToken: "board-only-csrf" })
  )
  let generationPayload: unknown
  await page.route(`${API_BASE}/practice/generate`, async (route) => {
    generationPayload = route.request().postDataJSON()
    expect(route.request().headers()["x-csrf-token"]).toBe("board-only-csrf")
    await fulfillData(route, { practice_session_id: 123, mcq_total: 10, cq_total: 0 }, 201)
  })

  await page.goto("/subjects/2")
  await page.getByRole("checkbox", { name: "Motion" }).check()
  await page.getByRole("radio", { name: /Board-only/i }).click()
  await page.getByRole("button", { name: "Start Practice" }).click()

  await expect.poll(() => generationPayload).toEqual({
    exam_type_id: 1,
    subject_id: 2,
    selection: { type: "CHAPTERS", chapter_ids: [7] },
    mode: "MCQ",
    question_pool: "BOARD_ONLY",
    mcq_count: 10,
    cq_count: 0,
    language: "en",
  })
  await expect(page).toHaveURL(/\/practice\/123/)
})

test("homepage acquisition CTAs switch to Practice after authentication", async ({ page }) => {
  await page.goto("/")
  const signedOutMain = page.getByRole("main")
  await expect(signedOutMain.getByRole("link", { name: "Start free", exact: true })).toHaveCount(2)
  await expect(signedOutMain.getByRole("link", { name: "Start free practice", exact: true })).toHaveCount(1)

  await page.route(`${API_BASE}/auth/me`, (route) => fulfillData(route, { user: verifiedUser }))
  await page.reload()

  const authenticatedMain = page.getByRole("main")
  await expect(authenticatedMain.getByRole("link", { name: "Practice", exact: true })).toHaveCount(3)
  await expect(authenticatedMain.getByRole("link", { name: "Start free", exact: true })).toHaveCount(0)
  await expect(authenticatedMain.getByRole("link", { name: "Start free practice", exact: true })).toHaveCount(0)
  await expect(authenticatedMain.getByRole("link", { name: "Start Practice", exact: true })).toHaveCount(3)
})

test("auth and recovery pages expose a keyboard skip path and reachable controls", async ({ page }) => {
  await page.route(`${API_BASE}/auth/me`, (route) => fulfillData(route, { user: verifiedUser }))
  for (const path of ["/signup", "/login", "/resend-verification", "/profile", "/pricing"]) {
    await page.goto(path)
    const skipLink = page.getByRole("link", { name: "Skip to main content" })
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (await skipLink.evaluate((element) => document.activeElement === element)) break
      await page.keyboard.press("Tab")
    }
    await expect(skipLink).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page.locator("#main-content")).toBeFocused()
  }
})
