mkdir build
pushd build
	mkdir debug-mingw32
	pushd debug-mingw32
		cmake ..\.. -G"MinGW Makefiles" -DCMAKE_BUILD_TYPE=Debug
		cmake --build . --config debug
	popd
popd

mkdir bin
pushd bin
	mkdir debug-mingw32
	pushd debug-mingw32
		xcopy ..\..\build\debug-mingw32\*.exe .\ /S /Y
		xcopy ..\..\ext\bin\debug-mingw32\*.dll .\ /S /Y
	popd
popd
