mkdir build
pushd build
	mkdir release-mingw32
	pushd release-mingw32
		cmake ..\.. -G"MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release
		cmake --build . --config release
	popd
popd

mkdir bin
pushd bin
	mkdir release-mingw32
	pushd release-mingw32
		xcopy ..\..\build\release-mingw32\*.exe .\ /S /Y
		xcopy ..\..\ext\bin\release-mingw32\*.dll .\ /S /Y
	popd
popd
