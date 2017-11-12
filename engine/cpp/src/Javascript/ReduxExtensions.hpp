#ifndef DUKSFML_REDUXEXTENSIONS_HPP
#define DUKSFML_REDUXEXTENSIONS_HPP

#include "JavascriptEngine.hpp"
#include <string>
#include <vector>

struct Redux {
	std::string stateJson = "{}";
	std::vector<std::string> actionQueue;
};

extern void attachRedux(JavascriptEngine &engine, Redux &redux);

#endif //DUKSFML_REDUXEXTENSIONS_HPP
