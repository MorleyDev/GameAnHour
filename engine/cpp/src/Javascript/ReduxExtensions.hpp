#ifndef DUKSFML_REDUXEXTENSIONS_HPP
#define DUKSFML_REDUXEXTENSIONS_HPP

#include "JavascriptEngine.hpp"

struct Redux {
    std::string stateJson = "{}";
    std::vector<std::string> actionQueue;
};

void attachRedux(JavascriptEngine &engine, Redux &redux);

#endif //DUKSFML_REDUXEXTENSIONS_HPP
