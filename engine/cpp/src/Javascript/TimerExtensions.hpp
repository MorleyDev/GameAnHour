#ifndef DUKSFML_TIMEREXTENSIONS_HPP
#define DUKSFML_TIMEREXTENSIONS_HPP

#include "DukJavascriptEngine.hpp"

#ifdef GAM_CHAKRA_ENABLE
#include "ChakraJavascriptEngine.hpp"

extern void attachTimers(ChakraJavascriptEngine& engine);
extern void tick(ChakraJavascriptEngine& engine, double ms);
extern void animate(ChakraJavascriptEngine& engine);
#endif

extern void attachTimers(DukJavascriptEngine& engine);
extern void tick(DukJavascriptEngine& engine, double ms);
extern void animate(DukJavascriptEngine& engine);

#endif //#define DUKSFML_TIMEREXTENSIONS_HPP
