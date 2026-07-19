package app

import tea "github.com/charmbracelet/bubbletea"

// Init starts the tick loop.
func (m Model) Init() tea.Cmd {
	return tickCmd()
}

// Update handles all messages.
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.Width = msg.Width
		m.Height = msg.Height
		m.Ready = true
		return m, nil

	case tea.KeyMsg:
		return m.handleKey(msg)

	case TickMsg:
		return m, tickCmd()
	}

	// Delegate to focused pane
	return m.updateFocusedPane(msg)
}

func (m Model) handleKey(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "q", "ctrl+c":
		return m, tea.Quit

	case "1":
		m.FocusedPane = ChatPane
		return m, nil
	case "2":
		m.FocusedPane = BrandPane
		return m, nil
	case "3":
		m.FocusedPane = TimelinePane
		return m, nil

	case "tab":
		m.FocusedPane = (m.FocusedPane + 1) % 3
		return m, nil
	case "shift+tab":
		m.FocusedPane = (m.FocusedPane + 2) % 3
		return m, nil

	// Timeline filters (global)
	case "a":
		m.TimelinePane.Filter = "all"
		return m, nil
	case "c":
		m.TimelinePane.Filter = "claude"
		return m, nil
	case "x":
		m.TimelinePane.Filter = "codex"
		return m, nil
	case "g":
		m.TimelinePane.Filter = "gemini"
		return m, nil

	// Chat mode toggle
	case "f":
		if m.ChatPane.ViewMode == "focused" {
			m.ChatPane.ViewMode = "unified"
		} else {
			m.ChatPane.ViewMode = "focused"
		}
		return m, nil
	}

	return m.updateFocusedPane(msg)
}

func (m Model) updateFocusedPane(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch m.FocusedPane {
	case ChatPane:
		updated, cmd := m.ChatPane.Update(msg)
		m.ChatPane = updated
		return m, cmd
	case BrandPane:
		updated, cmd := m.BrandPane.Update(msg)
		m.BrandPane = updated
		return m, cmd
	case TimelinePane:
		updated, cmd := m.TimelinePane.Update(msg)
		m.TimelinePane = updated
		return m, cmd
	}
	return m, nil
}
