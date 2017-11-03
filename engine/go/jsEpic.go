package main

import (
	"io/ioutil"
	"time"

	"github.com/dop251/goja"
)

type InputReceiver struct {
	mouseDown <-chan ClickEvent
	mouseUp   <-chan ClickEvent
	mouseMove <-chan MouseEvent
}

type JsEpicEvents struct {
	input      InputReceiver
	actionsIn  <-chan interface{}
	actionsOut chan<- interface{}
}

type JsEpic struct {
	runtime *JsEngine
	events  JsEpicEvents

	onAction    goja.Callable
	onMouseDown goja.Callable
	onMouseUp   goja.Callable
}

func NewJsEpic(events JsEpicEvents) *JsEpic {
	runtime := CreateEngine()
	epic := JsEpic{runtime: runtime, events: events}
	runtime.AddFunc("GoEngine_PushAction", func(call goja.FunctionCall) goja.Value {
		action := call.Argument(0).Export()
		epic.events.actionsOut <- action
		return nil
	})
	runtime.AddFunc("GoEngine_OnAction", func(call goja.FunctionCall) goja.Value {
		callback, ok := goja.AssertFunction(call.Argument(0))
		if !ok {
			panic("Argument passed to GoEngine_OnAction was not a function")
		}
		epic.onAction = callback
		return nil
	})
	runtime.AddFunc("GoEngine_OnMouseDown", func(call goja.FunctionCall) goja.Value {
		callback, ok := goja.AssertFunction(call.Argument(0))
		if !ok {
			panic("Argument passed to GoEngine_OnMouseDown was not a function")
		}
		epic.onMouseDown = callback
		return nil
	})
	runtime.AddFunc("GoEngine_OnMouseUp", func(call goja.FunctionCall) goja.Value {
		callback, ok := goja.AssertFunction(call.Argument(0))
		if !ok {
			panic("Argument passed to GoEngine_OnMouseUp was not a function")
		}
		epic.onMouseUp = callback
		return nil
	})
	data, err := ioutil.ReadFile("../dist/engine/golang/epic.js")
	if err != nil {
		panic(err)
	}
	runtime.RunString(string(data))
	if epic.onAction == nil {
		panic("No action handler for actions")
	}
	return &epic
}

func (epic *JsEpic) Run() {
	logicInterval := time.Duration(5) * time.Millisecond
	logicTick := time.Tick(logicInterval)

	animationInterval := time.Duration(10) * time.Millisecond
	animationTick := time.Tick(animationInterval)
	for {
		select {
		case <-logicTick:
			epic.runtime.Tick(logicInterval)
			epic.runtime.FlushScheduled()
			break
		case <-animationTick:
			epic.runtime.Animate()
			epic.runtime.FlushScheduled()
			break
		case action := <-epic.events.actionsIn:
			epic.onAction(nil, epic.runtime.runtime.ToValue(action))
			break
		case m := <-epic.events.input.mouseDown:
			if epic.onMouseDown != nil {
				epic.onMouseDown(nil, epic.runtime.runtime.ToValue(m.position.X), epic.runtime.runtime.ToValue(m.position.Y), epic.runtime.runtime.ToValue(m.button))
			}
			break
		case m := <-epic.events.input.mouseUp:
			if epic.onMouseUp != nil {
				epic.onMouseUp(nil, epic.runtime.runtime.ToValue(m.position.X), epic.runtime.runtime.ToValue(m.position.Y), epic.runtime.runtime.ToValue(m.button))
			}
			break
		case <-epic.events.input.mouseMove:
			break
		}
	}

}
