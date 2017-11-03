#ifndef DUKSFML_TIMEREXTENSIONS_HPP
#define DUKSFML_TIMEREXTENSIONS_HPP

#include "JavascriptEngine.hpp"

extern void attachTimers(JavascriptEngine& engine);
extern void tick(JavascriptEngine& engine, double ms);
extern void animate(JavascriptEngine& engine);

#endif //#define DUKSFML_TIMEREXTENSIONS_HPP
