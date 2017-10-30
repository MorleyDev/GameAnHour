package main

import (
	"io/ioutil"
	"log"
	"time"

	"github.com/dop251/goja"
)

type jsTimeout struct {
	logic func()
	runAt time.Time
}

type jsEngine struct {
	runtime        *goja.Runtime
	timers         map[int64]*jsTimeout
	animationFrame map[int64]func()
	nextTimeoutID  int64

	reducer       goja.Callable
	frameRenderer goja.Callable
	renderer      goja.Callable
	latestState   goja.Value
}

func (engine *jsEngine) getNow() int64 {
	return time.Now().Unix()
}

func (engine *jsEngine) setTimout(call goja.FunctionCall) goja.Value {
	timeout, ok := call.Argument(0).Export().(int64)
	if !ok {
		panic("First argument passed to GoEngine_SetTimeout was not a miliseconds number but was " + call.Argument(0).ToString().Export().(string))
	}
	fun, ok := goja.AssertFunction(call.Argument(1))
	if !ok {
		panic("Second argument passed to GoEngine_SetTimeout was not a callable action but was " + call.Argument(1).ToString().Export().(string))
	}
	invoke := func() { fun(nil) }
	engine.timers[engine.nextTimeoutID] = &jsTimeout{logic: invoke, runAt: time.Now().Add(time.Duration(timeout) * time.Millisecond)}
	engine.nextTimeoutID = engine.nextTimeoutID + 1
	return engine.runtime.ToValue(0)
}

func (engine *jsEngine) clearTimeout(call goja.FunctionCall) goja.Value {
	delete(engine.timers, call.Argument(0).Export().(int64))
	return engine.runtime.ToValue(nil)
}

func (engine *jsEngine) requestAnimationFrame(call goja.FunctionCall) goja.Value {
	fun, err := goja.AssertFunction(call.Argument(0))
	if err {
		panic("First argument passed to GoEngine_RequestAnimationFrame was not a callable action but was " + call.Argument(0).ToString().Export().(string))
	}
	invoke := func() { fun(nil) }
	engine.animationFrame[engine.nextTimeoutID] = invoke
	engine.nextTimeoutID = engine.nextTimeoutID + 1
	return engine.runtime.ToValue(0)
}

func (engine *jsEngine) cancelRequestAnimationFrame(call goja.FunctionCall) goja.Value {
	delete(engine.animationFrame, call.Argument(0).Export().(int64))
	return engine.runtime.ToValue(nil)
}

func (engine *jsEngine) consoleLog(call goja.FunctionCall) goja.Value {
	result := ""
	for _, value := range call.Arguments {
		result = result + (value.ToString().Export().(string)) + " "
	}
	log.Print(result)
	return engine.runtime.ToValue(nil)
}

func main() {
	vm := goja.New()
	e := jsEngine{runtime: vm, timers: make(map[int64]*jsTimeout), animationFrame: make(map[int64]func())}
	vm.Set("GoEngine_GetNow", e.getNow)
	vm.Set("GoEngine_Log", e.consoleLog)

	vm.Set("GoEngine_SetTimeout", e.setTimout)
	vm.Set("GoEngine_ClearTimeout", e.clearTimeout)
	vm.Set("GoEngine_RequestAnimationFrame", e.requestAnimationFrame)
	vm.Set("GoEngine_CancelAnimationFrame", e.cancelRequestAnimationFrame)

	vm.Set("GoEngine_PushState", func(call goja.FunctionCall) goja.Value {
		println("GoEngine_PushState")
		e.latestState = call.Argument(0)
		return nil
	})
	vm.Set("GoEngine_PushAction", func(call goja.FunctionCall) goja.Value {
		println("GoEngine_PushAction")
		e.reducer(nil, e.latestState, call.Argument(0))
		return nil
	})
	vm.Set("GoEngine_SetReducer", func(call goja.FunctionCall) goja.Value {
		println("GoEngine_SetReducer")
		reducer, ok := goja.AssertFunction(call.Argument(0))
		if !ok {
			panic("GoEngine_SetReducer not given function")
		}
		e.reducer = reducer
		return nil
	})
	vm.Set("GoEngine_SetFrameRenderer", func(call goja.FunctionCall) goja.Value {
		println("GoEngine_SetFrameRenderer")
		frameRenderer, ok := goja.AssertFunction(call.Argument(0))
		if !ok {
			panic("GoEngine_SetFrameRenderer not given function")
		}
		e.frameRenderer = frameRenderer
		return nil
	})
	vm.Set("GoEngine_SetRenderer", func(call goja.FunctionCall) goja.Value {
		println("GoEngine_SetRenderer")
		e.renderer, _ = goja.AssertFunction(call.Argument(0))
		return nil
	})

	_, err := vm.RunString(`
		setTimeout = function (callback, ms) {
			var rest = [].concat.apply([], arguments); rest.shift(); rest.shift()
			return GoEngine_SetTimeout(ms || 0, function () { callback.apply(callback, rest); });
		};
		clearTimeout = function (clear) {
			return GoEngine_ClearTimeout(clear);
		};
		requestAnimationFrame = function (callback) {
			var rest = [].concat.apply([], arguments); rest.shift();
			return GoEngine_RequestAnimationFrame( function () { callback.apply(callback, rest) } );
		};
		cancelAnimationFrame = function (clear) {
			console.log("cancelAnimationFrame", clear);
			return GoEngine_CancelAnimationFrame( clear );
		};

		HTMLElement = function () { };
		console = {
			debug: function () { GoEngine_Log.apply(null, arguments); },
			log: function () { GoEngine_Log.apply(null, arguments); },
			warn: function () { GoEngine_Log.apply(null, arguments); },
			error: function () { GoEngine_Log.apply(null, arguments); }
		};
	`)
	if err != nil {
		panic(err)
	}

	data, err := ioutil.ReadFile("../dist/engine.js")
	if err != nil {
		panic(err)
	}
	src := string(data)

	//src := `
	//	setTimeout(function (x) { console.log(x) }, 1000, 'Hello World')
	//`

	_, runtimeError := vm.RunString(src)
	if runtimeError != nil {
		panic(runtimeError)
	}

	interval := time.Duration(10) * time.Millisecond
	for range time.Tick(interval) {

		now := time.Now()
		if len(e.timers) > 0 {
			println("Pending Timers: ", len(e.timers))
			completedTimers := make([]int64, 0)
			for k, v := range e.timers {
				if v.runAt.Unix() <= now.Unix() {
					v.logic()
					completedTimers = append(completedTimers, k)
				}
			}
			println("Ran Timers: ", len(completedTimers))
			for _, timer := range completedTimers {
				delete(e.timers, timer)
			}
		}

		if len(e.animationFrame) > 0 {
			println("Pending Animations: ", len(e.animationFrame))
			for _, v := range e.animationFrame {
				v()
			}
			e.animationFrame = make(map[int64]func())
		}

		frame, err := e.frameRenderer(nil, e.latestState)
		if err != nil {
			panic(err)
		}

		_, err = e.renderer(nil, frame)
		if err != nil {
			panic(err)
		}
	}
}
