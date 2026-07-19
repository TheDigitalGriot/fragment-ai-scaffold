package plugin

import "sync"

// Event is the interface for all bus events.
type Event interface {
	Type() string
}

// EventHandler processes an event.
type EventHandler func(Event)

// EventBus is a simple typed pub/sub system.
type EventBus struct {
	mu       sync.RWMutex
	handlers map[string][]EventHandler
}

// NewEventBus creates a new event bus.
func NewEventBus() *EventBus {
	return &EventBus{
		handlers: make(map[string][]EventHandler),
	}
}

// Subscribe registers a handler for an event type.
func (b *EventBus) Subscribe(eventType string, handler EventHandler) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.handlers[eventType] = append(b.handlers[eventType], handler)
}

// Publish sends an event to all subscribers of its type.
func (b *EventBus) Publish(event Event) {
	b.mu.RLock()
	defer b.mu.RUnlock()
	for _, handler := range b.handlers[event.Type()] {
		handler(event)
	}
}
