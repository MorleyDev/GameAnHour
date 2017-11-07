cmake_minimum_required(VERSION 3.6)
project(GameAnHour)

add_executable(GameAnHour
        src/main.cpp
        src/Javascript/JavascriptEngine.cpp
        src/Javascript/TimerExtensions.cpp
        src/Javascript/SfmlExtensions.cpp
        src/Profile/Profiler.cpp
        src/Javascript/Box2dExtensions.cpp
        src/Javascript/ReduxExtensions.cpp)
