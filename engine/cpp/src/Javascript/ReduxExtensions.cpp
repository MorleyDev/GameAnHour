//
// Created by Jason Morley on 07/11/2017.
//

#include "ReduxExtensions.hpp"
#include <iostream>

void attachRedux(JavascriptEngine &engine, Redux& redux) {
	engine.setGlobalFunction("REDUX_SetState", [&redux](JavascriptEngine* engine) {
		redux.stateJson = engine->getargstr(0);
		return false;
	}, 1);
	engine.setGlobalFunction("REDUX_SendAction", [&redux](JavascriptEngine* engine) {
		std::string value(engine->getargstr(0));
		redux.actionQueue.push_back(value);
		return false;
	}, 1);
	engine.setGlobalFunction("REDUX_ReceiveAction", [&redux](JavascriptEngine* engine) {
		if (redux.actionQueue.empty()) {
			engine->pushUndefined();
			return true;
		}
		else {
			auto value = std::move(redux.actionQueue.back());
			engine->push(value);
			redux.actionQueue.pop_back();
			return true;
		}
	}, 0);
	engine.setGlobalFunction("REDUX_GetState", [&redux](JavascriptEngine* engine) {
		engine->push(redux.stateJson);
		return true;
	}, 0);
}
