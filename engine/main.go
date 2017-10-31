package main

import (
	"image/color"
	"io/ioutil"
	"reflect"
	"time"

	"github.com/faiface/pixel"
	"github.com/faiface/pixel/imdraw"
	"github.com/faiface/pixel/pixelgl"
	"golang.org/x/image/colornames"
)

func extractFloat64(value interface{}) float64 {
	switch c := value.(type) {
	case int64:
		return float64(c)
	case float64:
		return c
	default:
		panic("Value was not int64 or float64 but was " + reflect.TypeOf(c).String())
	}
}
func extractInt64(value interface{}) int64 {
	switch c := value.(type) {
	case int64:
		return c
	case float64:
		return int64(c)
	default:
		panic("Value was not int64 or float64 but was " + reflect.TypeOf(c).String())
	}
}

func mapToColour(colour map[string]interface{}) color.RGBA {
	return color.RGBA{uint8(extractInt64(colour["r"])), uint8(extractInt64(colour["g"])), uint8(extractInt64(colour["b"])), uint8(extractFloat64(colour["a"]) / 255.0)}
}

func renderCommand(window *pixelgl.Window, command string, data []interface{}) {
	switch command {
	case "clear":
		if len(data) == 0 {
			window.Clear(colornames.Black)
		} else {
			colour := mapToColour(data[0].(map[string]interface{}))
			window.Clear(colour)
		}
		return
	case "stroke":
	case "fill":
		imd := imdraw.New(nil)
		colour := mapToColour(data[1].(map[string]interface{}))
		switch shape := data[0].(type) {
		case []map[string]float64:
			for _, point := range shape {
				imd.Color = colour
				imd.Push(pixel.V(point["x"], point["y"]))
			}
			imd.Polygon(0)
			break
		case map[string]interface{}:
			break
		}
		imd.Draw(window)
		return
	case "rendertarget":
		return
	}
}

func renderFrame(window *pixelgl.Window, frame []interface{}) {
	if len(frame) == 0 {
		return
	}
	switch t := frame[0].(type) {
	case []interface{}:
		for _, elementRaw := range frame {
			renderFrame(window, elementRaw.([]interface{}))
		}
		return
	case string:
		renderCommand(window, t, frame[1:])
		return
	default:
		return
	}
}

func run(frames chan interface{}) func() {
	return func() {
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

		cfg := pixelgl.WindowConfig{Title: "Pixel Rocks!", Bounds: pixel.R(0, 0, 512, 512), VSync: true}
		win, err := pixelgl.NewWindow(cfg)
		if err != nil {
			panic(err)
		}

		for !win.Closed() {
			frameRaw := <-frames
			renderFrame(win, frameRaw.([]interface{}))
			win.Update()
		}
	}
}

func game(frames chan interface{}) {
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
	for range time.Tick(interval) {
		e.Tick(interval)
		e.Animate()
		e.Flush()

		frame, err := e.frameRenderer(nil, e.latestState)
		if err != nil {
			panic(err)
		}

		trueFrame := frame.Export()
		frames <- trueFrame
	}
}

func main() {
	frames := make(chan interface{})
	go game(frames)

	pixelgl.Run(run(frames))
}
