package main

import "sync"

func main() {
	onGameEnd := make(chan interface{}, 1)
	onGraphicsEnd := make(chan interface{}, 1)

	onRenderingCommand := make(chan []RenderingCommand, 60)

	onGameState := make(chan interface{}, 60)
	onInitialState := make(chan interface{}, 1)

	onPostStateAction := make(chan interface{}, 1)
	onBootstrapAction := make(chan interface{}, 1)
	onEpicAction := make(chan interface{}, 1)

	onFrame := make(chan []interface{}, 60)

	onMouseDown := make(chan ClickEvent, 10)
	onMouseUp := make(chan ClickEvent, 10)
	onMouseMove := make(chan MouseEvent, 100)

	graphicsEvents := GraphicsEvents{
		endIn:               onGameEnd,
		endOut:              onGraphicsEnd,
		renderingCommandsIn: onRenderingCommand,
		input: InputEmitter{
			mouseUp:   onMouseUp,
			mouseDown: onMouseDown,
			mouseMove: onMouseMove}}

	jsRenderToFrame := NewJsFrameRenderer(JsFrameRendererEvents{frameIn: onGameState, frameOut: onFrame})
	jsRenderToCommands := NewFrameRenderer(FrameRendererEvents{frameIn: onFrame, frameOut: onRenderingCommand})
	jsReducer := NewJsReducer(JsReducerEvents{initialStateIn: onInitialState, actionIn: merge(onEpicAction, onBootstrapAction), actionOut: onPostStateAction})
	jsEpic := NewJsEpic(JsEpicEvents{actionsIn: onPostStateAction, actionsOut: onEpicAction, input: InputReceiver{
		mouseDown: onMouseDown,
		mouseUp:   onMouseUp,
		mouseMove: onMouseMove}})
	jsBootstrap := NewJsBootstrap(JsBootstrapEvents{actionsOut: onBootstrapAction, initialStateOut: onInitialState})
	window := NewWindow(graphicsEvents)

	go jsRenderToFrame.Run()
	go jsRenderToCommands.Run()
	go jsReducer.Run()
	go jsEpic.Run()
	go jsBootstrap.Run()
	window.Run()
}

func merge(ch ...<-chan interface{}) <-chan interface{} {
	var wg sync.WaitGroup
	out := make(chan interface{})

	// Start an output goroutine for each input channel in cs.  output
	// copies values from c to out until c is closed, then calls wg.Done.
	output := func(c <-chan interface{}) {
		for n := range c {
			out <- n
		}
		wg.Done()
	}
	wg.Add(2)
	for _, c := range ch {
		go output(c)
	}

	// Start a goroutine to close out once all the output goroutines are
	// done.  This must start after the wg.Add call.
	go func() {
		wg.Wait()
		close(out)
	}()
	return out
}
