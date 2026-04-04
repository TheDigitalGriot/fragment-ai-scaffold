package plugin

import tea "github.com/charmbracelet/bubbletea"

// KeyHint represents a keyboard shortcut hint shown in the footer.
type KeyHint struct {
	Key  string
	Help string
}

// Plugin defines the interface for extensible tabs (used by /fragment-connect).
type Plugin interface {
	ID() string
	Name() string
	Icon() string
	Init(ctx *Context) error
	Start() tea.Cmd
	Stop()
	Update(msg tea.Msg) (Plugin, tea.Cmd)
	View(width, height int) string
	IsFocused() bool
	SetFocused(focused bool)
	KeyHints() []KeyHint
}
