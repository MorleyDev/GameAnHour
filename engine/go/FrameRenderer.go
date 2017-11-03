package main

import (
	"image/color"
	"reflect"

	"github.com/faiface/pixel"
)

// FrameRendererEvents required for FrameRenderer to function
type FrameRendererEvents struct {
	frameIn  <-chan []interface{}
	frameOut chan<- []RenderingCommand
}

// FrameRenderer takes State and turns it into a Frame
type FrameRenderer struct {
	events FrameRendererEvents
}

// NewFrameRenderer create an instance of FrameRenderer
func NewFrameRenderer(events FrameRendererEvents) *FrameRenderer {
	return &FrameRenderer{events: events}
}

// Run the FrameRenderer, listening for State and producing Frames
func (r *FrameRenderer) Run() {
	for {
		frame := <-r.events.frameIn
		rendered := frameToRenderingCommands(frame)
		r.events.frameOut <- rendered
	}
}

func frameToRenderingCommands(frame []interface{}) []RenderingCommand {
	commands := make([]RenderingCommand, 0)
	if len(frame) == 0 {
		return commands
	}
	switch t := frame[0].(type) {
	case []interface{}:
		for _, elementRaw := range frame {
			commands = append(commands, frameToRenderingCommands(elementRaw.([]interface{}))...)
		}
		return commands
	case string:
		commands = append(commands, renderCommand(t, frame[1:]))
		return commands
	default:
		panic("unknown frame command")
	}
}

func renderCommand(command string, data []interface{}) RenderingCommand {
	switch command {
	case "clear":
		if len(data) == 0 {
			return RenderingCommand{command: Clear}
		}
		colour := mapToColour(data[0].(map[string]interface{}))
		return RenderingCommand{command: Clear, colour: colour}

	case "origin":
		translate := data[0].(map[string]interface{})
		translateX := extractFloat64(translate["x"])
		translateY := extractFloat64(translate["y"])
		frames := data[1].([]interface{})
		return RenderingCommand{command: Origin, location: pixel.V(translateX, translateY), children: frameToRenderingCommands(frames)}

	case "scale":
		scale := data[0].(map[string]interface{})
		scaleX := extractFloat64(scale["x"])
		scaleY := extractFloat64(scale["y"])
		frames := data[1].([]interface{})
		return RenderingCommand{command: Scale, location: pixel.V(scaleX, scaleY), children: frameToRenderingCommands(frames)}

	case "rotate":
		radians := extractFloat64(data[0])
		frames := data[1].([]interface{})
		return RenderingCommand{command: Rotate, angle: radians, children: frameToRenderingCommands(frames)}

	case "stroke":
	case "fill":
		colour := mapToColour(data[1].(map[string]interface{}))

		switch shape := data[0].(type) {
		case []interface{}:
			points := make([]pixel.Vec, len(shape))
			for index, point := range shape {
				p := point.(map[string]interface{})
				points[index] = pixel.V(extractFloat64(p["x"]), extractFloat64(p["y"]))
			}
			return RenderingCommand{command: DrawPolygon, points: points, colour: colour}

		case map[string]interface{}:
			x := extractFloat64(shape["x"])
			y := extractFloat64(shape["y"])

			colour := mapToColour(data[1].(map[string]interface{}))
			radius, okRadius := shape["radius"]
			if okRadius {
				r := extractFloat64(radius)
				return RenderingCommand{command: DrawCircle, location: pixel.V(x, y), colour: colour, radius: r}
			}

			width, okWidth := shape["width"]
			height, okHeight := shape["height"]
			if okWidth && okHeight {
				w := extractFloat64(width)
				h := extractFloat64(height)
				return RenderingCommand{command: DrawRectangle, location: pixel.V(x, y), colour: colour, width: w, height: h}
			}

			txt, okText := shape["text"]
			if okText {
				return RenderingCommand{command: DrawText, location: pixel.V(x, y), colour: colour, text: txt.(string)}
			}
			panic("cannot render images yet")
		default:
			panic("fill:unknown")
		}
	case "rendertarget":
		panic("rendertarget is not supported")

	default:
		panic("unknown command")
	}
	return RenderingCommand{}
}

func mapToColour(colour map[string]interface{}) color.RGBA {
	return color.RGBA{
		R: uint8(extractInt64(colour["r"])),
		G: uint8(extractInt64(colour["g"])),
		B: uint8(extractInt64(colour["b"])),
		A: uint8(extractFloat64(colour["a"]) * 255.0)}
}

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
