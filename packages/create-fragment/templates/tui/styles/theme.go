package styles

import "github.com/charmbracelet/lipgloss"

var (
	// Model colors
	ClaudeColor = lipgloss.Color("#ff8c32")
	CodexColor  = lipgloss.Color("#10b981")
	GeminiColor = lipgloss.Color("#3b82f6")

	// UI colors
	BgPrimary   = lipgloss.Color("#0a0a12")
	BgSecondary = lipgloss.Color("#12121e")
	BgTertiary  = lipgloss.Color("#1a1a2e")
	TextPrimary = lipgloss.Color("#e0e0e0")
	TextDim     = lipgloss.Color("#555")
	Border      = lipgloss.Color("#222")
	Accent      = lipgloss.Color("#ff8c32")
	Purple      = lipgloss.Color("#7c3aed")

	// Styles
	TitleStyle = lipgloss.NewStyle().
			Foreground(Accent).
			Bold(true)

	DimStyle = lipgloss.NewStyle().
			Foreground(TextDim)

	ActiveTabStyle = lipgloss.NewStyle().
			Foreground(Accent).
			Bold(true).
			Padding(0, 1)

	InactiveTabStyle = lipgloss.NewStyle().
				Foreground(TextDim).
				Padding(0, 1)
)

// ModelColor returns the color for a given model ID.
func ModelColor(model string) lipgloss.Color {
	switch model {
	case "claude":
		return ClaudeColor
	case "codex":
		return CodexColor
	case "gemini":
		return GeminiColor
	default:
		return TextDim
	}
}

// ModelLabel returns the display name for a model.
func ModelLabel(model string) string {
	switch model {
	case "claude":
		return "Claude"
	case "codex":
		return "Codex"
	case "gemini":
		return "Gemini"
	default:
		return model
	}
}
