package app

import (
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// BrandPaneModel is the center pane — Fragment branding.
type BrandPaneModel struct{}

// NewBrandPane creates the branding pane.
func NewBrandPane() BrandPaneModel {
	return BrandPaneModel{}
}

// Update handles brand pane messages (mostly no-op).
func (m BrandPaneModel) Update(msg tea.Msg) (BrandPaneModel, tea.Cmd) {
	return m, nil
}

// View renders the Fragment branding.
func (m BrandPaneModel) View(width, height int, focused bool) string {
	borderColor := lipgloss.Color("#222")
	if focused {
		borderColor = lipgloss.Color("#7c3aed")
	}

	// ASCII logo
	logo := lipgloss.NewStyle().
		Foreground(lipgloss.Color("#ff8c32")).
		Bold(true).
		Render("  FRAGMENT")

	tagline := lipgloss.NewStyle().
		Foreground(lipgloss.Color("#555")).
		Render("  Taming the fragmented\n  agentic ecosystem")

	version := lipgloss.NewStyle().
		Foreground(lipgloss.Color("#555")).
		Render("  v0.0.1")

	// Connection dots
	models := []struct {
		name  string
		color string
	}{
		{"Claude", "#ff8c32"},
		{"Codex", "#10b981"},
		{"Gemini", "#3b82f6"},
	}

	dots := make([]string, 0)
	for _, m := range models {
		dot := lipgloss.NewStyle().Foreground(lipgloss.Color(m.color)).Render("●")
		label := lipgloss.NewStyle().Foreground(lipgloss.Color(m.color)).Render(m.name)
		dots = append(dots, "  "+dot+" "+label)
	}
	connections := strings.Join(dots, "\n")

	// Center vertically
	contentLines := strings.Split(logo+"\n\n"+tagline+"\n\n"+version+"\n\n"+connections, "\n")
	totalLines := len(contentLines)
	topPad := (height - totalLines) / 2
	if topPad < 0 {
		topPad = 0
	}

	padded := strings.Repeat("\n", topPad) + strings.Join(contentLines, "\n")

	return lipgloss.NewStyle().
		Width(width).
		Height(height).
		Border(lipgloss.RoundedBorder()).
		BorderForeground(borderColor).
		Padding(0, 1).
		Render(padded)
}
