package main

import (
	"io/ioutil"

	"github.com/dop251/goja"
)

// JsBootstrapEvents required for JsBootstrap to function
type JsBootstrapEvents struct {
	actionsOut      chan<- interface{}
	initialStateOut chan<- interface{}
}

type JsBootstrap struct {
	runtime *JsEngine
	events  JsBootstrapEvents
}

// NewJsBootstrap create an instance of JsBootstrap
func NewJsBootstrap(events JsBootstrapEvents) *JsBootstrap {
	e := CreateEngine()
	e.AddFunc("GoEngine_PushAction", func(call goja.FunctionCall) goja.Value {
		action := call.Argument(0).Export()
		events.actionsOut <- action
		return nil
	})
	e.AddFunc("GoEngine_PushState", func(call goja.FunctionCall) goja.Value {
		initialState := call.Argument(0).Export()
		events.initialStateOut <- initialState
		return nil
	})
	return &JsBootstrap{events: events, runtime: e}
}

func (e *JsBootstrap) Run() {
	data, err := ioutil.ReadFile("../dist/engine/golang/bootstrap.js")
	if err != nil {
		panic(err)
	}
	e.runtime.RunString(string(data))
}
