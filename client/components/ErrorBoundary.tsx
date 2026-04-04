"use client";
import { Component, ReactNode } from "react";

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: "#0f0f0f", minHeight: "100vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", color: "#fff",
        }}>
          <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Something went wrong</p>
          <p style={{ fontSize: 13, color: "#555", marginBottom: 24 }}>Try refreshing the page</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "9px 20px", background: "#fff", color: "#000",
              border: "none", borderRadius: 8, fontSize: 13,
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}