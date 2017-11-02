package main

import (
	"io/ioutil"

	"github.com/dop251/goja"
)

// JsFrameRendererEvents required for JsFrameRenderer to function
type JsFrameRendererEvents struct {
	frameIn  <-chan interface{}
	frameOut chan<- []interface{}
}

// JsFrameRenderer takes State and turns it into a Frame
type JsFrameRenderer struct {
	runtime *JsEngine
	render  goja.Callable
	events  JsFrameRendererEvents
}

// NewJsFrameRenderer create an instance of JsFrameRenderer
func NewJsFrameRenderer(events JsFrameRendererEvents) *JsFrameRenderer {
	e := CreateEngine()
	fr := JsFrameRenderer{runtime: e, events: events}
	e.AddFunc("GoEngine_SetFrameRender", func(call goja.FunctionCall) goja.Value {

		renderer, ok := goja.AssertFunction(call.Argument(0))
		if !ok {
			panic("Function not passed to GoEngine_SetFrameRender")
		}
		fr.render = renderer
		return nil
	})
	data, err := ioutil.ReadFile("../dist/engine/golang/render.js")
	if err != nil {
		panic(err)
	}
	e.RunString(string(data))
	if fr.render == nil {
		panic("No frame renderer provided when initialising reducer")
	}

	return &fr
}

// Run the JsFrameRenderer, listening for State and producing Frames
func (r *JsFrameRenderer) Run() {
	for {
		frame := <-r.events.frameIn

		rendered, err := r.render(r.runtime.runtime.ToValue(frame))
		if err != nil {
			panic(err)
		}
		r.events.frameOut <- rendered.Export().([]interface{})
	}
}
