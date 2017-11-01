package main

import (
	"io/ioutil"
	"time"
)

type GameEvents struct {
	endIn     <-chan interface{}
	endOut    chan<- interface{}
	framesOut chan<- interface{}
	input     InputReceiver
}

type InputReceiver struct {
	mouseDown <-chan ClickEvent
	mouseUp   <-chan ClickEvent
	mouseMove <-chan MouseEvent
}

func game(events GameEvents) {
	e := CreateEngine()
	data, err := ioutil.ReadFile("../dist/engine.js")
	if err != nil {
		panic(err)
	}
	src := string(data)

	_, runtimeError := e.RunString(src)
	if runtimeError != nil {
		panic(runtimeError)
	}

	e.Bootstrap()

	interval := time.Duration(1) * time.Millisecond
	tick := time.Tick(interval)
	animate := time.Tick(interval * 10)
	for {
		select {
		case down := <-events.input.mouseDown:
			if e.input.mouseDown != nil {
				e.input.mouseDown(nil, e.runtime.ToValue(down.position.X), e.runtime.ToValue(down.position.Y), e.runtime.ToValue(down.button))
			}
			break
		case up := <-events.input.mouseUp:
			if e.input.mouseUp != nil {
				e.input.mouseUp(nil, e.runtime.ToValue(up.position.X), e.runtime.ToValue(up.position.Y), e.runtime.ToValue(up.button))
			}
			break
		case <-tick:
			e.Tick(interval)
			e.Flush()
			break
		case <-animate:
			e.Animate()
			e.Flush()

			frame, err := e.frameRenderer(nil, e.latestState)
			if err != nil {
				panic(err)
			}

			events.framesOut <- frame.Export()
		case <-events.endIn:
			events.endOut <- 0
			return
		default:
			break
		}
	}
}

func main() {
	onGameEnd := make(chan interface{}, 1)
	onGraphicsEnd := make(chan interface{}, 1)
	onFrame := make(chan interface{}, 1)

	onMouseDown := make(chan ClickEvent, 1)
	onMouseUp := make(chan ClickEvent, 1)
	onMouseMove := make(chan MouseEvent, 1)

	gameEvents := GameEvents{
		endIn:     onGraphicsEnd,
		endOut:    onGameEnd,
		framesOut: onFrame,
		input: InputReceiver{
			mouseUp:   onMouseUp,
			mouseDown: onMouseDown,
			mouseMove: onMouseMove}}

	graphicsEvents := GraphicsEvents{
		endIn:    onGameEnd,
		endOut:   onGraphicsEnd,
		framesIn: onFrame,
		input: InputEmitter{
			mouseUp:   onMouseUp,
			mouseDown: onMouseDown,
			mouseMove: onMouseMove}}

	window := NewWindow(graphicsEvents)

	go game(gameEvents)
	window.Run()
}
