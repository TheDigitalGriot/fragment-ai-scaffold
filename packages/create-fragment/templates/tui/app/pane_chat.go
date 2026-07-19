package app

import (
	"fmt"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// ChatPaneModel is the left pane — agentic chat.
type ChatPaneModel struct {
	ActiveModel string // "claude", "codex", "gemini"
	ViewMode    string // "focused", "unified"
	Messages    map[string][]ChatMsg
	Input       string
}

// ChatMsg represents a single chat message.
type ChatMsg struct {
	Model   string
	Role    string // "user" or "assistant"
	Content string
}

// NewChatPane creates the initial chat pane.
func NewChatPane() ChatPaneModel {
	return ChatPaneModel{
		ActiveModel: "claude",
		ViewMode:    "focused",
		Messages: map[string][]ChatMsg{
			"claude": {},
			"codex":  {},
			"gemini": {},
		},
	}
}

// Update handles chat-specific messages.
func (m ChatPaneModel) Update(msg tea.Msg) (ChatPaneModel, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "enter":
			if strings.TrimSpace(m.Input) != "" {
				m.Messages[m.ActiveModel] = append(m.Messages[m.ActiveModel], ChatMsg{
					Model: m.ActiveModel, Role: "user", Content: m.Input,
				})
				m.Input = ""
			}
		case "backspace":
			if len(m.Input) > 0 {
				m.Input = m.Input[:len(m.Input)-1]
			}
		default:
			if len(msg.String()) == 1 {
				m.Input += msg.String()
			}
		}
	}
	return m, nil
}

// View renders the chat pane.
func (m ChatPaneModel) View(width, height int, focused bool) string {
	modelColors := map[string]string{
		"claude": "#ff8c32",
		"codex":  "#10b981",
		"gemini": "#3b82f6",
	}
	modelLabels := map[string]string{
		"claude": "Claude",
		"codex":  "Codex",
		"gemini": "Gemini",
	}

	color := modelColors[m.ActiveModel]
	borderColor := lipgloss.Color("#222")
	if focused {
		borderColor = lipgloss.Color(color)
	}

	// Header
	header := lipgloss.NewStyle().
		Foreground(lipgloss.Color(color)).
		Bold(true).
		Render(fmt.Sprintf("[%s] %s", modelLabels[m.ActiveModel], m.ViewMode))

	// Messages
	msgs := m.Messages[m.ActiveModel]
	if m.ViewMode == "unified" {
		msgs = nil
		for _, model := range []string{"claude", "codex", "gemini"} {
			msgs = append(msgs, m.Messages[model]...)
		}
	}

	msgLines := make([]string, 0)
	for _, msg := range msgs {
		tag := ""
		if m.ViewMode == "unified" {
			tagColor := modelColors[msg.Model]
			tag = lipgloss.NewStyle().Foreground(lipgloss.Color(tagColor)).Render(
				fmt.Sprintf("[%s] ", modelLabels[msg.Model]),
			)
		}

		role := "You"
		if msg.Role == "assistant" {
			role = modelLabels[msg.Model]
		}
		prefix := lipgloss.NewStyle().Foreground(lipgloss.Color("#555")).Render(role + ": ")
		msgLines = append(msgLines, tag+prefix+msg.Content)
	}

	if len(msgLines) == 0 {
		msgLines = append(msgLines, lipgloss.NewStyle().Foreground(lipgloss.Color("#555")).
			Render("Start a conversation..."))
	}

	messagesStr := strings.Join(msgLines, "\n")

	// Input
	inputStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("#e0e0e0"))
	prompt := lipgloss.NewStyle().Foreground(lipgloss.Color(color)).Render("> ")
	inputLine := prompt + inputStyle.Render(m.Input+"_")

	// Compose
	content := header + "\n\n" + messagesStr + "\n\n" + inputLine

	return lipgloss.NewStyle().
		Width(width).
		Height(height).
		Border(lipgloss.RoundedBorder()).
		BorderForeground(borderColor).
		Padding(0, 1).
		Render(content)
}
