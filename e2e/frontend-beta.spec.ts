import { expect, test, type Page, type Route } from "@playwright/test"

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

async function completeSignupForm(page: Page) {
  await page.getByLabel("Full Name").fill("Beta Student")
  await page.getByLabel("Email").fill("  Student@Example.com ")
  await page.getByLabel("Password").fill("StrongPass1")
  await page.getByLabel("School Name").fill("Example School")
  await page.getByLabel("City").fill("Chattogram")
  await page.getByRole("combobox", { name: "Class" }).click()
  await page.getByRole("option", { name: "Class 9" }).click()
}

test("signup 201 stays in place and offers prefilled verification recovery", async ({ page }) => {
  await page.route(`${API_BASE}/auth/register`, (route) =>
    fulfillData(route, { message: "Registration successful. Please verify your email." }, 201)
  )

  await page.goto("/signup")
  await completeSignupForm(page)
  await page.getByRole("button", { name: "Create Account" }).click()

  await expect(page).toHaveURL(/\/signup$/)
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible()
  await expect(page.getByText("student@example.com")).toBeVisible()
  await expect(page.getByRole("link", { name: "Resend verification email" })).toHaveAttribute(
    "href",
    "/resend-verification?email=student%40example.com"
  )
})

test("signup 202 preserves the private-beta request confirmation", async ({ page }) => {
  await page.route(`${API_BASE}/auth/register`, (route) =>
    fulfillData(route, { message: "Your beta access request has been received." }, 202)
  )

  await page.goto("/signup")
  await completeSignupForm(page)
  await page.getByRole("button", { name: "Create Account" }).click()

  await expect(page.getByText("Request received")).toBeVisible()
  await expect(page.getByText("Your beta access request has been received.")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Check your email" })).toHaveCount(0)
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

test("temporary account refresh failure retains the session and recovers", async ({ page }) => {
  let attempts = 0
  await page.addInitScript(() => localStorage.setItem("auth_token", "stored-token"))
  await page.route(`${API_BASE}/auth/me`, async (route) => {
    attempts += 1
    if (attempts === 1) await fulfillError(route, 503, "Internal provider details")
    else await fulfillData(route, { user: verifiedUser })
  })

  await page.goto("/profile")
  await expect(page.getByText("We could not refresh your account")).toBeVisible()
  await expect(page.getByText("Your session is still saved.")).toBeVisible()
  await page.getByRole("button", { name: "Retry" }).click()
  await expect(page.getByRole("heading", { name: /Welcome back, Beta/ })).toBeVisible()
  await expect(page.getByText("We could not refresh your account")).toHaveCount(0)
  expect(await page.evaluate(() => localStorage.getItem("auth_token"))).toBe("stored-token")
})

test("logout synchronizes across open tabs", async ({ context, page }) => {
  await context.addInitScript(() => localStorage.setItem("auth_token", "stored-token"))
  await context.route(`${API_BASE}/auth/me`, (route) => fulfillData(route, { user: verifiedUser }))

  const secondPage = await context.newPage()
  await Promise.all([page.goto("/profile"), secondPage.goto("/profile")])
  await expect(page.getByRole("heading", { name: /Welcome back, Beta/ })).toBeVisible()
  await expect(secondPage.getByRole("heading", { name: /Welcome back, Beta/ })).toBeVisible()

  await page.getByRole("button", { name: "Open Beta Student's account menu" }).click()
  await page.getByRole("menuitem", { name: "Logout" }).click()

  await expect(secondPage).toHaveURL(/\/login\?next=%2Fprofile$/)
  expect(await secondPage.evaluate(() => localStorage.getItem("auth_token"))).toBeNull()
})

test("practice saves an answer, submits, and transitions to results", async ({ page }) => {
  let submitted = false
  let saved = false
  await page.addInitScript(() => localStorage.setItem("auth_token", "stored-token"))
  await page.route(`${API_BASE}/**`, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname

    if (path === "/api/auth/me") return fulfillData(route, { user: verifiedUser })
    if (path === "/api/practice/42/summary") {
      return fulfillData(route, {
        practice_session_id: 42,
        exam_type_id: 1,
        subject_id: 2,
        mode: "MCQ",
        attempt_status: submitted ? "SUBMITTED" : "IN_PROGRESS",
        mcq_total: 1,
        cq_total: 0,
      })
    }
    if (path === "/api/practice/42/items") {
      return fulfillData(route, {
        practice_session_id: 42,
        section: "MCQ",
        page: 1,
        page_size: 20,
        total_in_section: 1,
        items: [{ section_order_no: 1, order_no: 1, practice_item_id: 7, question_id: 9 }],
      })
    }
    if (path === "/api/practice/42/answers" && request.method() === "GET") {
      return fulfillData(route, { answers: [] })
    }
    if (path === "/api/practice/42/answers" && request.method() === "PATCH") {
      saved = true
      return fulfillData(route, { saved: true })
    }
    if (path === "/api/questions/9") {
      return fulfillData(route, {
        id: 9,
        question_type: "MCQ",
        stem_text: "What is 2 + 2?",
        explanation: "Two pairs make four.",
        language: "en",
        media: [],
        options: [
          { label: "A", option_text: "3" },
          { label: "B", option_text: "4" },
        ],
      })
    }
    if (path === "/api/practice/42/submit") {
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
        items: [{
          section_order_no: 1,
          order_no: 1,
          practice_item_id: 7,
          question: {
            id: 9,
            question_type: "MCQ",
            stem_text: "What is 2 + 2?",
            explanation: "Two pairs make four.",
            difficulty: 1,
            source: null,
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
  await page.getByRole("button", { name: /4/ }).click()
  await expect(page.getByText("Saved")).toBeVisible()
  await page.getByRole("button", { name: "Submit" }).click()

  await expect.poll(() => saved).toBe(true)
  await expect.poll(() => submitted).toBe(true)
  await expect(page.getByText("Correct").first()).toBeVisible()
  await expect(page.getByText("Two pairs make four.")).toBeVisible()
})

test("auth and recovery pages expose a keyboard skip path and reachable controls", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("auth_token", "stored-token"))
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
