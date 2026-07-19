package app

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/lipgloss"
)

var (
	footerStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#555"))

	footerAccent = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#ff8c32"))
)

// View renders the three-pane layout.
func (m Model) View() string {
	if !m.Ready {
		return "Loading..."
	}

	contentHeight := m.Height - 2 // footer

	// Calculate pane widths: 30% / 40% / 30%
	chatWidth := m.Width * 30 / 100
	timelineWidth := m.Width * 30 / 100
	brandWidth := m.Width - chatWidth - timelineWidth

	// Render panes
	chat := m.ChatPane.View(chatWidth, contentHeight, m.FocusedPane == ChatPane)
	brand := m.BrandPane.View(brandWidth, contentHeight, m.FocusedPane == BrandPane)
	timeline := m.TimelinePane.View(timelineWidth, contentHeight, m.FocusedPane == TimelinePane)

	// Join horizontally
	content := lipgloss.JoinHorizontal(lipgloss.Top, chat, brand, timeline)

	// Footer
	footer := m.renderFooter()

	return lipgloss.JoinVertical(lipgloss.Left, content, footer)
}

func (m Model) renderFooter() string {
	paneNames := []string{"chat", "brand", "timeline"}
	focused := paneNames[m.FocusedPane]

	hints := []string{
		fmt.Sprintf("1:chat  2:brand  3:timeline"),
		fmt.Sprintf("a:all  c/x/g:filter"),
		fmt.Sprintf("f:mode  q:quit"),
	}

	left := footerAccent.Render(fmt.Sprintf(" Fragment [%s]", focused))
	right := footerStyle.Render(strings.Join(hints, "  "))

	gap := strings.Repeat(" ", max(0, m.Width-lipgloss.Width(left)-lipgloss.Width(right)))

	return left + gap + right
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
