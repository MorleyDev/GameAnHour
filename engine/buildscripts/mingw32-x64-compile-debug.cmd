mkdir build
pushd build
	mkdir debug-mingw32x64
	pushd debug-mingw32x64
		cmake ..\.. -G"MinGW Makefiles" -DCMAKE_BUILD_TYPE=Debug
		cmake --build . --config debug
	popd
popd

mkdir bin
pushd bin
	mkdir debug-mingw32x64
	pushd debug-mingw32x64
		xcopy ..\..\build\debug-mingw32x64\*.exe .\ /S /Y
		xcopy ..\..\ext\bin\debug-mingw32x64\*.dll .\ /S /Y
	popd
popd
