package main

import (
	"log"
	"time"

	"github.com/dop251/goja"
)

type jsTimeout struct {
	logic    goja.Callable
	runAfter time.Duration
}

type jsInterval struct {
	logic     goja.Callable
	nextRunIn time.Duration
	period    time.Duration
}

type jsEngineInputMouse struct {
	mouseDown goja.Callable
	mouseUp   goja.Callable
}

type JsEngine struct {
	runtime        *goja.Runtime
	timers         map[int64]*jsTimeout
	intervals      map[int64]*jsInterval
	animationFrame map[int64]goja.Callable
	nextTimeoutID  int64

	scheduled      []goja.Callable
	reducer        goja.Callable
	frameRenderer  goja.Callable
	renderer       goja.Callable
	bootstrap      goja.Callable
	latestState    goja.Value
	pendingActions []goja.Value

	input jsEngineInputMouse
}

func CreateEngine() *JsEngine {
	vm := goja.New()
	e := JsEngine{
		runtime:        vm,
		timers:         make(map[int64]*jsTimeout),
		intervals:      make(map[int64]*jsInterval),
		animationFrame: make(map[int64]goja.Callable),
		scheduled:      make([]goja.Callable, 0),
		pendingActions: make([]goja.Value, 0),
		input: jsEngineInputMouse{
			mouseDown: nil,
			mouseUp:   nil}}

	vm.Set("GoEngine_Log", e.consoleLog)

	vm.Set("GoEngine_GetNow", e.getNow)
	vm.Set("GoEngine_SetTimeout", e.setTimout)
	vm.Set("GoEngine_ClearTimeout", e.clearTimeout)
	vm.Set("GoEngine_SetInterval", e.setInterval)
	vm.Set("GoEngine_ClearInterval", e.clearInterval)
	vm.Set("GoEngine_RequestAnimationFrame", e.requestAnimationFrame)
	vm.Set("GoEngine_CancelAnimationFrame", e.cancelRequestAnimationFrame)

	vm.Set("GoEngine_PushState", func(call goja.FunctionCall) goja.Value {
		e.latestState = call.Argument(0)
		return nil
	})
	vm.Set("GoEngine_PushAction", func(call goja.FunctionCall) goja.Value {
		e.pendingActions = append(e.pendingActions, call.Argument(0))
		return nil
	})
	vm.Set("GoEngine_SetReducer", func(call goja.FunctionCall) goja.Value {
		reducer, ok := goja.AssertFunction(call.Argument(0))
		if !ok {
			panic("GoEngine_SetReducer not given function")
		}
		e.reducer = reducer
		return nil
	})
	vm.Set("GoEngine_SetFrameRenderer", func(call goja.FunctionCall) goja.Value {
		frameRenderer, ok := goja.AssertFunction(call.Argument(0))
		if !ok {
			panic("GoEngine_SetFrameRenderer not given function")
		}
		e.frameRenderer = frameRenderer
		return nil
	})
	vm.Set("GoEngine_SetBootstrap", func(call goja.FunctionCall) goja.Value {
		bootstrap, ok := goja.AssertFunction(call.Argument(0))
		if !ok {
			panic("GoEngine_SetFrameRenderer not given function")
		}
		e.bootstrap = bootstrap
		return nil
	})

	vm.Set("GoEngine_OnMouseDown", func(call goja.FunctionCall) goja.Value {
		mouseDown, ok := goja.AssertFunction(call.Argument(0))
		if !ok {
			panic("GoEngine_SetFrameRenderer not given function")
		}
		e.input.mouseDown = mouseDown
		return nil
	})
	vm.Set("GoEngine_OnMouseUp", func(call goja.FunctionCall) goja.Value {
		mouseUp, ok := goja.AssertFunction(call.Argument(0))
		if !ok {
			panic("GoEngine_SetFrameRenderer not given function")
		}
		e.input.mouseUp = mouseUp
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
		setInterval = function (callback, ms) {
			var rest = [].concat.apply([], arguments); rest.shift(); rest.shift()
			return GoEngine_SetInterval(ms || 0, function () { callback.apply(callback, rest); });
		};
		clearInterval = function (clear) {
			return GoEngine_ClearInterval(clear);
		};
		requestAnimationFrame = function (callback) {
			var rest = [].concat.apply([], arguments); rest.shift();
			return GoEngine_RequestAnimationFrame( function () { callback.apply(callback, rest) } );
		};
		cancelAnimationFrame = function (clear) {
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
	return &e
}

func (engine *JsEngine) RunString(str string) (goja.Value, error) {
	return engine.runtime.RunString(str)
}

func (engine *JsEngine) Bootstrap() {
	engine.bootstrap(nil)
}

func (engine *JsEngine) Tick(advance time.Duration) {
	if len(engine.timers) > 0 {
		completedTimers := make([]int64, 0)
		for k, v := range engine.timers {
			v.runAfter = v.runAfter - advance
			if v.runAfter <= 0 {
				engine.scheduled = append(engine.scheduled, v.logic)
				completedTimers = append(completedTimers, k)
			}
		}
		for _, timer := range completedTimers {
			delete(engine.timers, timer)
		}
	}
	if len(engine.intervals) > 0 {
		for _, v := range engine.intervals {
			v.nextRunIn = v.nextRunIn - advance
			if v.nextRunIn <= 0 {
				engine.scheduled = append(engine.scheduled, v.logic)
				v.nextRunIn = v.period + v.nextRunIn
			}
		}
	}
}

func (engine *JsEngine) Animate() {
	animationCount := len(engine.animationFrame)
	if animationCount == 0 {
		return
	}
	completedTimers := make([]int64, animationCount)
	index := 0
	for k, v := range engine.animationFrame {
		engine.scheduled = append(engine.scheduled, v)
		completedTimers[index] = k
		index = index + 1
	}
	for _, timer := range completedTimers {
		delete(engine.timers, timer)
	}
}

func (engine *JsEngine) FlushScheduled() {
	if len(engine.scheduled) == 0 {
		return
	}

	scheduled := engine.scheduled
	engine.scheduled = make([]goja.Callable, 0)
	for _, toRun := range scheduled {
		toRun(nil)
	}
}

func (engine *JsEngine) FlushActions() {
	if engine.latestState == nil || len(engine.pendingActions) == 0 {
		return
	}

	actions := engine.pendingActions
	engine.pendingActions = make([]goja.Value, 0)
	for _, action := range actions {
		state, err := engine.reducer(nil, engine.latestState, action)
		if err != nil {
			panic(err)
		}
		engine.latestState = state
	}
}

func (engine *JsEngine) getNow() int64 {
	return time.Now().Unix()
}

func (engine *JsEngine) setTimout(call goja.FunctionCall) goja.Value {
	timeout, ok := call.Argument(0).Export().(int64)
	if !ok {
		panic("First argument passed to GoEngine_SetTimeout was not a miliseconds number but was " + call.Argument(0).ToString().Export().(string))
	}
	fun, ok := goja.AssertFunction(call.Argument(1))
	if !ok {
		panic("Second argument passed to GoEngine_SetTimeout was not a callable action but was " + call.Argument(1).ToString().Export().(string))
	}

	id := engine.nextTimeoutID
	engine.timers[id] = &jsTimeout{
		logic:    fun,
		runAfter: time.Duration(timeout) * time.Millisecond}
	engine.nextTimeoutID = id + 1
	return engine.runtime.ToValue(id)
}

func (engine *JsEngine) clearTimeout(call goja.FunctionCall) goja.Value {
	delete(engine.timers, call.Argument(0).Export().(int64))
	return engine.runtime.ToValue(nil)
}

func (engine *JsEngine) setInterval(call goja.FunctionCall) goja.Value {
	timeout, ok := call.Argument(0).Export().(int64)
	if !ok {
		panic("First argument passed to GoEngine_SetInterval was not a miliseconds number but was " + call.Argument(0).ToString().Export().(string))
	}
	fun, ok := goja.AssertFunction(call.Argument(1))
	if !ok {
		panic("Second argument passed to GoEngine_SetInterval was not a callable action but was " + call.Argument(1).ToString().Export().(string))
	}

	id := engine.nextTimeoutID
	engine.intervals[id] = &jsInterval{
		logic:     fun,
		nextRunIn: (time.Duration(timeout) * time.Millisecond),
		period:    (time.Duration(timeout) * time.Millisecond)}
	engine.nextTimeoutID = id + 1
	return engine.runtime.ToValue(id)
}

func (engine *JsEngine) clearInterval(call goja.FunctionCall) goja.Value {
	delete(engine.intervals, call.Argument(0).Export().(int64))
	return engine.runtime.ToValue(nil)
}

func (engine *JsEngine) requestAnimationFrame(call goja.FunctionCall) goja.Value {
	fun, err := goja.AssertFunction(call.Argument(0))
	if err {
		panic("First argument passed to GoEngine_RequestAnimationFrame was not a callable action but was " + call.Argument(0).ToString().Export().(string))
	}
	id := engine.nextTimeoutID
	engine.animationFrame[id] = fun
	engine.nextTimeoutID = id + 1
	return engine.runtime.ToValue(id)
}

func (engine *JsEngine) cancelRequestAnimationFrame(call goja.FunctionCall) goja.Value {
	delete(engine.animationFrame, call.Argument(0).Export().(int64))
	return engine.runtime.ToValue(nil)
}

func (engine *JsEngine) consoleLog(call goja.FunctionCall) goja.Value {
	result := ""
	for _, value := range call.Arguments {
		result = result + (value.ToString().Export().(string)) + " "
	}
	log.Print(result)
	return engine.runtime.ToValue(nil)
}
