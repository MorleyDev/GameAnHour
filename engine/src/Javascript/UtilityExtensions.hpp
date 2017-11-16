#ifndef DUKSFML_UTILITYEXTENSIONS_HPP
#define DUKSFML_UTILITYEXTENSIONS_HPP

#include "DukJavascriptEngine.hpp"

#ifdef GAM_CHAKRA_ENABLE
#include "ChakraJavascriptEngine.hpp"
#endif//GAM_CHAKRA_ENABLE

extern void attachUtility(DukJavascriptEngine& engine);

#ifdef GAM_CHAKRA_ENABLE
extern void attachUtility(ChakraJavascriptEngine& engine);
#endif//GAM_CHAKRA_ENABLE

#endif//DUKSFML_UTILITYEXTENSIONS_HPP
