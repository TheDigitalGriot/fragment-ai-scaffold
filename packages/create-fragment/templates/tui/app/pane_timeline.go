package app

import (
	"fmt"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// ToolEntry represents a tool call in the timeline.
type ToolEntry struct {
	Model     string
	Tool      string
	Target    string
	Timestamp string
	Status    string // "running", "complete", "error"
}

// TimelinePaneModel is the right pane — tool timeline.
type TimelinePaneModel struct {
	Filter  string // "all", "claude", "codex", "gemini"
	Entries []ToolEntry
}

// NewTimelinePane creates the timeline pane.
func NewTimelinePane() TimelinePaneModel {
	return TimelinePaneModel{
		Filter:  "all",
		Entries: []ToolEntry{},
	}
}

// Update handles timeline messages.
func (m TimelinePaneModel) Update(msg tea.Msg) (TimelinePaneModel, tea.Cmd) {
	return m, nil
}

// View renders the tool timeline.
func (m TimelinePaneModel) View(width, height int, focused bool) string {
	modelColors := map[string]string{
		"claude": "#ff8c32",
		"codex":  "#10b981",
		"gemini": "#3b82f6",
	}

	borderColor := lipgloss.Color("#222")
	if focused {
		borderColor = lipgloss.Color("#3b82f6")
	}

	// Header with filter
	filters := []struct {
		key   string
		label string
	}{
		{"all", "All"},
		{"claude", "Claude"},
		{"codex", "Codex"},
		{"gemini", "Gemini"},
	}

	filterParts := make([]string, 0)
	for _, f := range filters {
		style := lipgloss.NewStyle().Foreground(lipgloss.Color("#555"))
		if f.key == m.Filter {
			color := "#fff"
			if c, ok := modelColors[f.key]; ok {
				color = c
			}
			style = lipgloss.NewStyle().Foreground(lipgloss.Color(color)).Bold(true)
		}
		filterParts = append(filterParts, style.Render(f.label))
	}

	header := lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("#888")).
		Render("Tool Timeline") + "\n" + strings.Join(filterParts, " ")

	// Entries
	visible := m.Entries
	if m.Filter != "all" {
		filtered := make([]ToolEntry, 0)
		for _, e := range m.Entries {
			if e.Model == m.Filter {
				filtered = append(filtered, e)
			}
		}
		visible = filtered
	}

	entryLines := make([]string, 0)
	for _, e := range visible {
		color := modelColors[e.Model]
		tag := lipgloss.NewStyle().Foreground(lipgloss.Color(color)).
			Render(fmt.Sprintf("%-7s", e.Model))
		tool := lipgloss.NewStyle().Foreground(lipgloss.Color(color)).
			Render(e.Tool)
		target := lipgloss.NewStyle().Foreground(lipgloss.Color("#888")).
			Render(e.Target)
		ts := lipgloss.NewStyle().Foreground(lipgloss.Color("#555")).
			Render(e.Timestamp)

		entryLines = append(entryLines, fmt.Sprintf("%s %s %s %s", ts, tag, tool, target))
	}

	if len(entryLines) == 0 {
		entryLines = append(entryLines, lipgloss.NewStyle().
			Foreground(lipgloss.Color("#555")).Render("No tool calls yet"))
	}

	content := header + "\n\n" + strings.Join(entryLines, "\n")

	return lipgloss.NewStyle().
		Width(width).
		Height(height).
		Border(lipgloss.RoundedBorder()).
		BorderForeground(borderColor).
		Padding(0, 1).
		Render(content)
}
