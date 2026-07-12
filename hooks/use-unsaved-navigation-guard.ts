"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

const UNSAVED_MESSAGE = "An answer has not finished saving. Leave this practice session anyway?"
const HISTORY_GUARD_KEY = "__shikkhaPracticeSaveGuard"

export function useUnsavedNavigationGuard(shouldBlock: boolean) {
  const router = useRouter()
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const shouldBlockRef = useRef(shouldBlock)
  const allowNextNavigationRef = useRef(false)
  const historyGuardIdRef = useRef(`practice-save-${Math.random().toString(36).slice(2)}`)
  const historyGuardArmedRef = useRef(false)
  const historyCleanupInProgressRef = useRef(false)

  const armHistoryGuard = useCallback(() => {
    if (
      typeof window === "undefined" ||
      historyGuardArmedRef.current ||
      historyCleanupInProgressRef.current ||
      !shouldBlockRef.current
    ) {
      return
    }

    const currentState = window.history.state
    const nextState = currentState && typeof currentState === "object" ? { ...currentState } : {}
    nextState[HISTORY_GUARD_KEY] = historyGuardIdRef.current
    window.history.pushState(nextState, "", window.location.href)
    historyGuardArmedRef.current = true
  }, [])

  const disarmHistoryGuard = useCallback(() => {
    if (!historyGuardArmedRef.current || typeof window === "undefined") return

    const state = window.history.state
    if (state?.[HISTORY_GUARD_KEY] !== historyGuardIdRef.current) {
      historyGuardArmedRef.current = false
      return
    }

    historyGuardArmedRef.current = false
    historyCleanupInProgressRef.current = true
    window.history.back()
  }, [])

  useEffect(() => {
    shouldBlockRef.current = shouldBlock
    allowNextNavigationRef.current = false

    if (shouldBlock) {
      armHistoryGuard()
    } else {
      setPendingHref(null)
      disarmHistoryGuard()
    }
  }, [armHistoryGuard, disarmHistoryGuard, shouldBlock])

  useEffect(() => {
    const historyGuardId = historyGuardIdRef.current

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldBlockRef.current || allowNextNavigationRef.current) return
      event.preventDefault()
      event.returnValue = ""
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (!shouldBlockRef.current || allowNextNavigationRef.current || event.defaultPrevented) return
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest<HTMLAnchorElement>("a[href]")
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return

      const url = new URL(anchor.href, window.location.href)
      const currentUrl = new URL(window.location.href)
      if (url.href === currentUrl.href || (url.pathname === currentUrl.pathname && url.search === currentUrl.search)) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      setPendingHref(url.href)
    }

    const handlePopState = (event: PopStateEvent) => {
      if (historyCleanupInProgressRef.current) {
        historyCleanupInProgressRef.current = false
        if (shouldBlockRef.current) armHistoryGuard()
        return
      }

      if (!shouldBlockRef.current || allowNextNavigationRef.current) return

      if (event.state?.[HISTORY_GUARD_KEY] === historyGuardIdRef.current) {
        historyGuardArmedRef.current = true
        return
      }

      historyGuardArmedRef.current = false
      const shouldLeave = window.confirm(UNSAVED_MESSAGE)
      if (shouldLeave) {
        allowNextNavigationRef.current = true
        window.history.back()
      } else {
        armHistoryGuard()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("popstate", handlePopState)
    document.addEventListener("click", handleDocumentClick, true)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
      document.removeEventListener("click", handleDocumentClick, true)

      const state = window.history.state
      if (state?.[HISTORY_GUARD_KEY] === historyGuardId) {
        const nextState = { ...state }
        delete nextState[HISTORY_GUARD_KEY]
        window.history.replaceState(nextState, "", window.location.href)
      }
    }
  }, [armHistoryGuard])

  const stay = useCallback(() => setPendingHref(null), [])

  const leave = useCallback(() => {
    if (!pendingHref) return
    allowNextNavigationRef.current = true
    const url = new URL(pendingHref, window.location.href)
    setPendingHref(null)
    historyGuardArmedRef.current = false

    if (url.origin === window.location.origin) {
      router.replace(`${url.pathname}${url.search}${url.hash}`)
    } else {
      window.location.replace(url.href)
    }
  }, [pendingHref, router])

  return {
    isNavigationConfirmationOpen: Boolean(pendingHref),
    stay,
    leave,
  }
}
