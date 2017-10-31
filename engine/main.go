package main

import (
	"io/ioutil"
	"time"
)

type GameEvents struct {
	endIn     <-chan interface{}
	endOut    chan<- interface{}
	framesOut chan<- interface{}
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
	frameTimer := 0
	for range time.Tick(interval) {
		select {
		case <-events.endIn:
			events.endOut <- 0
			return
		default:
			e.Tick(interval)
			if frameTimer == 10 {
				e.Animate()
			}
			e.Flush()

			if frameTimer == 10 {
				frame, err := e.frameRenderer(nil, e.latestState)
				if err != nil {
					panic(err)
				}

				events.framesOut <- frame.Export()
				frameTimer = 0
			} else {
				frameTimer = frameTimer + 1
			}

		}
	}
}

type InputReceiver struct {
	mouseDown <-chan ClickEvent
	mouseUp   <-chan ClickEvent
	mouseMove <-chan MouseEvent
}

func main() {
	onGameEnd := make(chan interface{}, 1)
	onGraphicsEnd := make(chan interface{}, 1)
	onFrame := make(chan interface{}, 60)

	onMouseDown := make(chan ClickEvent, 1)
	onMouseUp := make(chan ClickEvent, 1)
	onMouseMove := make(chan MouseEvent, 1)

	gameEvents := GameEvents{
		endIn:     onGraphicsEnd,
		endOut:    onGameEnd,
		framesOut: onFrame}

	graphicsEvents := GraphicsEvents{
		endIn:    onGameEnd,
		endOut:   onGraphicsEnd,
		framesIn: onFrame,
		input: InputEmitter{
			mouseUp:   onMouseUp,
			mouseDown: onMouseDown,
			mouseMove: onMouseMove}}

	go game(gameEvents)
	Graphics(graphicsEvents)
}
