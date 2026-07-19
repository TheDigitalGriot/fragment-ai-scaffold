package styles

import "github.com/charmbracelet/lipgloss"

var (
	PanelStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(Border).
			Padding(0, 1)

	ActivePanelStyle = lipgloss.NewStyle().
				Border(lipgloss.RoundedBorder()).
				BorderForeground(Purple).
				Padding(0, 1)
)

// RenderPanel wraps content in a bordered panel.
func RenderPanel(content string, width, height int, active bool) string {
	style := PanelStyle
	if active {
		style = ActivePanelStyle
	}
	return style.Width(width - 2).Height(height - 2).Render(content)
}
