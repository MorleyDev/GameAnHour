package main

import (
	"io/ioutil"
	"time"

	"github.com/dop251/goja"
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

	interval := time.Duration(5) * time.Millisecond
	tick := time.Tick(interval)
	animate := time.Tick(time.Duration(8) * time.Millisecond)
	ticksPerSecond := 0

	second := time.Tick(1 * time.Second)
	var previousState goja.Value
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
		case <-second:
			println("tps:", ticksPerSecond)
			ticksPerSecond = 0
			break
		case <-tick:
			ticksPerSecond = ticksPerSecond + 1
			e.Tick(interval)
			e.FlushScheduled()
			e.FlushActions()
			break
		case <-animate:
			if e.latestState != previousState {
				e.Animate()
				e.FlushScheduled()

				frame, err := e.frameRenderer(nil, e.latestState)
				if err != nil {
					panic(err)
				}
				events.framesOut <- frame.Export()
				previousState = e.latestState
			}
			break

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

	onMouseDown := make(chan ClickEvent, 10)
	onMouseUp := make(chan ClickEvent, 10)
	onMouseMove := make(chan MouseEvent, 100)

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
