package plugin

import tea "github.com/charmbracelet/bubbletea"

// Registry manages all registered plugins.
type Registry struct {
	plugins []Plugin
	byID    map[string]Plugin
	active  int
	context *Context
}

// NewRegistry creates an empty plugin registry.
func NewRegistry(ctx *Context) *Registry {
	return &Registry{
		plugins: make([]Plugin, 0),
		byID:    make(map[string]Plugin),
		context: ctx,
	}
}

// Register adds a plugin and initializes it.
func (r *Registry) Register(p Plugin) error {
	if err := p.Init(r.context); err != nil {
		return err
	}
	r.plugins = append(r.plugins, p)
	r.byID[p.ID()] = p
	return nil
}

// Active returns the currently active plugin.
func (r *Registry) Active() Plugin {
	if r.active < len(r.plugins) {
		return r.plugins[r.active]
	}
	return nil
}

// SetActive switches to the plugin at the given index.
func (r *Registry) SetActive(idx int) {
	if idx < 0 || idx >= len(r.plugins) {
		return
	}
	if old := r.Active(); old != nil {
		old.SetFocused(false)
	}
	r.active = idx
	if p := r.Active(); p != nil {
		p.SetFocused(true)
	}
}

// ActiveIndex returns the current active index.
func (r *Registry) ActiveIndex() int {
	return r.active
}

// Plugins returns all registered plugins.
func (r *Registry) Plugins() []Plugin {
	return r.plugins
}

// Broadcast sends a message to all plugins, collecting commands.
func (r *Registry) Broadcast(msg tea.Msg) []tea.Cmd {
	var cmds []tea.Cmd
	for i, p := range r.plugins {
		updated, cmd := p.Update(msg)
		r.plugins[i] = updated
		if cmd != nil {
			cmds = append(cmds, cmd)
		}
	}
	return cmds
}
