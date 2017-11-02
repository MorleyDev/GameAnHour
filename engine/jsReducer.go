package main

import (
	"io/ioutil"

	"github.com/dop251/goja"
)

type JsReducerEvents struct {
	actionIn <-chan interface{}

	initialStateIn <-chan interface{}
	stateOut       chan<- interface{}
	actionOut      chan<- interface{}
}

type JsReducer struct {
	runtime     *JsEngine
	reducer     goja.Callable
	latestState interface{}

	events JsReducerEvents
}

func NewJsReducer(events JsReducerEvents) *JsReducer {
	e := CreateEngine()
	r := JsReducer{runtime: e, events: events}
	e.AddFunc("GoEngine_PushAction", func(call goja.FunctionCall) goja.Value {
		action := call.Argument(0).Export()
		r.events.actionOut <- action
		return nil
	})
	e.AddFunc("GoEngine_SetReducer", func(call goja.FunctionCall) goja.Value {
		reducer, ok := goja.AssertFunction(call.Argument(0))
		if !ok {
			panic("Function not passed to GoEngine_SetReducer")
		}
		r.reducer = reducer
		return nil
	})
	data, err := ioutil.ReadFile("../dist/engine/golang/reducer.js")
	if err != nil {
		panic(err)
	}
	e.RunString(string(data))
	if r.reducer == nil {
		panic("No reducer provided when initialising reducer")
	}
	return &r
}

func (r *JsReducer) Run() {
	latestState := <-r.events.initialStateIn
	for {
		action := <-r.events.actionIn

		s, err := r.reducer(nil, r.runtime.runtime.ToValue(latestState), r.runtime.runtime.ToValue(action))
		if err != nil {
			panic(err)
		}
		latestState = s.Export()
	}
}
