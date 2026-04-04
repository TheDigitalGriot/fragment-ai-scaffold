package app

import (
	"time"

	tea "github.com/charmbracelet/bubbletea"
)

// TickMsg drives animations.
type TickMsg time.Time

// Pane identifies which pane is focused.
type Pane int

const (
	ChatPane Pane = iota
	BrandPane
	TimelinePane
)

// Model is the top-level Bubble Tea model.
type Model struct {
	ChatPane     ChatPaneModel
	BrandPane    BrandPaneModel
	TimelinePane TimelinePaneModel
	FocusedPane  Pane
	Width        int
	Height       int
	Ready        bool
}

// NewModel creates the initial app model.
func NewModel() Model {
	return Model{
		ChatPane:     NewChatPane(),
		BrandPane:    NewBrandPane(),
		TimelinePane: NewTimelinePane(),
		FocusedPane:  ChatPane,
	}
}

func tickCmd() tea.Cmd {
	return tea.Tick(100*time.Millisecond, func(t time.Time) tea.Msg {
		return TickMsg(t)
	})
}
