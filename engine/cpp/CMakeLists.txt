cmake_minimum_required(VERSION 3.6)
project(DukSFML)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++17")

include_directories("./ext/include")
link_directories("./ext/lib")

add_executable(Duck duktape.c src/main.cpp src/Javascript/JavascriptEngine.cpp src/Javascript/TimerExtensions.cpp src/Javascript/TimerExtensions.hpp)
target_link_libraries(Duck sfml-graphics sfml-system sfml-window)
